import { cn } from '../lib/utils'

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  danger?: boolean
  onConfirm: () => void
}

export default function ConfirmDialog({
  options,
  onClose,
}: {
  options: ConfirmOptions
  onClose: () => void
}) {
  const { title, message, confirmText = '确定', danger, onConfirm } = options
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/45" onClick={onClose} />
      <div className="sheet-in relative w-full max-w-xs rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {message}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 flex-1 rounded-lg border border-zinc-200 text-sm text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={cn(
              'h-9 flex-1 rounded-lg text-sm font-medium text-white transition',
              danger
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-violet-600 hover:bg-violet-500',
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
