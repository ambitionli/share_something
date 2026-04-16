# 微信小程序原生项目 - 邻里即达

> 最后更新：2026-04-16

## 项目定位
- 原生微信小程序（WXML + WXSS + JS）
- 场景：本地生活服务、商家入驻、下单配送、评价退款
- 目录：`wechat-miniprogram/`
- 压缩包：`/workspace/wechat-miniprogram.zip`

## 运行模式

### Demo 模式（默认）
- `config/env.js` 中 `useCloud = false`
- 使用 `shared/engine.js` 提供统一业务状态机
- 使用 `services/app-service.js` 持久化到小程序本地存储
- 不依赖云环境即可完整演示

### 云开发模式
- 在设置页开启“云开发模式”
- 上传 `cloudfunctions/` 下 7 个函数
- 每个云函数目录都内置 `lib/constants.js`、`lib/seed.js`、`lib/engine.js`
- 不依赖项目根目录共享文件，便于直接上传部署

## 页面清单
| 页面 | 路径 | 说明 |
|---|---|---|
| 登录 | `pages/login/index` | 手机号登录、微信授权演示、Demo 账号切换 |
| 首页 | `pages/home/index` | Banner、分类、搜索、商家列表 |
| 商家详情 | `pages/store/index` | 商品展示、购物车加减、最近评价 |
| 购物车 | `pages/cart/index` | 数量调整、备注、清空 |
| 结算 | `pages/checkout/index` | 地址、优惠券、支付方式、下单 |
| 订单列表 | `pages/orders/index` | 多状态订单查看与操作 |
| 订单详情 | `pages/order-detail/index` | 时间线、配送、退款、评价入口 |
| 评价 | `pages/review/index` | 星级、文字、图片演示 |
| 个人中心 | `pages/profile/index` | 地址、优惠券、余额、客服、设置 |
| 地址管理 | `pages/address/index` | 新增、编辑、默认地址、选择地址 |
| 优惠券 | `pages/coupons/index` | 列表查看与结算选择 |
| 设置 | `pages/settings/index` | Demo / 云开发模式切换、重置数据 |
| 商家入驻 | `pages/merchant-apply/index` | 信息与资质演示提交 |
| 商家工作台 | `pages/merchant-dashboard/index` | 收入、订单、退款概览 |
| 商品管理 | `pages/merchant-products/index` | 上下架、编辑入口 |
| 商品编辑 | `pages/merchant-product-form/index` | 新增与修改商品 |
| 商家订单 | `pages/merchant-orders/index` | 接单、拒单、配送、处理退款 |

## 业务保护
- 重复支付幂等：已支付订单再次支付不会重复扣库存
- 库存保护：禁止购物车负数与支付后负库存
- 价格保护：商家商品价格必须大于 0
- 越权保护：商家只能处理自己店铺的订单和商品
- 起送价 / 优惠券校验：结算前统一检查

## 云函数
- `login`：手机号 / 微信演示登录
- `placeOrder`：创建订单
- `payCallback`：模拟支付回调
- `refund`：退款申请与处理
- `submitReview`：提交评价
- `stats`：商家概览统计
- `merchantOps`：入驻、商品管理、订单处理

## 数据结构
参考：`wechat-miniprogram/database/schema.md`

核心集合：
- `users`
- `merchants`
- `products`
- `orders`
- `reviews`
- `addresses`
- `coupons`
- `refunds`

## 验收结果
- `npm test`：8 项全部通过
- `npm run acceptance`：通过
- JS 语法检查：通过
- WXML 风险表达式扫描：通过
- 云函数外部共享依赖扫描：通过

> 修改时间：2026-04-16 16:15 UTC
