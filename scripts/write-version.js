import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
const version = pkg.version || '0.0.0'
const outPath = path.join(root, 'public', 'version.json')
writeFileSync(outPath, JSON.stringify({ version }) + '\n', 'utf8')
console.log('Wrote version.json:', version)
