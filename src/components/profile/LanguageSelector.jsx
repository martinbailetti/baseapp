import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/hooks/useLanguage'
import { LANGUAGES } from '@/config/pageConfigs'

const LanguageSelector = () => {
  const { t } = useTranslation()
  const { lang, changeLanguage } = useLanguage()

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
          <Languages className="h-5 w-5 text-indigo-400" />
        </div>
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{t('profile.language')}</p>
      </div>
      <div className="flex gap-1">
        {LANGUAGES.map(({ code, label, title }) => (
          <button
            key={code}
            title={title}
            onClick={() => changeLanguage(code)}
            className={[
              'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
              lang === code
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default LanguageSelector