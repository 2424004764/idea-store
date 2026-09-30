import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export default function Modal({ title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="sheet-in relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-zinc-200 bg-white shadow-2xl sm:max-h-[85dvh] sm:max-w-lg sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-100 px-5 dark:border-zinc-800">
          <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>
        <div className="nice-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-zinc-100 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-zinc-800">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
