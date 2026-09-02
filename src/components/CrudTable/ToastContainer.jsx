import { cn } from '@/utils/cn'

export function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-toast flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'rounded-xl px-4 py-2.5 text-sm font-medium shadow-xl transition-all',
            t.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
