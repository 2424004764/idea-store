import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLibrary } from '../store/library'
import { useUi } from '../store/ui'
import { collectTags, getDescendantFolderIds, getFolderPath } from '../lib/utils'
import TopBar, { type SortKey, type TypeFilter, type ViewMode } from '../components/TopBar'
import ItemCard from '../components/ItemCard'
import EmptyState from '../components/EmptyState'

export interface LibraryPageProps {
  collection: 'all' | 'favorites' | 'uncategorized' | 'folder'
}

export default function LibraryPage({ collection }: LibraryPageProps) {
  const { folderId } = useParams()
  const navigate = useNavigate()
  const { items, folders } = useLibrary()
  const ui = useUi()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sort, setSort] = useState<SortKey>('newest')
  const [view, setView] = useState<ViewMode>('grid')

  const folder = folders.find((f) => f.id === folderId)

  // 被查看的文件夹已删除时回到首页
  useEffect(() => {
    if (collection === 'folder' && folderId && !folder) {
      navigate('/', { replace: true })
    }
  }, [collection, folder, folderId, navigate])

  // 切换视图（全部/收藏/不同文件夹）时重置搜索词
  useEffect(() => {
    setSearch('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, folderId])

  const scope = useMemo(() => {
    if (collection === 'favorites') return items.filter((i) => i.favorite)
    if (collection === 'uncategorized') return items.filter((i) => !i.folderId)
    if (collection === 'folder' && folder) {
      const ids = getDescendantFolderIds(folders, folder.id)
      return items.filter((i) => i.folderId && ids.has(i.folderId))
    }
    return items
  }, [items, folders, collection, folder])

  const allTags = useMemo(() => collectTags(items), [items])

  const filtered = useMemo(() => {
    let list = scope
    if (typeFilter !== 'all') list = list.filter((i) => i.type === typeFilter)
    if (selectedTags.length) {
      list = list.filter((i) => selectedTags.some((t) => i.tags.includes(t)))
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((i) =>
        [i.title, i.content, i.url, i.author, i.source, ...i.tags]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    }
    const sorted = [...list]
    if (sort === 'newest') sorted.sort((a, b) => b.createdAt - a.createdAt)
    else if (sort === 'oldest') sorted.sort((a, b) => a.createdAt - b.createdAt)
    else
      sorted.sort((a, b) =>
        (a.title || a.content || a.url).localeCompare(
          b.title || b.content || b.url,
          'zh-Hans-CN',
        ),
      )
    return sorted
  }, [scope, typeFilter, selectedTags, search, sort])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setSelectedTags([])
  }

  const hasActiveFilter =
    search.trim() !== '' || typeFilter !== 'all' || selectedTags.length > 0

  let title = '全部素材'
  let breadcrumbs: string[] | undefined
  if (collection === 'favorites') title = '收藏'
  else if (collection === 'uncategorized') title = '未分类'
  else if (collection === 'folder' && folder) {
    breadcrumbs = getFolderPath(folders, folder.id).map((f) => f.name)
    title = breadcrumbs[breadcrumbs.length - 1] ?? '文件夹'
  }

  const openCreate = () =>
    ui.openItemEditor(undefined, { folderId: collection === 'folder' ? folderId : null })

  return (
    <div>
      <TopBar
        title={title}
        breadcrumbs={breadcrumbs}
        count={filtered.length}
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        tags={selectedTags}
        allTags={allTags}
        onToggleTag={toggleTag}
        onClearFilters={clearFilters}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
        onMenu={ui.openDrawer}
        currentFolderId={collection === 'folder' ? folderId : null}
      />

      <div className="px-4 pb-20 pt-5 sm:px-6">
        {filtered.length === 0 ? (
          hasActiveFilter ? (
            <EmptyState
              title="没有匹配的素材"
              description="换个关键词或放宽筛选条件试试。"
              actionLabel="清除筛选"
              onAction={clearFilters}
            />
          ) : (
            <EmptyState
              title={items.length === 0 ? '还没有素材' : '这里还是空的'}
              description={
                items.length === 0
                  ? '把打动你的文案、图片、链接和神评论都收进来吧。'
                  : '点击右上角「新建素材」，往这里添加第一条灵感。'
              }
              actionLabel="新建素材"
              onAction={openCreate}
            />
          )
        ) : view === 'grid' ? (
          <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} view={view} onTagClick={toggleTag} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} view={view} onTagClick={toggleTag} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
