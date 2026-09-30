import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Folder, LibraryItem } from '../types'
import ItemModal from '../components/ItemModal'
import FolderModal from '../components/FolderModal'
import ConfirmDialog, { type ConfirmOptions } from '../components/ConfirmDialog'
import Toast from '../components/Toast'

type EditorState =
  | { kind: 'item'; item: LibraryItem | null; defaults: { folderId?: string | null } }
  | { kind: 'folder'; folder: Folder | null; parentId: string | null }
  | null

interface UiContextValue {
  openItemEditor: (item?: LibraryItem, defaults?: { folderId?: string | null }) => void
  openFolderEditor: (folder?: Folder, parentId?: string | null) => void
  closeEditor: () => void
  editor: EditorState
  confirm: (opts: ConfirmOptions) => void
  toast: (message: string) => void
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const UiContext = createContext<UiContextValue | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [editor, setEditor] = useState<EditorState>(null)
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const toastTimer = useRef<number | null>(null)

  const openItemEditor = useCallback(
    (item?: LibraryItem, defaults?: { folderId?: string | null }) => {
      setEditor({ kind: 'item', item: item ?? null, defaults: defaults ?? {} })
    },
    [],
  )
  const openFolderEditor = useCallback((folder?: Folder, parentId?: string | null) => {
    setEditor({ kind: 'folder', folder: folder ?? null, parentId: parentId ?? null })
  }, [])
  const closeEditor = useCallback(() => setEditor(null), [])

  const confirm = useCallback((opts: ConfirmOptions) => setConfirmState(opts), [])

  const toast = useCallback((message: string) => {
    setToastMessage(message)
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current)
    }
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 2000)
  }, [])

  return (
    <UiContext.Provider
      value={{
        editor,
        openItemEditor,
        openFolderEditor,
        closeEditor,
        confirm,
        toast,
        drawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
      }}
    >
      {children}
      {editor?.kind === 'item' && (
        <ItemModal key={editor.item?.id ?? 'new-item'} />
      )}
      {editor?.kind === 'folder' && (
        <FolderModal key={editor.folder?.id ?? 'new-folder'} />
      )}
      {confirmState && (
        <ConfirmDialog
          options={confirmState}
          onClose={() => setConfirmState(null)}
        />
      )}
      {toastMessage && <Toast message={toastMessage} />}
    </UiContext.Provider>
  )
}

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext)
  if (!ctx) throw new Error('useUi 必须在 UiProvider 内使用')
  return ctx
}
