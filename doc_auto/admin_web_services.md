# Admin Web — API 与状态

> 最后更新：2026-03-20

## 概述

`admin-web` 使用 Axios 统一访问后端 `http://localhost:8000`，Bearer 令牌存于 `localStorage` 键 `admin_token`；认证状态由 Zustand `persist` 持久化同一 token。

## 文件

| 路径 | 说明 |
|------|------|
| `admin-web/src/services/api.ts` | Axios 实例、请求/响应拦截器（401 → `/login`）、`FormData` 时移除默认 JSON `Content-Type` |
| `admin-web/src/services/auth.ts` | `login` / `getMe`，类型 `LoginRequest`、`TokenResponse`、`UserInfo` |
| `admin-web/src/services/company.ts` | 公司信息与新闻 CRUD |
| `admin-web/src/services/products.ts` | 商品 CRUD + `uploadImage` |
| `admin-web/src/stores/auth.ts` | `login` / `logout` / `loadUser`，`token` / `user` / `isLoggedIn` |

## 测试

- `npm run test` — Vitest：`src/services/api.test.ts`

## 修改记录

- 2026-03-20：新增 API 服务层与 `useAuthStore`；文档初稿。
