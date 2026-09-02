import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'

function ErrorFallback({ error, onReset }) {
  const { t } = useTranslation()
  const showDetails = import.meta.env.DEV && error?.message

  return (
    <div className="flex min-h-[50vh] flex-1 items-center justify-center bg-gray-50 p-4 dark:bg-slate-900">
      <Card className="w-full max-w-md text-center dark:border-slate-700 dark:bg-slate-800">
        <CardBody className="flex flex-col items-center gap-6 py-12">
          <AlertTriangle className="h-16 w-16 text-amber-500" />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {t('errorBoundary.title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('errorBoundary.message')}
            </p>
          </div>

          {showDetails && (
            <pre className="max-h-32 w-full overflow-auto rounded-md bg-gray-100 p-3 text-left text-xs text-red-700 dark:bg-slate-900 dark:text-red-300">
              {error.message}
            </pre>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={onReset}>{t('common.retry')}</Button>
            <Button variant="outline" onClick={() => { window.location.href = '/' }}>
              {t('errorBoundary.backHome')}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
