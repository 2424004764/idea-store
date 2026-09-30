# IdeaStore · 灵感素材库

收集文案、图片、文章链接与神评论的个人素材库。Web / 移动端自适应，界面现代化，当前版本使用本地 mock 数据（localStorage 持久化）。

## 技术栈

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- react-router（SPA 路由）
- lucide-react（图标）

## 功能

- 四类素材：文案 / 图片 / 链接 / 评论
- 多级文件夹（树形侧栏，可新建 / 重命名 / 移动 / 删除）
- 标签体系（点标签即筛选，新建时自动联想）
- 全文搜索 + 类型筛选 + 收藏 + 未分类
- 网格（瀑布流）/ 列表双视图，排序切换
- 深色模式、移动端抽屉侧栏与底部弹层
- 「重置示例」一键恢复 mock 数据
- 工具箱账号登录（OAuth2 · 授权码 + PKCE + 服务端密钥，单点登录）

## 开发

```bash
pnpm install
pnpm dev      # 本地开发 http://localhost:5190（含 /api/oauth 本地代理）
pnpm build    # 产物输出到 dist/
```

## 登录（工具箱账号 · OAuth2）

接入 `https://tool.fologde.com` 统一登录。工具站的换令牌接口要求 `client_secret`，而密钥不可下发浏览器，因此架构为：

- **授权页跳转**直达工具站（带 `state` 防 CSRF + PKCE `code_challenge`）；
- **令牌三件套**（token / userinfo / revoke）走本站同源路径 `/api/oauth/*`：
  - 线上由 Cloudflare Pages Function `functions/api/oauth/[[path]].ts` 转发，并从环境变量 `OAUTH_CLIENT_SECRET` 注入密钥；
  - 本地由 `vite.config.ts` 里的开发中间件注入 `.env.local` 的 `OAUTH_CLIENT_SECRET`（无 `VITE_` 前缀，不会进浏览器和构建产物）。
- 该方案同时不依赖工具站的 CORS 配置。

配置步骤：

1. 工具站后台 **系统 → OAuth 应用** 新建应用，回调白名单（精确匹配，每行一个）：
   - 生产：`https://<你的域名>/auth/callback`
   - 本地：`http://localhost:5190/auth/callback`
2. 复制 `.env.example` 为 `.env.local`，填 `VITE_OAUTH_CLIENT_ID` 与 `OAUTH_CLIENT_SECRET`（已被 gitignore）。
3. 线上设置密钥（direct-upload 项目没有 CF 侧构建，`VITE_OAUTH_CLIENT_ID` 本地构建时已打进产物）：
   ```bash
   npx wrangler pages secret put OAUTH_CLIENT_SECRET --project-name=idea-store
   ```
   之后 `pnpm build && npx wrangler pages deploy dist --project-name=idea-store --branch=main --commit-dirty=true`。

会话机制：`access_token`（2 小时）与 `refresh_token`（30 天，轮换）存于 localStorage，启动时临期自动续期，失败则回到未登录态（SSO 下再点一次登录即静默完成）；退出登录尽力调用 revoke 撤销 refresh_token。

相关代码：`src/lib/oauth.ts`（协议实现）、`src/store/auth.tsx`（全局登录态）、`src/pages/AuthCallbackPage.tsx`（回调页）、`src/components/UserMenu.tsx`（顶栏账号区）、`functions/api/oauth/[[path]].ts`（线上密钥代理）。

## 部署到 Cloudflare Pages

- 构建命令：`pnpm build`
- 输出目录：`dist`；`functions/` 目录随部署自动上传为 Pages Functions
- SPA 回退已通过 `public/_redirects` 配置
- 密钥：`OAUTH_CLIENT_SECRET`（`wrangler pages secret put`，见上方「登录」章节）

## 后续计划（数据接口）

当前数据层在 `src/store/library.tsx`，通过 localStorage 模拟。接入真实后端时，只需将该文件中的读写实现替换为 API 调用（如 Cloudflare Workers + D1/KV），组件层无需改动。
