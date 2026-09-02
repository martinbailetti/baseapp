import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { usePwaInstall } from '@/hooks/usePwaInstall'

const ENABLED = import.meta.env.VITE_ENABLE_INSTALL_PROMPT === 'true'

const isMobileDevice = () =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  window.innerWidth < 768

const PwaInstallBanner = () => {
  const { canInstall, install, dismiss } = usePwaInstall()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(isMobileDevice())
  }, [])

  if (!ENABLED || !isMobile || !canInstall) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-dropdown flex items-center justify-between gap-3 bg-indigo-600 px-4 py-3 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <Download className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Instalar aplicacion</p>
          <p className="text-xs text-indigo-200">Accede rapido desde tu pantalla de inicio</p>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          onClick={install}
          className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
        >
          Instalar
        </button>
        <button onClick={dismiss} className="p-1 text-indigo-200 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default PwaInstallBanner
