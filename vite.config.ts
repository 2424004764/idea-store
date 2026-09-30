import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * 本地开发用的 OAuth 同源代理，与 functions/api/oauth/[[path]].ts 行为一致：
 * 把 /api/oauth/* 转发到工具站并注入 client_secret（取自 .env.local 的
 * OAUTH_CLIENT_SECRET，无 VITE_ 前缀，不会暴露给浏览器，也不会打进产物）。
 */
function oauthDevProxy(secret: string): Plugin {
  return {
    name: 'oauth-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/oauth', (req, res, next) => {
        const subpath = (req.url ?? '').replace(/^\/+/, '')
        const upstream = `https://tool.fologde.com/api/oauth/${subpath}`
        const chunks: Buffer[] = []
        req.on('data', (c: Buffer) => chunks.push(c))
        req.on('error', next)
        req.on('end', () => {
          const headers: Record<string, string> = {}
          if (req.headers.authorization) {
            headers.Authorization = req.headers.authorization
          }
          let body: string | undefined
          if (req.method === 'POST') {
            const params = new URLSearchParams(Buffer.concat(chunks).toString())
            params.set('client_secret', secret)
            body = params.toString()
            headers['Content-Type'] = 'application/x-www-form-urlencoded'
          }
          fetch(upstream, {
            method: req.method,
            headers,
            body,
          })
            .then(async (up) => {
              res.writeHead(up.status, {
                'Content-Type':
                  up.headers.get('Content-Type') ?? 'application/json',
                'Cache-Control': 'no-store',
              })
              res.end(await up.text())
            })
            .catch(() => {
              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(
                JSON.stringify({
                  error: 'upstream_unreachable',
                  error_description: '无法连接工具站登录服务',
                }),
              )
            })
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      oauthDevProxy(env.OAUTH_CLIENT_SECRET ?? ''),
    ],
    server: {
      port: 5190,
    },
  }
})
