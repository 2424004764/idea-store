import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Copy,
  Star,
  Pencil,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Inbox,
} from 'lucide-react'
import type { LibraryItem } from '../types'
import { TYPE_META } from '../lib/typeMeta'
import { useLibrary } from '../store/library'
import { useUi } from '../store/ui'
import { cn, copyText, formatDate, prettyDomain } from '../lib/utils'
import type { ViewMode } from './TopBar'

function ImageThumb({ item }: { item: LibraryItem }) {
  const [err, setErr] = useState(false)
  if (err) {
    return (
      <div className="flex h-44 items-center justify-center rounded-t-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-300 dark:from-zinc-800 dark:to-zinc-800/40 dark:text-zinc-600">
        <ImageIcon size={32} />
      </div>
    )
  }
  return (
    <a href={item.url} target="_blank" rel="noreferrer" className="block">
      <img
        src={item.url}
        alt={item.title || '图片素材'}
        loading="lazy"
        onError={() => setErr(true)}
        className="max-h-96 w-full object-cover transition duration-300 hover:brightness-[1.03]"
      />
    </a>
  )
}

function IconButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string
  onClick: () => void
  className?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200',
        className,
      )}
    >
      {children}
    </button>
  )
}

export default function ItemCard({
  item,
  view,
  onTagClick,
}: {
  item: LibraryItem
  view: ViewMode
  onTagClick: (tag: string) => void
}) {
  const meta = TYPE_META[item.type]
  const { folders, toggleFavorite, deleteItem } = useLibrary()
  const ui = useUi()
  const folderName = folders.find((f) => f.id === item.folderId)?.name

  const copyPayload =
    item.type === 'link' || item.type === 'image' ? item.url : item.content

  const handleCopy = async () => {
    const ok = await copyText(copyPayload)
    ui.toast(ok ? '已复制到剪贴板' : '复制失败')
  }

  const askDelete = () => {
    ui.confirm({
      title: '删除素材',
      message: '删除后将无法恢复，确定要删除吗？',
      confirmText: '删除',
      danger: true,
      onConfirm: () => {
        deleteItem(item.id)
        ui.toast('已删除')
      },
    })
  }

  const starBtn = (
    <IconButton
      label={item.favorite ? '取消收藏' : '收藏'}
      onClick={() => toggleFavorite(item.id)}
      className={item.favorite ? 'text-amber-500 hover:text-amber-500' : ''}
    >
      <Star size={15} className={item.favorite ? 'fill-amber-400' : ''} />
    </IconButton>
  )

  if (view === 'list') {
    return (
      <article className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
        {item.type === 'image' && item.url ? (
          <img
            src={item.url}
            alt=""
            loading="lazy"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
            className="h-11 w-11 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', meta.tint)}>
            <meta.icon size={17} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
            {item.title || item.content || prettyDomain(item.url)}
          </p>
          <p className="mt-0.5 truncate text-xs text-zinc-400">
            {meta.label} · {folderName ?? '未分类'}
            {item.tags.length ? ` · ${item.tags.map((t) => `#${t}`).join(' ')}` : ''} ·{' '}
            {formatDate(item.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {starBtn}
          <IconButton label="编辑" onClick={() => ui.openItemEditor(item)}>
            <Pencil size={15} />
          </IconButton>
          <IconButton label="删除" onClick={askDelete} className="hover:text-red-500">
            <Trash2 size={15} />
          </IconButton>
        </div>
      </article>
    )
  }

  return (
    <article className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {item.type === 'image' && item.url && <ImageThumb item={item} />}
      <div className="p-4">
        {item.type === 'text' && (
          <>
            <p className="line-clamp-7 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
              {item.content}
            </p>
            {item.title && (
              <p className="mt-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                {item.title}
              </p>
            )}
          </>
        )}
        {item.type === 'comment' && (
          <div className="rounded-xl bg-zinc-50 px-3.5 py-3 dark:bg-zinc-800/60">
            <p className="line-clamp-6 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
              {item.content}
            </p>
            {(item.author || item.source) && (
              <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                —— {item.author || '匿名'}
                {item.source ? ` · 来自 ${item.source}` : ''}
              </p>
            )}
          </div>
        )}
        {item.type === 'link' && (
          <>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="group/link flex items-start gap-1.5 text-[15px] font-medium leading-snug text-violet-700 hover:underline dark:text-violet-400"
            >
              <span className="break-all line-clamp-2">
                {item.title || prettyDomain(item.url)}
              </span>
              <ExternalLink
                size={14}
                className="mt-0.5 shrink-0 opacity-0 transition group-hover/link:opacity-100"
              />
            </a>
            <p className="mt-1 truncate text-xs text-zinc-400">{item.url}</p>
          </>
        )}
        {item.type === 'image' && item.title && (
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            {item.title}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3">
        {item.folderId ? (
          <Link
            to={`/folder/${item.folderId}`}
            className="flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            <Inbox size={10} />
            {folderName}
          </Link>
        ) : (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
            未分类
          </span>
        )}
        {item.tags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTagClick(t)}
            className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] text-violet-600 transition hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/20"
          >
            # {t}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-zinc-300 dark:text-zinc-600">
          {formatDate(item.createdAt)}
        </span>
      </div>
      <div className="flex items-center gap-0.5 border-t border-zinc-100 px-3 py-1.5 dark:border-zinc-800/70">
        {starBtn}
        <IconButton label="复制内容" onClick={handleCopy}>
          <Copy size={15} />
        </IconButton>
        {(item.type === 'link' || item.type === 'image') && item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            title="打开链接"
            aria-label="打开链接"
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <ExternalLink size={15} />
          </a>
        )}
        <IconButton
          label="编辑"
          onClick={() => ui.openItemEditor(item)}
          className="ml-auto"
        >
          <Pencil size={15} />
        </IconButton>
        <IconButton label="删除" onClick={askDelete} className="hover:text-red-500">
          <Trash2 size={15} />
        </IconButton>
      </div>
    </article>
  )
}
