import { useMemo, useState, type ReactNode } from 'react'
import { Star, Trash2, Dice5 } from 'lucide-react'
import type { ItemType } from '../types'
import { TYPE_META, TYPE_ORDER } from '../lib/typeMeta'
import { useUi } from '../store/ui'
import { useLibrary } from '../store/library'
import { cn, collectTags, getFolderPath, normalizeUrl } from '../lib/utils'
import Modal from './Modal'
import TagInput from './TagInput'

const inputCls =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-zinc-600 dark:text-zinc-300">
        {label}
      </span>
      {children}
    </label>
  )
}

export default function ItemModal() {
  const ui = useUi()
  const { items, folders, addItem, updateItem, deleteItem } = useLibrary()

  const editor = ui.editor
  const editing = editor?.kind === 'item' ? editor.item : null
  const defaults = editor?.kind === 'item' ? editor.defaults : {}

  const [type, setType] = useState<ItemType>(editing?.type ?? 'text')
  const [title, setTitle] = useState(editing?.title ?? '')
  const [content, setContent] = useState(editing?.content ?? '')
  const [url, setUrl] = useState(editing?.url ?? '')
  const [author, setAuthor] = useState(editing?.author ?? '')
  const [source, setSource] = useState(editing?.source ?? '')
  const [folderId, setFolderId] = useState<string>(
    editing?.folderId ?? defaults.folderId ?? '',
  )
  const [tags, setTags] = useState<string[]>(editing?.tags ?? [])
  const [favorite, setFavorite] = useState(editing?.favorite ?? false)
  const [error, setError] = useState('')
  const [imgError, setImgError] = useState(false)

  const sortedFolders = useMemo(() => {
    return folders
      .map((f) => ({
        f,
        path: getFolderPath(folders, f.id)
          .map((x) => x.name)
          .join(' / '),
      }))
      .sort((a, b) => a.path.localeCompare(b.path, 'zh-Hans-CN'))
  }, [folders])

  const suggestions = useMemo(() => collectTags(items), [items])

  const randomImage = () => {
    const seed = Math.random().toString(36).slice(2, 9)
    const next = `https://picsum.photos/seed/${seed}/800/560`
    setUrl(next)
    setImgError(false)
  }

  const save = () => {
    const t = title.trim()
    const c = content.trim()
    const u = normalizeUrl(url)
    if ((type === 'text' || type === 'comment') && !c) {
      setError('内容不能为空')
      return
    }
    if ((type === 'image' || type === 'link') && !u) {
      setError(type === 'image' ? '请填写图片地址' : '请填写链接地址')
      return
    }
    const payload = {
      type,
      title: t,
      content: c,
      url: u,
      author: author.trim(),
      source: source.trim(),
      folderId: folderId || null,
      tags,
      favorite,
    }
    if (editing) {
      updateItem(editing.id, payload)
      ui.toast('已保存')
    } else {
      addItem(payload)
      ui.toast('已添加')
    }
    ui.closeEditor()
  }

  const askDelete = () => {
    if (!editing) return
    ui.confirm({
      title: '删除素材',
      message: '删除后将无法恢复，确定要删除吗？',
      confirmText: '删除',
      danger: true,
      onConfirm: () => {
        deleteItem(editing.id)
        ui.closeEditor()
        ui.toast('已删除')
      },
    })
  }

  const previewUrl = type === 'image' ? normalizeUrl(url) : ''

  return (
    <Modal
      title={editing ? '编辑素材' : '新建素材'}
      onClose={ui.closeEditor}
      footer={
        <div className="flex items-center gap-2">
          {editing && (
            <button
              type="button"
              onClick={askDelete}
              className="mr-auto flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <Trash2 size={15} />
              删除
            </button>
          )}
          <button
            type="button"
            onClick={ui.closeEditor}
            className="h-9 rounded-lg border border-zinc-200 px-4 text-sm text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            取消
          </button>
          <button
            type="button"
            onClick={save}
            className="h-9 flex-1 rounded-lg bg-violet-600 text-sm font-medium text-white transition hover:bg-violet-500 active:scale-[0.99] sm:flex-none sm:px-6"
          >
            保存
          </button>
        </div>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <div className="grid grid-cols-4 gap-2">
          {TYPE_ORDER.map((t) => {
            const m = TYPE_META[t]
            const active = type === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t)
                  setError('')
                }}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-lg border py-2.5 text-xs font-medium transition',
                  active
                    ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
                    : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
                )}
              >
                <m.icon size={17} />
                {m.label}
              </button>
            )
          })}
        </div>

        {type === 'text' && (
          <Field label="文案内容">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              autoFocus={!editing}
              placeholder="把触动你的文案写在这里…"
              className={cn(inputCls, 'resize-y leading-relaxed')}
            />
          </Field>
        )}

        {type === 'comment' && (
          <>
            <Field label="评论内容">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                autoFocus={!editing}
                placeholder="神评论原文…"
                className={cn(inputCls, 'resize-y leading-relaxed')}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="评论者">
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="昵称（可选）"
                  className={inputCls}
                />
              </Field>
              <Field label="来源">
                <input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="如：B站 / 网易云"
                  className={inputCls}
                />
              </Field>
            </div>
          </>
        )}

        {type === 'image' && (
          <>
            <Field label="图片地址">
              <div className="flex gap-2">
                <input
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value)
                    setImgError(false)
                  }}
                  placeholder="https://…"
                  autoFocus={!editing}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={randomImage}
                  title="随机示例图"
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-zinc-200 px-2.5 text-xs text-zinc-500 transition hover:border-violet-300 hover:text-violet-600 dark:border-zinc-700 dark:hover:border-violet-500/60 dark:hover:text-violet-400"
                >
                  <Dice5 size={13} />
                  随机图
                </button>
              </div>
            </Field>
            {previewUrl && !imgError && (
              <img
                key={previewUrl}
                src={previewUrl}
                alt="预览"
                onError={() => setImgError(true)}
                className="max-h-52 w-full rounded-xl border border-zinc-100 object-cover dark:border-zinc-800"
              />
            )}
            {previewUrl && imgError && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                图片暂时无法预览（不影响保存），可能是地址无效或网络受限。
              </p>
            )}
          </>
        )}

        {type === 'link' && (
          <Field label="链接地址">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…（回车确认）"
              autoFocus={!editing}
              className={inputCls}
            />
          </Field>
        )}

        {(type === 'link' || type === 'image' || type === 'text') && (
          <Field label={type === 'link' ? '标题 / 备注' : '备注（可选）'}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'link' ? '给这篇文章起个名字' : type === 'image' ? '图片说明' : '给这条文案加个注解'
              }
              className={inputCls}
            />
          </Field>
        )}

        <Field label="所属文件夹">
          <select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className={inputCls}
          >
            <option value="">未分类</option>
            {sortedFolders.map(({ f, path }) => (
              <option key={f.id} value={f.id}>
                {path}
              </option>
            ))}
          </select>
        </Field>

        <Field label="标签">
          <TagInput value={tags} onChange={setTags} suggestions={suggestions} />
        </Field>

        <button
          type="button"
          onClick={() => setFavorite(!favorite)}
          className={cn(
            'flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition',
            favorite
              ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400'
              : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
          )}
        >
          <Star size={15} className={favorite ? 'fill-amber-400' : ''} />
          {favorite ? '已收藏' : '加入收藏'}
        </button>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </p>
        )}

        {/* 允许回车提交 */}
        <button type="submit" className="hidden" aria-hidden="true" />
      </form>
    </Modal>
  )
}
