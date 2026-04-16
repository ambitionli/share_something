# 云数据库结构说明

> 集合名与字段为云函数 `lnk_api` 所使用；请在微信云开发控制台创建对应集合。

## 集合列表

| 集合 | 说明 |
|------|------|
| `users` | 用户（文档 ID 建议使用 `openid`） |
| `merchants` | 商家 |
| `products` | 商品 |
| `orders` | 订单 |
| `addresses` | 收货地址 |
| `reviews` | 评价 |

## users

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string | 与 openid 一致 |
| `phone` | string | 手机号 |
| `nickName` | string | 昵称 |
| `avatarUrl` | string | 头像 |
| `balance` | number | 余额（展示） |
| `couponCount` | number | 优惠券数量（展示） |
| `createdAt` / `updatedAt` | serverDate | 时间 |

## merchants

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 店铺名 |
| `category` | string | `food` / `market` / `medicine` / `fresh` |
| `rating` | number | 评分 |
| `monthlySales` | number | 月销量展示 |
| `deliveryFee` | number | 配送费（元） |
| `minOrderAmount` | number | 起送价（元） |
| `banner` | string | Banner 图 fileID（可选） |
| `licenseImages` | array | 资质图 fileID 列表 |
| `auditStatus` | string | `approved` / `pending` / `rejected`（演示入驻直接 `approved`） |
| `ownerOpenid` | string | 店主 openid |

## products

| 字段 | 类型 | 说明 |
|------|------|------|
| `merchantId` | string | 商家 ID |
| `name` | string | 商品名 |
| `price` | number | 单价（元） |
| `stock` | number | 库存 |
| `sales` | number | 销量 |
| `status` | string | `on_shelf` / `off_shelf` |
| `image` | string | 主图 fileID（可选） |

## orders

| 字段 | 类型 | 说明 |
|------|------|------|
| `_openid` | string | 用户 openid（系统自动） |
| `merchantId` | string | 商家 ID |
| `merchantOpenid` | string | 商家店主 openid |
| `items` | array | `{ productId, name, price, qty }` |
| `amountCents` | number | 应付总金额（分） |
| `deliveryFee` | number | 配送费（元，快照） |
| `minOrderAmount` | number | 起送价（元，快照） |
| `remark` | string | 备注 |
| `address` | object | 地址快照 |
| `status` | string | 见业务枚举 |
| `paidAt` / `acceptedAt` / `completedAt` / `refundedAt` | date | 可选时间 |

**状态枚举**：`pending_pay`、`pending_accept`、`delivering`、`completed`、`cancelled`、`refunding`、`refunded`。

## addresses

| 字段 | 类型 | 说明 |
|------|------|------|
| `_openid` | string | 用户 |
| `name` / `phone` / `region` / `detail` | string | 地址信息 |
| `isDefault` | boolean | 是否默认 |

## reviews

| 字段 | 类型 | 说明 |
|------|------|------|
| `orderId` | string | 订单 ID |
| `merchantId` | string | 商家 |
| `rating` | number | 1–5 |
| `content` | string | 文字 |
| `images` | array | 云存储 fileID |

## 索引建议（可选）

生产环境可为高频查询添加索引，例如 `orders` 的 `_openid + status`、`products` 的 `merchantId + sales` 等。当前云函数在部分列表查询中使用内存排序，以降低一次性建索引成本。
