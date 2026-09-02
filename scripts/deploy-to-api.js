import { cpSync, existsSync, rmSync, readdirSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const distPath = join(__dirname, '..', 'dist')
const apiPublicPath = join(__dirname, '..', '..', 'api', 'public')

// Verificar que dist existe
if (!existsSync(distPath)) {
  console.error('❌ Error: dist/ no existe. Ejecuta "npm run build" primero.')
  process.exit(1)
}

// Verificar que api/public existe
if (!existsSync(apiPublicPath)) {
  console.error('❌ Error: ../api/public/ no existe.')
  process.exit(1)
}

console.log('🚀 Desplegando webapp a API backend...')

// Limpiar archivos del build anterior (excepto carpetas del backend)
const keepDirs = ['js'] // Mantener carpeta js/ del backend (datatable.js, etc.)

try {
  const files = readdirSync(apiPublicPath)
  files.forEach(file => {
    if (!keepDirs.includes(file)) {
      const fullPath = join(apiPublicPath, file)
      rmSync(fullPath, { recursive: true, force: true })
      console.log(`  🗑️  Eliminado: ${file}`)
    }
  })
} catch (err) {
  console.warn('⚠️  No se pudo limpiar public/, continuando...')
}

// Copiar dist a api/public
try {
  cpSync(distPath, apiPublicPath, { 
    recursive: true,
    filter: (src) => {
      // No sobreescribir la carpeta js/ del backend
      const base = basename(src)
      const isInDist = src.startsWith(distPath)
      if (isInDist && keepDirs.includes(base)) {
        return false
      }
      return true
    }
  })
  console.log('✅ Webapp desplegada en ../api/public/')
  console.log('📦 La API y la webapp ahora están en la misma URL')
  console.log('')
  console.log('Para probar:')
  console.log('  cd ../api')
  console.log('  php -S localhost:8888 index.php')
  console.log('  Abrir http://localhost:8888')
} catch (err) {
  console.error('❌ Error al copiar archivos:', err.message)
  process.exit(1)
}
