import { useState } from 'react'
import { LogIn, LogOut } from 'lucide-react'
import type { OAuthUserInfo } from '../lib/oauth'
import { useAuth } from '../store/auth'
import { useUi } from '../store/ui'

function Avatar({ user }: { user: OAuthUserInfo }) {
  const [failed, setFailed] = useState(false)
  if (user.avatar && !failed) {
    return (
      <img
        src={user.avatar}
        alt={user.username}
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
        className="h-8 w-8 rounded-full object-cover"
      />
    )
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-semibold text-white">
      {(user.username || '?').slice(0, 1).toUpperCase()}
    </div>
  )
}

/** 顶栏账号区：未登录显示「登录」，登录后显示头像与退出菜单 */
export default function UserMenu() {
  const { user, initializing, login, logout } = useAuth()
  const ui = useUi()
  const [open, setOpen] = useState(false)

  if (initializing || !user) {
    return (
      <button
        type="button"
        aria-label={initializing ? '正在恢复登录态' : '使用工具箱账号登录'}
        title={initializing ? undefined : '使用工具箱账号登录'}
        disabled={initializing}
        onClick={() => login()}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        {initializing ? (
          <span className="h-4 w-4 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-600" />
        ) : (
          <>
            <LogIn size={16} />
            <span className="hidden text-sm sm:inline">登录</span>
          </>
        )}
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="账号菜单"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 rounded-lg border border-zinc-200 pr-2 pl-1 transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        <Avatar user={user} />
        <span className="hidden max-w-24 truncate text-sm text-zinc-600 dark:text-zinc-300 md:inline">
          {user.username}
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-30 w-52 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
            <div className="border-b border-zinc-100 px-3 py-2 dark:border-zinc-700/60">
              <div className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {user.username}
              </div>
              {user.email && (
                <div className="truncate text-xs text-zinc-400">{user.email}</div>
              )}
            </div>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700/60"
              onClick={() => {
                setOpen(false)
                logout()
                ui.toast('已退出登录')
              }}
            >
              <LogOut size={13} /> 退出登录
            </button>
          </div>
        </>
      )}
    </div>
  )
}
