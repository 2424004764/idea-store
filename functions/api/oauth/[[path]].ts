/**
 * OAuth 同源代理（Cloudflare Pages Function）
 *
 * 工具站的 /api/oauth/token 要求 client_secret，而密钥不可下发到浏览器，
 * 因此前端的令牌请求发到本站同源路径 /api/oauth/*，由本函数转发到
 * tool.fologde.com 并在服务端注入 OAUTH_CLIENT_SECRET 环境变量。
 * 顺带代理 userinfo / revoke，使整个接入不依赖工具站的 CORS 配置。
 */

interface Env {
  OAUTH_CLIENT_SECRET: string
}

interface FunctionContext {
  request: Request
  params: { path?: string[] }
  env: Env
}

const UPSTREAM_BASE = 'https://tool.fologde.com/api/oauth'

export const onRequest = async ({
  request,
  params,
  env,
}: FunctionContext): Promise<Response> => {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const subpath = (params.path ?? []).join('/')
  const upstreamUrl = `${UPSTREAM_BASE}/${subpath}`

  const headers = new Headers()
  const authorization = request.headers.get('Authorization')
  if (authorization) headers.set('Authorization', authorization)

  const init: RequestInit = { method: request.method, headers }

  if (request.method === 'POST') {
    const form = await request.formData()
    const outgoing = new URLSearchParams()
    for (const [key, value] of form.entries()) {
      if (typeof value === 'string') outgoing.set(key, value)
    }
    // 密钥只存在于服务端环境变量，浏览器永远拿不到
    outgoing.set('client_secret', env.OAUTH_CLIENT_SECRET)
    headers.set('Content-Type', 'application/x-www-form-urlencoded')
    init.body = outgoing.toString()
  }

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, init)
  } catch {
    return new Response(
      JSON.stringify({
        error: 'upstream_unreachable',
        error_description: '无法连接工具站登录服务',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type':
        upstream.headers.get('Content-Type') ?? 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}
