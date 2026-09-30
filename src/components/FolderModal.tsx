import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useUi } from '../store/ui'
import { useLibrary } from '../store/library'
import { cn, getDescendantFolderIds, getFolderPath } from '../lib/utils'
import Modal from './Modal'

const inputCls =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100'

export default function FolderModal() {
  const ui = useUi()
  const { folders, addFolder, renameFolder, moveFolder, deleteFolder } = useLibrary()

  const editor = ui.editor
  const editing = editor?.kind === 'folder' ? editor.folder : null
  const defaultParent = editor?.kind === 'folder' ? editor.parentId : null

  const [name, setName] = useState(editing?.name ?? '')
  const [parentId, setParentId] = useState<string>(
    editing?.parentId ?? defaultParent ?? '',
  )
  const [error, setError] = useState('')

  const bannedIds = useMemo(
    () => (editing ? getDescendantFolderIds(folders, editing.id) : new Set<string>()),
    [editing, folders],
  )

  const sortedFolders = useMemo(() => {
    return folders
      .filter((f) => !bannedIds.has(f.id))
      .map((f) => ({
        f,
        path: getFolderPath(folders, f.id)
          .map((x) => x.name)
          .join(' / '),
      }))
      .sort((a, b) => a.path.localeCompare(b.path, 'zh-Hans-CN'))
  }, [folders, bannedIds])

  const save = () => {
    const n = name.trim()
    if (!n) {
      setError('文件夹名称不能为空')
      return
    }
    const parent = parentId || null
    if (editing) {
      renameFolder(editing.id, n)
      if ((editing.parentId ?? null) !== parent) {
        moveFolder(editing.id, parent)
      }
      ui.toast('已保存')
    } else {
      addFolder(n, parent)
      ui.toast('文件夹已创建')
    }
    ui.closeEditor()
  }

  const askDelete = () => {
    if (!editing) return
    ui.confirm({
      title: `删除文件夹「${editing.name}」`,
      message: '文件夹内的素材和子文件夹会自动移到上一级，不会丢失。',
      confirmText: '删除',
      danger: true,
      onConfirm: () => {
        deleteFolder(editing.id)
        ui.closeEditor()
        ui.toast('文件夹已删除')
      },
    })
  }

  return (
    <Modal
      title={editing ? '编辑文件夹' : '新建文件夹'}
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
            className="h-9 flex-1 rounded-lg bg-violet-600 text-sm font-medium text-white transition hover:bg-violet-500 sm:flex-none sm:px-6"
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
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-zinc-600 dark:text-zinc-300">
            文件夹名称
          </span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            autoFocus
            placeholder="如：视频脚本灵感"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-zinc-600 dark:text-zinc-300">
            位置
          </span>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className={inputCls}
          >
            <option value="">根目录</option>
            {sortedFolders.map(({ f, path }) => (
              <option key={f.id} value={f.id}>
                {path}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p className={cn('rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400')}>
            {error}
          </p>
        )}
        <button type="submit" className="hidden" aria-hidden="true" />
      </form>
    </Modal>
  )
}
