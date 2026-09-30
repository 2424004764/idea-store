import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useAuth } from '../store/auth'
import { useUi } from '../store/ui'

/**
 * OAuth2 回调页：工具站授权后带 code/state 回跳到这里，
 * 完成换令牌与资料拉取后跳回来源页面。
 */
export default function AuthCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { handleCallback, login } = useAuth()
  const ui = useUi()
  const [error, setError] = useState<string | null>(null)
  // StrictMode 下 effect 会执行两次，授权码一次性，必须只消费一次
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    handleCallback({
      code: params.get('code'),
      state: params.get('state'),
      error: params.get('error'),
      errorDescription: params.get('error_description'),
    })
      .then((returnTo) => {
        navigate(returnTo, { replace: true })
        ui.toast('登录成功')
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : '登录失败，请重试')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-500/15 dark:text-red-400">
          <AlertTriangle size={22} />
        </div>
        <div className="text-center">
          <div className="font-semibold text-zinc-900 dark:text-zinc-50">登录失败</div>
          <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            {error}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => login('/')}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-violet-500 active:scale-[0.98]"
          >
            重新登录
          </button>
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 py-16 text-zinc-500 dark:text-zinc-400">
      <Loader2 size={24} className="animate-spin text-violet-500" />
      <span className="text-sm">正在完成登录，请稍候…</span>
    </div>
  )
}
