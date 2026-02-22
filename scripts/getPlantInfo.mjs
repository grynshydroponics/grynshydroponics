#!/usr/bin/env node
/**
 * Fetches plant info from Perenual API and writes a JSON file for app preload.
 * Run from project root:
 *   PERENUAL_API_KEY=your_key node scripts/getPlantInfo.mjs
 * Or add PERENUAL_API_KEY to .env and run: node scripts/getPlantInfo.mjs
 *
 * Config: getPlantInfo.json (queries = search terms, speciesIds = exact Perenual IDs)
 * Output: plantLibrary.generated.json (drop into src/data/ or import in app when ready)
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const BASE_URL = 'https://perenual.com/api/v2/'
const CARE_GUIDE_BASE = 'https://perenual.com/api/'

function getApiKey() {
  const env = process.env.PERENUAL_API_KEY || process.env.VITE_PERENUAL_API_KEY
  if (env) return env.trim()
  try {
    const keyPath = join(ROOT, 'mykey.md')
    const content = readFileSync(keyPath, 'utf8')
    const line = content.split(/\r?\n/)[0]?.trim()
    if (line && !line.startsWith('#')) return line
  } catch (_) {}
  return ''
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  return res.json()
}

async function searchPlants(apiKey, query) {
  const params = new URLSearchParams({ key: apiKey, q: query || '' })
  const url = `${BASE_URL}species-list?${params}`
  return fetchJson(url)
}

async function getPlantDetails(apiKey, id) {
  const params = new URLSearchParams({ key: apiKey })
  const url = `${BASE_URL}species/details/${id}?${params}`
  return fetchJson(url)
}

async function getGrowthStages(apiKey, speciesId) {
  const params = new URLSearchParams({ key: apiKey, species_id: String(speciesId) })
  const url = `${CARE_GUIDE_BASE}species-care-guide-list?${params}`
  return fetchJson(url)
}

function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'plant'
}

function estimateGrowthDuration(details, careGuideList) {
  const cycle = details?.cycle ?? null
  const sections = (careGuideList?.data || []).flatMap((g) => g.section || [])
  const maintenance = sections.find(
    (s) =>
      s.type &&
      (String(s.type).toLowerCase().includes('maintenance') ||
        String(s.type).toLowerCase().includes('pruning'))
  )
  if (maintenance?.description) {
    const d = String(maintenance.description).toLowerCase()
    if (d.includes('weekly') || d.includes('every week')) return { estimatedDaysToHarvest: 60, cycle }
    if (d.includes('monthly') || d.includes('every month')) return { estimatedDaysToHarvest: 90, cycle }
    if (d.includes('yearly') || d.includes('once a year')) return { estimatedDaysToHarvest: 180, cycle }
  }
  if (cycle) {
    const c = String(cycle).toLowerCase()
    if (c === 'annual') return { estimatedDaysToHarvest: 90, cycle }
    if (c === 'perennial') return { estimatedDaysToHarvest: 180, cycle }
    if (c === 'biennial' || c === 'biannual') return { estimatedDaysToHarvest: 365, cycle }
  }
  return { estimatedDaysToHarvest: null, cycle }
}

function mapToAppSchema(details, careGuide) {
  const name = details?.common_name || 'Unknown'
  const id = slug(name)
  const image =
    details?.default_image?.original_url ?? details?.default_image?.regular_url ?? null
  const { estimatedDaysToHarvest, cycle } = estimateGrowthDuration(details, careGuide)
  return {
    id: id || String(details.id),
    name,
    perenualId: details.id,
    image,
    cycle: cycle ?? null,
    estimatedDaysToHarvest,
    scientific_name: details?.scientific_name?.[0] ?? null,
    watering: details?.watering ?? null,
    sunlight: details?.sunlight ?? null,
  }
}

async function main() {
  const apiKey = getApiKey()
  if (!apiKey) {
    console.error('Set PERENUAL_API_KEY (or put key in mykey.md) and run again.')
    process.exit(1)
  }

  const configPath = join(ROOT, 'getPlantInfo.json')
  let config
  try {
    config = JSON.parse(readFileSync(configPath, 'utf8'))
  } catch (e) {
    console.error('Failed to read getPlantInfo.json:', e.message)
    process.exit(1)
  }

  const queries = config.queries || []
  const speciesIds = config.speciesIds || []
  const seenIds = new Set(speciesIds)

  const results = []

  for (const query of queries) {
    if (!query || typeof query !== 'string') continue
    console.log('Searching:', query)
    try {
      const list = await searchPlants(apiKey, query)
      const first = list?.data?.[0]
      if (!first) {
        console.warn('  No result for:', query)
        continue
      }
      if (seenIds.has(first.id)) continue
      seenIds.add(first.id)
      const details = await getPlantDetails(apiKey, first.id)
      const careGuide = await getGrowthStages(apiKey, first.id)
      results.push(mapToAppSchema(details, careGuide))
      console.log('  →', details.common_name, '(id', first.id + ')')
    } catch (e) {
      console.warn('  Error:', e.message)
    }
  }

  for (const id of speciesIds) {
    if (results.some((r) => r.perenualId === id)) continue
    console.log('Fetching species id:', id)
    try {
      const details = await getPlantDetails(apiKey, id)
      const careGuide = await getGrowthStages(apiKey, id)
      results.push(mapToAppSchema(details, careGuide))
      console.log('  →', details.common_name)
    } catch (e) {
      console.warn('  Error:', e.message)
    }
  }

  const outputPath = join(ROOT, 'plantLibrary.generated.json')
  writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8')
  console.log('\nWrote', outputPath, '(', results.length, 'plants)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
