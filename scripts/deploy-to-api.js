import { cpSync, existsSync, rmSync, readdirSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function resolveApiPublicPath(baseDir = __dirname) {
  return join(baseDir, '..', '..', 'baseapi', 'public')
}

export function runDeploy() {
  const distPath = join(__dirname, '..', 'dist')
  const apiPublicPath = resolveApiPublicPath()

  // Verificar que dist existe
  if (!existsSync(distPath)) {
    console.error('❌ Error: dist/ no existe. Ejecuta "npm run build" primero.')
    process.exit(1)
  }

  // Verificar que baseapi/public existe
  if (!existsSync(apiPublicPath)) {
    console.error('❌ Error: ../baseapi/public/ no existe.')
    process.exit(1)
  }

  console.log('🚀 Desplegando webapp a API backend...')

  // Limpiar archivos del build anterior (excepto carpetas del backend)
  const keepDirs = ['js']

  try {
    const files = readdirSync(apiPublicPath)
    files.forEach((file) => {
      if (!keepDirs.includes(file)) {
        const fullPath = join(apiPublicPath, file)
        rmSync(fullPath, { recursive: true, force: true })
        console.log(`  🗑️  Eliminado: ${file}`)
      }
    })
  } catch {
    console.warn('⚠️  No se pudo limpiar public/, continuando...')
  }

  try {
    cpSync(distPath, apiPublicPath, {
      recursive: true,
      filter: (src) => {
        const base = basename(src)
        const isInDist = src.startsWith(distPath)
        if (isInDist && keepDirs.includes(base)) {
          return false
        }
        return true
      },
    })
    console.log('✅ Webapp desplegada en ../baseapi/public/')
    console.log('📦 La API y la webapp ahora están en la misma URL')
    console.log('')
    console.log('Para probar:')
    console.log('  cd ../baseapi')
    console.log('  php -S localhost:8888 index.php')
    console.log('  Abrir http://localhost:8888')
  } catch (err) {
    console.error('❌ Error al copiar archivos:', err.message)
    process.exit(1)
  }
}

const isDirectExecution = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isDirectExecution) {
  runDeploy()
}
