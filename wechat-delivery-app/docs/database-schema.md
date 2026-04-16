# 云数据库结构说明

## collections

### users
- `_id`
- `phone`
- `nickname`
- `avatarText`
- `balance`
- `couponIds`
- `createdAt`

### merchants
- `_id`
- `ownerUserId`
- `name`
- `category`
- `rating`
- `monthlySales`
- `deliveryFee`
- `minOrderAmount`
- `avgDeliveryMinutes`
- `notice`
- `address`
- `logoText`
- `bannerText`
- `certifications`
- `joinedAt`
- `status`

### products
- `_id`
- `merchantId`
- `name`
- `price`
- `originalPrice`
- `stock`
- `sales`
- `rating`
- `isOnShelf`
- `description`
- `tags`

### addresses
- `_id`
- `userId`
- `receiver`
- `phone`
- `detail`
- `tag`
- `isDefault`

### orders
- `_id`
- `orderNo`
- `clientToken`
- `userId`
- `merchantId`
- `addressId`
- `remark`
- `items`
- `summary`
- `status`
- `timeline`
- `reviewId`
- `refundReason`
- `refundContext`
- `paymentRef`
- `createdAt`

### reviews
- `_id`
- `orderId`
- `merchantId`
- `userId`
- `rating`
- `content`
- `images`
- `createdAt`

### coupons
- `_id`
- `userId`
- `title`
- `amount`
- `minimumSpend`
- `isUsed`

### merchantApplications
- `_id`
- `merchantId`
- `userId`
- `status`
- `submittedAt`
