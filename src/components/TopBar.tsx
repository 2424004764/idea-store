import { useState } from 'react'
import {
  Menu,
  Search,
  Plus,
  Sun,
  Moon,
  LayoutGrid,
  List,
  Layers,
  Tag as TagIcon,
} from 'lucide-react'
import type { ItemType } from '../types'
import { TYPE_META, TYPE_ORDER } from '../lib/typeMeta'
import { useUi } from '../store/ui'
import { cn } from '../lib/utils'

export type TypeFilter = 'all' | ItemType
export type SortKey = 'newest' | 'oldest' | 'title'
export type ViewMode = 'grid' | 'list'

interface TopBarProps {
  title: string
  breadcrumbs?: string[]
  count: number
  search: string
  onSearchChange: (value: string) => void
  typeFilter: TypeFilter
  onTypeFilterChange: (value: TypeFilter) => void
  tags: string[]
  allTags: string[]
  onToggleTag: (tag: string) => void
  onClearFilters: () => void
  sort: SortKey
  onSortChange: (value: SortKey) => void
  view: ViewMode
  onViewChange: (value: ViewMode) => void
  onMenu: () => void
  currentFolderId?: string | null
}

function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )
  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('ideastore:theme', next ? 'dark' : 'light')
    } catch {
      // ignore
    }
  }
  return (
    <button
      type="button"
      aria-label="切换深色模式"
      title="切换深色模式"
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

export default function TopBar(props: TopBarProps) {
  const {
    title,
    breadcrumbs,
    count,
    search,
    onSearchChange,
    typeFilter,
    onTypeFilterChange,
    tags,
    allTags,
    onToggleTag,
    onClearFilters,
    sort,
    onSortChange,
    view,
    onViewChange,
    onMenu,
    currentFolderId,
  } = props
  const ui = useUi()

  const hasActiveFilter =
    search.trim() !== '' || typeFilter !== 'all' || tags.length > 0

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-zinc-100/85 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/85">
      <div className="flex h-14 items-center gap-2 px-4 sm:h-16 sm:px-6">
        <button
          type="button"
          aria-label="打开菜单"
          onClick={onMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 lg:hidden"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0 flex-1">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <div className="flex min-w-0 items-center gap-1 text-xs text-zinc-400">
              {breadcrumbs.slice(0, -1).map((name, i) => (
                <span key={i} className="max-w-24 truncate">
                  {name}
                  <span className="mx-1">/</span>
                </span>
              ))}
            </div>
          ) : null}
          <h1 className="flex min-w-0 items-baseline gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <span className="truncate">{title}</span>
            <span className="shrink-0 text-xs font-normal text-zinc-400">
              {count} 条
            </span>
          </h1>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <select
            aria-label="排序方式"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="hidden h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm text-zinc-600 outline-none transition hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 sm:block"
          >
            <option value="newest">最新优先</option>
            <option value="oldest">最早优先</option>
            <option value="title">按标题</option>
          </select>
          <div className="flex h-9 items-center overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              aria-label="网格视图"
              title="网格视图"
              onClick={() => onViewChange('grid')}
              className={cn(
                'flex h-full w-9 items-center justify-center transition',
                view === 'grid'
                  ? 'bg-zinc-200/70 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200',
              )}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              aria-label="列表视图"
              title="列表视图"
              onClick={() => onViewChange('list')}
              className={cn(
                'flex h-full w-9 items-center justify-center transition',
                view === 'list'
                  ? 'bg-zinc-200/70 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200',
              )}
            >
              <List size={15} />
            </button>
          </div>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => ui.openItemEditor(undefined, { folderId: currentFolderId })}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-violet-500 active:scale-[0.98]"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">新建素材</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 pb-3 sm:px-6">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索标题、内容、标签…"
            className="h-9 w-full rounded-full border border-zinc-200 bg-white pl-9 pr-8 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          {search && (
            <button
              type="button"
              aria-label="清空搜索"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-1.5 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            >
              ✕
            </button>
          )}
        </div>
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => onTypeFilterChange('all')}
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition',
              typeFilter === 'all'
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
            )}
          >
            <Layers size={12} />
            全部
          </button>
          {TYPE_ORDER.map((t) => {
            const meta = TYPE_META[t]
            const active = typeFilter === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => onTypeFilterChange(t)}
                className={cn(
                  'flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition',
                  active
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
                )}
              >
                <meta.icon size={12} />
                {meta.label}
              </button>
            )
          })}
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto px-4 pb-3 sm:px-6">
          <TagIcon size={13} className="shrink-0 text-zinc-400" />
          {allTags.map((t) => {
            const active = tags.includes(t)
            return (
              <button
                key={t}
                type="button"
                onClick={() => onToggleTag(t)}
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1 text-xs transition',
                  active
                    ? 'bg-violet-600 font-medium text-white'
                    : 'bg-zinc-200/70 text-zinc-500 hover:bg-zinc-300/70 hover:text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200',
                )}
              >
                # {t}
              </button>
            )
          })}
          {hasActiveFilter && (
            <button
              type="button"
              onClick={onClearFilters}
              className="shrink-0 px-2 py-1 text-xs text-violet-500 transition hover:text-violet-600"
            >
              清除筛选
            </button>
          )}
        </div>
      )}
    </header>
  )
}
