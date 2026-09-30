import { Type, Image as ImageIcon, Link2, MessageSquare } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ItemType } from '../types'

export const TYPE_ORDER: ItemType[] = ['text', 'image', 'link', 'comment']

export const TYPE_META: Record<ItemType, { label: string; icon: LucideIcon; tint: string }> = {
  text: {
    label: '文案',
    icon: Type,
    tint: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
  },
  image: {
    label: '图片',
    icon: ImageIcon,
    tint: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  },
  link: {
    label: '链接',
    icon: Link2,
    tint: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  },
  comment: {
    label: '评论',
    icon: MessageSquare,
    tint: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
  },
}
