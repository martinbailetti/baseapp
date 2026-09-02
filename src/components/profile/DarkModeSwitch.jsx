import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDarkMode } from '@/hooks/useDarkMode'

const DarkModeSwitch = () => {
  const { t } = useTranslation()
  const [dark, setDark] = useDarkMode()

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
          {dark
            ? <Moon className="h-5 w-5 text-indigo-400" />
            : <Sun className="h-5 w-5 text-amber-500" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{t('profile.darkMode')}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">{dark ? t('profile.darkModeOn') : t('profile.darkModeOff')}</p>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={dark}
        onClick={() => setDark(v => !v)}
        className={[
          'relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          dark ? 'bg-indigo-600' : 'bg-gray-300',
        ].join(' ')}
      >
        <span
          className={[
            'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300',
            dark ? 'translate-x-7' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

export default DarkModeSwitch