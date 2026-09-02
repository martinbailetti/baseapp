import Spinner from '@/components/ui/Spinner'

const LoadingPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500">Iniciando sesión...</p>
    </div>
  </div>
)

export default LoadingPage
