import type { Folder, LibraryItem } from '../types'

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** 某个文件夹自身 + 所有后代文件夹的 id 集合 */
export function getDescendantFolderIds(folders: Folder[], rootId: string): Set<string> {
  const result = new Set<string>([rootId])
  let changed = true
  while (changed) {
    changed = false
    for (const f of folders) {
      if (f.parentId && result.has(f.parentId) && !result.has(f.id)) {
        result.add(f.id)
        changed = true
      }
    }
  }
  return result
}

/** 从根到该文件夹的路径 */
export function getFolderPath(folders: Folder[], folderId: string | null): Folder[] {
  const map = new Map(folders.map((f) => [f.id, f]))
  const path: Folder[] = []
  let cur = folderId ? map.get(folderId) : undefined
  let guard = 0
  while (cur && guard++ < 32) {
    path.unshift(cur)
    cur = cur.parentId ? map.get(cur.parentId) : undefined
  }
  return path
}

export function collectTags(items: LibraryItem[]): string[] {
  const set = new Set<string>()
  for (const it of items) {
    for (const t of it.tags) set.add(t)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
}

export function formatDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000)
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  const sameYear = d.getFullYear() === now.getFullYear()
  if (sameYear) return `${d.getMonth() + 1}月${d.getDate()}日`
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export function normalizeUrl(url: string): string {
  const u = url.trim()
  if (!u) return ''
  return /^https?:\/\//i.test(u) ? u : `https://${u}`
}

export function prettyDomain(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}
