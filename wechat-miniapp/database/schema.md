# 邻里即达云数据库结构说明

> 最后更新：2026-04-16 22:00

## 集合清单

### 1. `users`
- `id`: string，用户 ID
- `phone`: string，手机号
- `nickname`: string，昵称
- `avatarUrl`: string，头像
- `role`: string，`user` / `merchant`
- `merchantId`: string，绑定商家 ID
- `balance`: number，余额
- `coupons`: array，优惠券列表
- `createdAt`: string，创建时间

### 2. `merchants`
- `id`: string，商家 ID
- `ownerUserId`: string，归属用户
- `name`: string，商家名称
- `category`: string，`restaurant` / `market` / `pharmacy` / `fresh`
- `rating`: number，评分
- `sales`: number，销量
- `minOrder`: number，起送价
- `deliveryFee`: number，配送费
- `avgDeliveryMinutes`: number，平均配送时长
- `description`: string，商家描述
- `address`: string，地址
- `notice`: string，公告
- `qualificationImages`: array，资质图片
- `coverImage`: string，封面图
- `status`: string，`active` / `disabled`

### 3. `products`
- `id`: string，商品 ID
- `merchantId`: string，所属商家
- `name`: string，商品名称
- `price`: number，售价
- `originalPrice`: number，划线价
- `stock`: number，库存
- `monthlySales`: number，月售
- `rating`: number，评分
- `onShelf`: boolean，是否上架
- `image`: string，商品图

### 4. `carts`
- `id`: string，购物车 ID
- `userId`: string，用户 ID
- `merchantId`: string，商家 ID
- `items`: array
  - `productId`: string
  - `quantity`: number

### 5. `orders`
- `id`: string，订单 ID
- `orderNo`: string，订单号
- `userId`: string，用户 ID
- `merchantId`: string，商家 ID
- `status`: string
  - `pending_payment`
  - `pending_accept`
  - `accepted`
  - `delivering`
  - `completed`
  - `refund_requested`
  - `refunded`
  - `rejected`
- `goodsAmount`: number，商品总额
- `deliveryFee`: number，配送费
- `payableAmount`: number，应付金额
- `remark`: string，订单备注
- `addressSnapshot`: object，收货地址快照
- `items`: array，订单商品快照
- `reviewed`: boolean，是否已评价
- `merchantAccepted`: boolean，是否已接单
- `paymentId`: string，模拟支付单号
- `refund`: object/null，退款信息
- `timeline`: array，订单轨迹
- `createdAt`: string，创建时间

### 6. `reviews`
- `id`: string，评价 ID
- `orderId`: string，订单 ID
- `merchantId`: string，商家 ID
- `userId`: string，用户 ID
- `score`: number，1-5 星
- `content`: string，评价内容
- `images`: array，图片列表
- `createdAt`: string，创建时间

### 7. `addresses`
- `id`: string，地址 ID
- `userId`: string，用户 ID
- `name`: string，联系人
- `phone`: string，手机号
- `city`: string，城市/区县
- `detail`: string，详细地址
- `tag`: string，标签
- `isDefault`: boolean，是否默认

### 8. `banners`
- `id`: string，Banner ID
- `title`: string，标题
- `subtitle`: string，副标题
- `image`: string，图片

### 9. `categories`
- `id`: string，分类 ID
- `name`: string，分类名称
- `icon`: string，图标

## 订单状态流转

```text
pending_payment
  -> pending_accept
  -> accepted
  -> delivering
  -> completed

pending_accept / accepted / delivering / completed
  -> refund_requested
  -> refunded | 回退到原状态（驳回）

pending_accept / accepted
  -> rejected（商家拒单并退款）
```

## 数据初始化建议

- 开发者工具首次运行时，优先导入 `shared/seed.js` 中的默认数据。
- 云开发环境可使用 `cloudfunctions/common/store.js` 里的 `reset()` 逻辑写入初始集合。
- 若需要真云数据库，可将 `memoryDb` 替换为对 `cloud.database()` 的集合 CRUD 操作。
