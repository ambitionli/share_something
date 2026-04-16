# 云数据库结构说明

## collections

### users
- `_id`: 用户主键
- `phone`: 手机号
- `nickname`: 昵称
- `role`: `buyer` / `merchant`
- `balance`: 余额
- `merchantId`: 关联商家
- `avatarUrl`: 头像
- `createdAt` / `updatedAt`

### merchants
- `_id`: 商家主键
- `ownerUserId`: 商家管理员用户 ID
- `name`: 商家名称
- `category`: `restaurant` / `market` / `medicine` / `fresh`
- `intro`: 商家介绍
- `status`: `approved` / `pending`
- `deliveryFee`: 配送费
- `minOrderAmount`: 起送价
- `avgDeliveryTime`: 平均配送时长
- `distance`: 距离文案
- `tags`: 标签数组
- `licenseImages`: 资质图片数组
- `score`: 评分
- `monthlySales`: 月售

### products
- `_id`: 商品主键
- `merchantId`: 所属商家
- `name`: 商品名称
- `description`: 商品描述
- `category`: 商品分类
- `price`: 售价
- `originPrice`: 原价
- `stock`: 库存
- `sales`: 销量
- `status`: `on_sale` / `off_sale`
- `unit`: 单位
- `imageUrl`: 主图

### orders
- `_id`: 订单主键
- `orderNo`: 展示用订单号
- `userId`: 下单用户
- `merchantId`: 商家 ID
- `merchantName`: 商家名称快照
- `status`: `pending_pay` / `pending_accept` / `accepted` / `delivering` / `completed` / `refunding` / `refunded`
- `paymentMethod`: `wechat` / `balance`
- `paymentId`: 模拟支付流水
- `address`: 地址快照对象
- `items`: 商品快照数组
- `totals`: 金额对象（`subtotal`、`deliveryFee`、`discount`、`total`）
- `couponId`: 使用的优惠券
- `remark`: 备注
- `timeline`: 状态流转时间线
- `courier`: 配送员信息
- `reviewId`: 评价 ID

### reviews
- `_id`: 评价主键
- `orderId`: 订单 ID
- `userId`: 用户 ID
- `merchantId`: 商家 ID
- `nickname`: 用户昵称
- `rating`: 星级
- `content`: 文本内容
- `images`: 图片数组
- `createdAt`

### addresses
- `_id`: 地址主键
- `userId`: 所属用户
- `contactName`: 联系人
- `phone`: 联系电话
- `detail`: 详细地址
- `tag`: 标签
- `isDefault`: 是否默认

### coupons
- `_id`: 优惠券主键
- `userId`: 用户 ID
- `title`: 券名
- `amount`: 减免金额
- `minSpend`: 最低消费门槛
- `status`: `unused` / `used` / `expired`
- `expiry`: 过期日期

### refunds
- `_id`: 退款主键
- `orderId`: 订单 ID
- `userId`: 用户 ID
- `merchantId`: 商家 ID
- `reason`: 退款原因
- `amount`: 退款金额
- `status`: `pending` / `completed`
- `createdAt` / `processedAt`
