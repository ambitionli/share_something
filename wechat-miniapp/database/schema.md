# 云数据库结构说明

> 最后更新：2026-04-16 00:00 UTC

## collections

### users
- `_id`: string
- `phone`: string
- `openId`: string
- `nickname`: string
- `role`: `user | merchant | admin`
- `balance`: number
- `couponCount`: number
- `createdAt`: date

### merchants
- `_id`: string
- `ownerUserId`: string
- `name`: string
- `category`: string
- `rating`: number
- `deliveryFee`: number
- `minOrderAmount`: number
- `sales`: number
- `status`: `active | inactive`
- `notice`: string
- `qualificationImages`: string[]

### products
- `_id`: string
- `merchantId`: string
- `name`: string
- `description`: string
- `price`: number
- `stock`: number
- `soldCount`: number
- `status`: `on | off`
- `unit`: string

### orders
- `_id`: string
- `userId`: string
- `merchantId`: string
- `items`: array
- `addressSnapshot`: object
- `subtotalAmount`: number
- `deliveryFee`: number
- `totalAmount`: number
- `remark`: string
- `status`: `pending_payment | pending_accept | delivering | completed | refunded | rejected`
- `paymentStatus`: `unpaid | paid | refunded | cancelled`
- `refundStatus`: `none | requested | approved | rejected`
- `paymentId`: string
- `riderName`: string
- `merchantReply`: string
- `reviewId`: string
- `createdAt`: date

### reviews
- `_id`: string
- `orderId`: string
- `merchantId`: string
- `userId`: string
- `rating`: number
- `content`: string
- `images`: string[]
- `createdAt`: date

### addresses
- `_id`: string
- `userId`: string
- `contactName`: string
- `phone`: string
- `detail`: string
- `tag`: string
- `isDefault`: boolean

### merchantApplications
- `_id`: string
- `userId`: string
- `merchantId`: string
- `name`: string
- `category`: string
- `licenseText`: string
- `status`: `pending | approved | rejected`
- `createdAt`: date

## 初始化建议
1. 先导入 `users`、`merchants`、`products`。
2. 在微信开发者工具中逐个安装云函数依赖：`npm install`。
3. 本项目默认是本地 Mock 模式，可先直接运行 UI，再按需切换到云函数模式。
