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

## 页面直连 API

- `admin-web/src/pages/Orders.tsx`：管理员订单列表，调用 `GET /api/v1/orders/all` 与 `POST /api/v1/orders/{id}/ship`（与后端一致）；状态标签颜色见 `src/utils/orderStatus.ts`。

## 测试

- `npm run test` — Vitest：`src/services/api.test.ts`、`src/utils/orderStatus.test.ts`

## 修改记录

- 2026-03-20：补充 Orders 页面与 `orderStatus` 工具函数说明。
- 2026-03-20：新增 API 服务层与 `useAuthStore`；文档初稿。
