import { Sparkles, Plus } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-500 dark:from-violet-500/15 dark:to-indigo-500/15 dark:text-violet-400">
        <Sparkles size={28} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-zinc-800 dark:text-zinc-100">
        {title}
      </h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-zinc-400">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 flex h-10 items-center gap-1.5 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-violet-500 active:scale-[0.98]"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  )
}
