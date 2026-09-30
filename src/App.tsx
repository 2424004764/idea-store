import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import LibraryPage from './pages/LibraryPage'
import { useUi } from './store/ui'

export default function App() {
  const { drawerOpen, closeDrawer } = useUi()

  return (
    <div className="flex h-dvh overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      <Sidebar />

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[2px]" onClick={closeDrawer} />
          <div className="drawer-in absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            <Sidebar mobile onClose={closeDrawer} />
          </div>
        </div>
      )}

      <main className="nice-scroll h-full flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<LibraryPage collection="all" />} />
          <Route path="/favorites" element={<LibraryPage collection="favorites" />} />
          <Route
            path="/uncategorized"
            element={<LibraryPage collection="uncategorized" />}
          />
          <Route path="/folder/:folderId" element={<LibraryPage collection="folder" />} />
          <Route path="*" element={<LibraryPage collection="all" />} />
        </Routes>
      </main>
    </div>
  )
}
