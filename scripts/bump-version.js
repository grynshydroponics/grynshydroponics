import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const pkgPath = path.join(root, 'package.json')

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const current = pkg.version || '0.0.0'

const part = process.argv[2] || 'minor' // 'patch' | 'minor' | 'major'
const [major, minor, patch] = current.split('.').map(Number)

let next
if (part === 'patch') {
  next = [major, minor, (patch || 0) + 1]
} else if (part === 'minor') {
  next = [major, (minor || 0) + 1, 0]
} else if (part === 'major') {
  next = [(major || 0) + 1, 0, 0]
} else {
  console.error('Usage: node scripts/bump-version.js [patch|minor|major]')
  process.exit(1)
}

const nextVersion = next.join('.')
pkg.version = nextVersion
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
console.log('Bumped version:', current, '->', nextVersion)
