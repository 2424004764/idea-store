import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './store/auth'
import { LibraryProvider } from './store/library'
import { UiProvider } from './store/ui'
import './index.css'

const savedTheme = (() => {
  try {
    return localStorage.getItem('ideastore:theme')
  } catch {
    return null
  }
})()
const preferDark =
  savedTheme === 'dark' ||
  (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
if (preferDark) {
  document.documentElement.classList.add('dark')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LibraryProvider>
          <UiProvider>
            <App />
          </UiProvider>
        </LibraryProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
