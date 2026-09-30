import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/utils'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
}

export default function TagInput({ value, onChange, suggestions = [] }: TagInputProps) {
  const [draft, setDraft] = useState('')

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/^#/, '')
    if (!tag || value.includes(tag) || value.length >= 8) return
    onChange([...value, tag])
    setDraft('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(draft)
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  const filtered = suggestions
    .filter((s) => !value.includes(s) && (!draft || s.includes(draft.trim())))
    .slice(0, 8)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-zinc-200 bg-white p-2 transition focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-800/60">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-md bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
          >
            {tag}
            <button
              type="button"
              aria-label={`移除标签 ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="rounded-full p-0.5 text-violet-400 transition hover:bg-violet-200/60 hover:text-violet-700 dark:hover:bg-violet-500/30 dark:hover:text-violet-200"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft.trim() && addTag(draft)}
          placeholder={value.length ? '继续添加…' : '输入后回车添加标签'}
          className="min-w-[100px] flex-1 bg-transparent px-1 py-0.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
        />
      </div>
      {filtered.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className={cn(
                'rounded-full border border-dashed border-zinc-300 px-2 py-0.5 text-xs text-zinc-400 transition',
                'hover:border-violet-400 hover:text-violet-600 dark:border-zinc-600 dark:hover:border-violet-500 dark:hover:text-violet-400',
              )}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
