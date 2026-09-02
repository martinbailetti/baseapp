import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const buildId = Date.now().toString(36)
const swPath = join(__dirname, '..', 'dist', 'sw.js')
const htmlPaths = [
  join(__dirname, '..', 'dist', 'index.html'),
  join(__dirname, '..', 'dist', 'qr-login.html'),
]

if (existsSync(swPath)) {
  let content = readFileSync(swPath, 'utf8')
  content = content.replace('__BUILD_ID__', buildId)
  writeFileSync(swPath, content, 'utf8')
  console.log(`[stamp-sw] Build ID: ${buildId} stamped into sw.js`)
} else {
  console.warn('[stamp-sw] sw.js not found in dist/')
}

for (const htmlPath of htmlPaths) {
  if (!existsSync(htmlPath)) continue

  let html = readFileSync(htmlPath, 'utf8')
  const replaced = html.replace(
    /(rel=["']manifest["'][^>]*href=["'][^"']*manifest\.json)(?:\?[^"']*)?(["'])/i,
    `$1?v=${buildId}$2`
  )

  if (replaced !== html) {
    writeFileSync(htmlPath, replaced, 'utf8')
    console.log(`[stamp-sw] Manifest URL versioned in ${htmlPath.split('dist\\')[1] || 'html'}`)
  }
}
