import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Sparkles,
  Layers,
  Star,
  Inbox,
  FolderPlus,
  Folder as FolderIcon,
  ChevronRight,
  MoreHorizontal,
  X,
  FolderOpen,
} from 'lucide-react'
import type { Folder } from '../types'
import { useLibrary } from '../store/library'
import { useUi } from '../store/ui'
import { cn, getDescendantFolderIds } from '../lib/utils'

interface SidebarProps {
  mobile?: boolean
  onClose?: () => void
}

export default function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const { items, folders, deleteFolder, resetData } = useLibrary()
  const ui = useUi()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const childrenOf = useMemo(() => {
    const map = new Map<string | null, Folder[]>()
    for (const f of folders) {
      const key = f.parentId ?? null
      const list = map.get(key) ?? []
      list.push(f)
      map.set(key, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
    }
    return map
  }, [folders])

  const folderCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const f of folders) {
      const ids = getDescendantFolderIds(folders, f.id)
      map.set(f.id, items.filter((it) => it.folderId && ids.has(it.folderId)).length)
    }
    return map
  }, [folders, items])

  const favoriteCount = items.filter((it) => it.favorite).length
  const uncategorizedCount = items.filter((it) => !it.folderId).length

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const askDeleteFolder = (f: Folder) => {
    setMenuOpenId(null)
    ui.confirm({
      title: `删除文件夹「${f.name}」`,
      message: '文件夹内的素材和子文件夹会自动移到上一级，不会丢失。',
      confirmText: '删除',
      danger: true,
      onConfirm: () => {
        deleteFolder(f.id)
        ui.toast('文件夹已删除')
      },
    })
  }

  const renderTree = (parentId: string | null, depth: number) =>
    (childrenOf.get(parentId) ?? []).map((f) => {
      const children = childrenOf.get(f.id) ?? []
      const isCollapsed = collapsed.has(f.id)
      return (
        <div key={f.id}>
          <div className="relative flex items-center">
            {children.length > 0 ? (
              <button
                type="button"
                aria-label={isCollapsed ? '展开' : '收起'}
                onClick={() => toggleCollapse(f.id)}
                className="flex h-7 w-5 shrink-0 items-center justify-center text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <ChevronRight
                  size={14}
                  className={cn('transition-transform', !isCollapsed && 'rotate-90')}
                />
              </button>
            ) : (
              <span className="w-5 shrink-0" />
            )}
            <NavLink
              to={`/folder/${f.id}`}
              onClick={onClose}
              style={{ paddingLeft: 6 + depth * 12 }}
              className={({ isActive }) =>
                cn(
                  'flex min-w-0 flex-1 items-center gap-1.5 rounded-lg py-1.5 pr-2 text-sm transition',
                  isActive
                    ? 'bg-violet-50 font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/70',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <FolderOpen size={15} className="shrink-0 opacity-80" />
                  ) : (
                    <FolderIcon size={15} className="shrink-0 text-zinc-400" />
                  )}
                  <span className="truncate">{f.name}</span>
                  <span className="ml-auto shrink-0 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                    {folderCounts.get(f.id) ?? 0}
                  </span>
                </>
              )}
            </NavLink>
            <button
              type="button"
              aria-label={`操作 ${f.name}`}
              onClick={() => setMenuOpenId(menuOpenId === f.id ? null : f.id)}
              className="ml-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-200/70 hover:text-zinc-700 dark:hover:bg-zinc-700/70 dark:hover:text-zinc-200"
            >
              <MoreHorizontal size={14} />
            </button>
            {menuOpenId === f.id && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpenId(null)} />
                <div className="absolute right-0 top-7 z-30 w-32 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 text-sm shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700/60"
                    onClick={() => {
                      setMenuOpenId(null)
                      ui.openFolderEditor(undefined, f.id)
                    }}
                  >
                    <FolderPlus size={13} /> 子文件夹
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700/60"
                    onClick={() => {
                      setMenuOpenId(null)
                      ui.openFolderEditor(f)
                    }}
                  >
                    <Sparkles size={13} /> 重命名
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                    onClick={() => askDeleteFolder(f)}
                  >
                    <X size={13} /> 删除
                  </button>
                </div>
              </>
            )}
          </div>
          {children.length > 0 && !isCollapsed && renderTree(f.id, depth + 1)}
        </div>
      )
    })

  const quickLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
      isActive
        ? 'bg-violet-50 font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
        : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/70',
    )

  return (
    <aside
      className={cn(
        'flex h-full w-64 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900',
        !mobile && 'hidden lg:flex',
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-zinc-100 px-4 dark:border-zinc-800/70">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-sm">
          <Sparkles size={18} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold leading-tight text-zinc-900 dark:text-zinc-50">
            灵感素材库
          </div>
          <div className="text-[11px] leading-tight text-zinc-400">IdeaStore</div>
        </div>
        {mobile && (
          <button
            type="button"
            aria-label="关闭侧栏"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="nice-scroll flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        <NavLink to="/" end onClick={onClose} className={quickLinkClass}>
          <Layers size={16} className="shrink-0 text-zinc-400" />
          全部素材
          <span className="ml-auto text-[11px] tabular-nums text-zinc-400">
            {items.length}
          </span>
        </NavLink>
        <NavLink to="/favorites" onClick={onClose} className={quickLinkClass}>
          <Star size={16} className="shrink-0 text-zinc-400" />
          收藏
          <span className="ml-auto text-[11px] tabular-nums text-zinc-400">
            {favoriteCount}
          </span>
        </NavLink>
        <NavLink to="/uncategorized" onClick={onClose} className={quickLinkClass}>
          <Inbox size={16} className="shrink-0 text-zinc-400" />
          未分类
          <span className="ml-auto text-[11px] tabular-nums text-zinc-400">
            {uncategorizedCount}
          </span>
        </NavLink>

        <div className="flex items-center justify-between px-3 pb-1 pt-4">
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">文件夹</span>
          <button
            type="button"
            aria-label="新建文件夹"
            title="新建文件夹"
            onClick={() => ui.openFolderEditor()}
            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-violet-600 dark:hover:bg-zinc-800 dark:hover:text-violet-400"
          >
            <FolderPlus size={14} />
          </button>
        </div>
        <div className="space-y-0.5">{renderTree(null, 0)}</div>
      </nav>

      <div className="shrink-0 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800/70">
        <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <span>
            {items.length} 条素材 · {folders.length} 个文件夹
          </span>
          <button
            type="button"
            onClick={() =>
              ui.confirm({
                title: '重置示例数据',
                message: '当前所有改动会被清空，恢复为初始示例数据。',
                confirmText: '重置',
                danger: true,
                onConfirm: () => {
                  resetData()
                  ui.toast('已恢复示例数据')
                },
              })
            }
            className="transition hover:text-violet-500"
          >
            重置示例
          </button>
        </div>
      </div>
    </aside>
  )
}
