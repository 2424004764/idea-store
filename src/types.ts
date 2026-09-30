export type ItemType = 'text' | 'image' | 'link' | 'comment'

export interface Folder {
  id: string
  name: string
  parentId: string | null
  createdAt: number
}

export interface LibraryItem {
  id: string
  type: ItemType
  title: string
  content: string
  url: string
  author: string
  source: string
  folderId: string | null
  tags: string[]
  favorite: boolean
  createdAt: number
  updatedAt: number
}

export interface LibraryData {
  items: LibraryItem[]
  folders: Folder[]
}
