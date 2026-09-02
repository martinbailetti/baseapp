import { useNavigate } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'

const UnauthorizedPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardBody className="flex flex-col items-center gap-6 py-12">
          <ShieldX className="h-16 w-16 text-red-400" />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-gray-800">{t('unauthorized.title')}</h1>
            <p className="text-sm text-gray-500">
              {t('unauthorized.message')}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            {t('unauthorized.backHome')}
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}

export default UnauthorizedPage
