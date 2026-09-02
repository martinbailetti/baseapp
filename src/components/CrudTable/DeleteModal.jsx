import { useTranslation } from 'react-i18next'

export function DeleteModal({ onConfirm, onCancel }) {
  const { t } = useTranslation()

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50">
      <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-2xl w-full max-w-sm mx-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('common.confirmDeleteTitle', 'Confirmar eliminación')}</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
          {t('common.confirmDeleteBody', '¿Seguro que quieres eliminar este registro?')}
        </p>
        <p className="mt-1 text-xs text-red-500">{t('common.confirmDeleteSub', 'Esta acción no se puede deshacer.')}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            {t('common.cancel', 'Cancelar')}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            {t('common.delete', 'Eliminar')}
          </button>
        </div>
      </div>
    </div>
  )
}
