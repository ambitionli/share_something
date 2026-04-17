# 微信小程序本地生活配送项目 - 自动记录

> 最后更新：2026-04-16 23:59

## 新增目录

- `wechat-delivery-app/`：原生微信小程序工程
- `wechat-delivery-app/cloudfunctions/`：云函数示例
- `wechat-delivery-app/shared/`：用户端 / 商家端 / 云函数共用业务规则
- `wechat-delivery-app/tests/`：Node 自动化验收测试

## 已实现功能

### 用户端

- 手机号登录 / 微信授权登录（演示）
- 首页商家列表、分类、搜索、Banner
- 商家页：商品、价格、销量、评分、配送费、起送价
- 购物车：加减、结算、备注
- 下单：地址选择、优惠券、模拟支付、订单创建
- 订单列表：待支付 / 待接单 / 配送中 / 已完成 / 退款
- 评价：星级、文字、示例图片
- 个人中心：地址管理、优惠券、余额、客服、演示账号切换

### 商家端

- 商家入驻
- 商品管理：新增、编辑、改价、库存、上架、下架
- 订单管理：接单、拒单、标记配送
- 退款处理：通过 / 驳回
- 数据概览：订单量、完成量、退款量、收入

### 云函数

- `login`
- `placeOrder`
- `payCallback`
- `refund`
- `review`
- `stats`

## 核心规则复用

`shared/business.js` 统一封装：

- 下单幂等
- 起送价校验
- 库存保护
- 支付幂等
- 商家权限校验
- 用户权限校验
- 退款状态机
- 评价规则

## 验证结果

已执行：

```bash
node --test tests/business.test.js
```

结果：7/7 通过。

## 交付文件

- `wechat-delivery-app/README.md`
- `wechat-delivery-app/docs/database-schema.md`
- `wechat-delivery-app/docs/acceptance-report.md`

## 修改时间

- 2026-04-16 23:59
