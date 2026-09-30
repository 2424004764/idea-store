/**
 * 工具站（tool.fologde.com）OAuth2 客户端 · 授权码 + PKCE + 服务端密钥
 *
 * 授权页跳转直达工具站；令牌三件套（token/userinfo/revoke）走本站同源
 * 路径 /api/oauth/*，由 Cloudflare Pages Function 转发并在服务端注入
 * client_secret（线上）或 vite 开发中间件注入（本地），密钥不进浏览器。
 */

const BASE_URL = (
  import.meta.env.VITE_OAUTH_BASE_URL || 'https://tool.fologde.com'
).replace(/\/+$/, '')
const CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID || ''

export const AUTHORIZE_URL = `${BASE_URL}/oauth/authorize`
const TOKEN_URL = '/api/oauth/token'
const USERINFO_URL = '/api/oauth/userinfo'
const REVOKE_URL = '/api/oauth/revoke'

/** 授权服务器返回的用户资料 */
export interface OAuthUserInfo {
  sub: string
  id: string
  username: string
  email: string
  avatar: string
  created_at: string
}

/** 本站本地会话（localStorage 持久化） */
export interface AuthSession {
  accessToken: string
  refreshToken: string
  /** access_token 过期时间（毫秒时间戳） */
  expiresAt: number
  user: OAuthUserInfo
}

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope?: string
}

/** 发起登录前暂存在 sessionStorage 的防伪与回跳信息 */
interface PendingLogin {
  state: string
  verifier: string
  returnTo: string
}

const SESSION_KEY = 'ideastore:auth'
const PENDING_KEY = 'ideastore:oauth-pending'

export function callbackUrl(): string {
  return `${window.location.origin}/auth/callback`
}

function randomString(length: number): string {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => charset[b % charset.length]).join('')
}

async function sha256Base64Url(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input),
  )
  let binary = ''
  for (const byte of new Uint8Array(digest)) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** 跳转到工具站授权页。returnTo 为登录成功后要回到的本站路径。 */
export async function beginLogin(returnTo?: string): Promise<void> {
  if (!CLIENT_ID) {
    throw new Error(
      '未配置 VITE_OAUTH_CLIENT_ID，请先设置工具站 OAuth 应用的 client_id',
    )
  }
  const state = randomString(24)
  const verifier = randomString(64)
  const challenge = await sha256Base64Url(verifier)
  try {
    sessionStorage.setItem(
      PENDING_KEY,
      JSON.stringify({
        state,
        verifier,
        returnTo: returnTo || window.location.pathname + window.location.search,
      } satisfies PendingLogin),
    )
  } catch {
    // 存不进去时仍继续，回调端会因 state 校验失败而拒绝本次登录
  }
  const url = new URL(AUTHORIZE_URL)
  url.searchParams.set('client_id', CLIENT_ID)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', callbackUrl())
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  window.location.assign(url.toString())
}

/** 取出（并清除）本次登录的 pending 信息；state 不匹配即视为 CSRF */
export function takePendingLogin(): PendingLogin | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    if (!raw) return null
    sessionStorage.removeItem(PENDING_KEY)
    return JSON.parse(raw) as PendingLogin
  } catch {
    return null
  }
}

async function postToken(params: Record<string, string>): Promise<TokenResponse> {
  let res: Response
  try {
    res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params).toString(),
    })
  } catch {
    throw new Error('无法连接工具站登录服务，请检查网络后重试')
  }
  const data = (await res.json().catch(() => null)) as
    | (TokenResponse & { error?: string; error_description?: string })
    | null
  if (!res.ok || !data?.access_token) {
    throw new Error(
      data?.error_description || data?.error || `登录服务返回异常（HTTP ${res.status}）`,
    )
  }
  return data
}

/** 授权码换取令牌（PKCE：传 code_verifier，不传 client_secret） */
export function exchangeCodeForTokens(
  code: string,
  verifier: string,
): Promise<TokenResponse> {
  return postToken({
    grant_type: 'authorization_code',
    code,
    redirect_uri: callbackUrl(),
    client_id: CLIENT_ID,
    code_verifier: verifier,
  })
}

export async function fetchUserInfo(accessToken: string): Promise<OAuthUserInfo> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    throw new Error(`获取用户资料失败（HTTP ${res.status}）`)
  }
  return (await res.json()) as OAuthUserInfo
}

/** 用 refresh_token 刷新并轮换令牌，返回新会话（已写入存储） */
export async function refreshSession(current: AuthSession): Promise<AuthSession> {
  const token = await postToken({
    grant_type: 'refresh_token',
    refresh_token: current.refreshToken,
    client_id: CLIENT_ID,
  })
  let user = current.user
  try {
    user = await fetchUserInfo(token.access_token)
  } catch {
    // 资料拉取失败时沿用旧资料，不阻塞刷新
  }
  const next: AuthSession = {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: Date.now() + token.expires_in * 1000,
    user,
  }
  saveSession(next)
  return next
}

/** 通知授权服务器撤销令牌；无论成败都不阻塞本地登出 */
export async function revokeToken(token: string): Promise<void> {
  try {
    await fetch(REVOKE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token, client_id: CLIENT_ID }).toString(),
    })
  } catch {
    // ignore
  }
}

export function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as AuthSession
    if (s?.accessToken && s?.refreshToken && s?.user?.sub) return s
    return null
  } catch {
    return null
  }
}

export function saveSession(session: AuthSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // ignore
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}
