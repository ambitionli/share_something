# 数据库结构说明

## 集合清单

### `users`
- `_id`: 用户 ID
- `phone`: 手机号
- `nickname`: 昵称
- `avatar`: 头像
- `loginType`: `phone | wechat`
- `balance`: 余额
- `coupons`: 优惠券 ID 列表
- `merchantId`: 绑定商家 ID

### `merchants`
- `_id`: 商家 ID
- `ownerUserId`: 商家拥有者用户 ID
- `name`: 商家名称
- `categoryId`: 分类 ID
- `announcement`: 公告
- `deliveryFee`: 配送费
- `minOrderPrice`: 起送价
- `score`: 评分
- `monthlySales`: 月售
- `averageDeliveryMinutes`: 平均送达时长
- `banner`: 店铺头图
- `qualificationImages`: 资质图片数组
- `address`: 店铺地址
- `tags`: 标签数组

### `products`
- `_id`: 商品 ID
- `merchantId`: 商家 ID
- `name`: 商品名称
- `description`: 商品描述
- `price`: 单价
- `stock`: 库存
- `monthlySales`: 月销量
- `rating`: 商品评分
- `onShelf`: 是否上架
- `image`: 商品图片

### `orders`
- `_id`: 订单 ID
- `orderNo`: 订单号
- `userId`: 用户 ID
- `merchantId`: 商家 ID
- `items`: 商品明细数组
- `address`: 收货地址对象
- `remark`: 备注
- `deliveryFee`: 配送费
- `packageFee`: 打包费
- `discountAmount`: 优惠金额
- `couponId`: 优惠券 ID
- `totalAmount`: 实付金额
- `paymentMethod`: 支付方式
- `paymentId`: 支付流水号
- `status`: `pending_payment | pending_accept | accepted | delivering | completed | refund_pending | refunded | cancelled | rejected`
- `reviewId`: 评价 ID
- `refundReason`: 退款/拒单原因
- `timeline`: 状态流转时间线
- `riderName`: 骑手名
- `courierName`: 配送渠道名
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### `reviews`
- `_id`: 评价 ID
- `orderId`: 订单 ID
- `userId`: 用户 ID
- `merchantId`: 商家 ID
- `rating`: 星级
- `content`: 评价文本
- `images`: 图片数组
- `createdAt`: 创建时间

### `addresses`
- `_id`: 地址 ID
- `userId`: 用户 ID
- `name`: 收货人
- `phone`: 手机号
- `detail`: 详细地址
- `tag`: 标签
- `isDefault`: 是否默认

### `coupons`
- `_id`: 优惠券 ID
- `userId`: 用户 ID
- `title`: 券名称
- `amount`: 面额
- `threshold`: 使用门槛
- `used`: 是否使用

### `merchantApplications`
- `_id`: 入驻申请 ID
- `userId`: 用户 ID
- `merchantId`: 商家 ID
- `businessName`: 商家名
- `qualificationImages`: 资质数组
- `status`: 审核状态
- `createdAt`: 创建时间

## 推荐索引
- `users.phone`
- `users.merchantId`
- `merchants.ownerUserId`
- `products.merchantId + onShelf`
- `orders.userId + createdAt`
- `orders.merchantId + status`
- `reviews.merchantId + createdAt`
- `addresses.userId + isDefault`

## 云开发初始化建议
1. 先创建上述集合。
2. 导入 `shared/core.js` 的种子数据作为演示数据。
3. 将云函数中的内存逻辑替换为 `wx-server-sdk` 的数据库读写。
4. 对订单创建、支付回调、退款处理使用事务，保证库存与状态一致性。
