import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  beginLogin,
  clearSession,
  exchangeCodeForTokens,
  fetchUserInfo,
  loadSession,
  refreshSession,
  revokeToken,
  saveSession,
  takePendingLogin,
  type AuthSession,
  type OAuthUserInfo,
} from '../lib/oauth'

interface CallbackQuery {
  code: string | null
  state: string | null
  error: string | null
  errorDescription: string | null
}

interface AuthContextValue {
  user: OAuthUserInfo | null
  /** 启动时是否正在恢复/刷新会话，用于避免登录态闪动 */
  initializing: boolean
  /** 跳转工具站授权页 */
  login: (returnTo?: string) => void
  /** 清除本地会话并尽力撤销远端令牌 */
  logout: () => void
  /** 处理 /auth/callback 回跳：校验 state、换令牌、拉资料，成功返回回跳路径 */
  handleCallback: (query: CallbackQuery) => Promise<string>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** access_token 过期前 1 分钟内即视为需要刷新 */
const REFRESH_MARGIN_MS = 60_000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [initializing, setInitializing] = useState(true)

  // 启动时恢复会话；access_token 已过期则用 refresh_token 静默续期，
  // 续期失败（refresh_token 也过期/被撤销）则回到未登录态，由用户重新发起（SSO 下一次点击即可）。
  useEffect(() => {
    let cancelled = false
    async function init() {
      const saved = loadSession()
      if (!saved) return
      if (Date.now() < saved.expiresAt - REFRESH_MARGIN_MS) {
        if (!cancelled) setSession(saved)
        return
      }
      try {
        const next = await refreshSession(saved)
        if (!cancelled) setSession(next)
      } catch {
        clearSession()
      }
    }
    init().finally(() => {
      if (!cancelled) setInitializing(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback((returnTo?: string) => {
    beginLogin(returnTo).catch((e) => {
      console.error('[oauth] 发起登录失败：', e)
    })
  }, [])

  const logout = useCallback(() => {
    const saved = loadSession()
    clearSession()
    setSession(null)
    if (saved) {
      // 撤销 refresh_token（长生命周期），fire-and-forget
      void revokeToken(saved.refreshToken)
    }
  }, [])

  const handleCallback = useCallback(async (query: CallbackQuery) => {
    if (query.error) {
      throw new Error(query.errorDescription || `授权失败（${query.error}）`)
    }
    if (!query.code) {
      throw new Error('回调地址缺少授权码，请重新发起登录')
    }
    const pending = takePendingLogin()
    if (!pending) {
      throw new Error('未找到本次登录的会话信息（可能已在新窗口完成），请重新登录')
    }
    if (pending.state !== query.state) {
      throw new Error('state 校验失败，登录请求可能被篡改，请重新登录')
    }
    const token = await exchangeCodeForTokens(query.code, pending.verifier)
    const user = await fetchUserInfo(token.access_token)
    const next: AuthSession = {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: Date.now() + token.expires_in * 1000,
      user,
    }
    saveSession(next)
    setSession(next)
    // 只允许站内相对路径，防止回跳被劫持到外部地址
    return pending.returnTo.startsWith('/') ? pending.returnTo : '/'
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        initializing,
        login,
        logout,
        handleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}
