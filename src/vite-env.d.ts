/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 工具站 OAuth 应用 client_id（PKCE 模式，无需 client_secret） */
  readonly VITE_OAUTH_CLIENT_ID?: string
  /** OAuth 授权服务器地址，默认 https://tool.fologde.com */
  readonly VITE_OAUTH_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
