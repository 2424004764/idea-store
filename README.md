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

## 开发

```bash
pnpm install
pnpm dev      # 本地开发 http://localhost:5190
pnpm build    # 产物输出到 dist/
```

## 部署到 Cloudflare Pages

- 构建命令：`pnpm build`
- 输出目录：`dist`
- SPA 回退已通过 `public/_redirects` 配置

## 后续计划（数据接口）

当前数据层在 `src/store/library.tsx`，通过 localStorage 模拟。接入真实后端时，只需将该文件中的读写实现替换为 API 调用（如 Cloudflare Workers + D1/KV），组件层无需改动。
