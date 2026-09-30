import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Folder, ItemType, LibraryData, LibraryItem } from '../types'
import { createMockData } from '../data/mock'
import { getDescendantFolderIds, uid } from '../lib/utils'

const STORAGE_KEY = 'ideastore:data:v1'

export interface NewItemInput {
  type: ItemType
  title?: string
  content?: string
  url?: string
  author?: string
  source?: string
  folderId?: string | null
  tags?: string[]
  favorite?: boolean
}

interface LibraryContextValue {
  items: LibraryItem[]
  folders: Folder[]
  addItem: (input: NewItemInput) => void
  updateItem: (id: string, patch: Partial<LibraryItem>) => void
  deleteItem: (id: string) => void
  toggleFavorite: (id: string) => void
  addFolder: (name: string, parentId: string | null) => void
  renameFolder: (id: string, name: string) => void
  moveFolder: (id: string, parentId: string | null) => void
  deleteFolder: (id: string) => void
  resetData: () => void
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

function loadData(): LibraryData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as LibraryData
      if (Array.isArray(parsed.items) && Array.isArray(parsed.folders)) {
        return parsed
      }
    }
  } catch {
    // 数据损坏时回退到示例数据
  }
  return createMockData()
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LibraryData>(loadData)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // 存储已满等异常时静默忽略
    }
  }, [data])

  const value = useMemo<LibraryContextValue>(() => {
    return {
      items: data.items,
      folders: data.folders,
      addItem: (input) => {
        const now = Date.now()
        const item: LibraryItem = {
          id: uid(),
          type: input.type,
          title: input.title ?? '',
          content: input.content ?? '',
          url: input.url ?? '',
          author: input.author ?? '',
          source: input.source ?? '',
          folderId: input.folderId ?? null,
          tags: input.tags ?? [],
          favorite: input.favorite ?? false,
          createdAt: now,
          updatedAt: now,
        }
        setData((prev) => ({ ...prev, items: [item, ...prev.items] }))
      },
      updateItem: (id, patch) => {
        setData((prev) => ({
          ...prev,
          items: prev.items.map((it) =>
            it.id === id ? { ...it, ...patch, updatedAt: Date.now() } : it,
          ),
        }))
      },
      deleteItem: (id) => {
        setData((prev) => ({ ...prev, items: prev.items.filter((it) => it.id !== id) }))
      },
      toggleFavorite: (id) => {
        setData((prev) => ({
          ...prev,
          items: prev.items.map((it) =>
            it.id === id ? { ...it, favorite: !it.favorite } : it,
          ),
        }))
      },
      addFolder: (name, parentId) => {
        setData((prev) => ({
          ...prev,
          folders: [
            ...prev.folders,
            { id: uid(), name, parentId, createdAt: Date.now() },
          ],
        }))
      },
      renameFolder: (id, name) => {
        setData((prev) => ({
          ...prev,
          folders: prev.folders.map((f) => (f.id === id ? { ...f, name } : f)),
        }))
      },
      moveFolder: (id, parentId) => {
        setData((prev) => ({
          ...prev,
          folders: prev.folders.map((f) => (f.id === id ? { ...f, parentId } : f)),
        }))
      },
      deleteFolder: (id) => {
        setData((prev) => {
          const folder = prev.folders.find((f) => f.id === id)
          if (!folder) return prev
          const descendantIds = getDescendantFolderIds(prev.folders, id)
          const fallback = folder.parentId
          return {
            folders: prev.folders
              .filter((f) => f.id !== id)
              .map((f) =>
                f.parentId && descendantIds.has(f.parentId)
                  ? { ...f, parentId: fallback }
                  : f,
              ),
            items: prev.items.map((it) =>
              it.folderId && descendantIds.has(it.folderId)
                ? { ...it, folderId: fallback }
                : it,
            ),
          }
        })
      },
      resetData: () => {
        setData(createMockData())
      },
    }
  }, [data])

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary 必须在 LibraryProvider 内使用')
  return ctx
}
