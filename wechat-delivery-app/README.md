# 好近到家微信小程序

一个可直接导入微信开发者工具的原生微信小程序示例，包含：

- 用户端：登录、首页、商家页、购物车、下单、订单、退款、评价、个人中心、地址管理
- 商家端：入驻申请、商品管理、订单处理、退款处理、数据概览
- 云函数：登录、下单、支付回调、退款、评价、统计
- 云数据库结构说明与本地演示数据

## 项目结构

```text
wechat-delivery-app/
├── app.js
├── app.json
├── app.wxss
├── project.config.json
├── pages/
│   ├── auth/
│   ├── home/
│   ├── merchant/
│   ├── checkout/
│   ├── orders/
│   ├── order-detail/
│   ├── review/
│   ├── profile/
│   ├── addresses/
│   └── merchant-center/
├── shared/
│   ├── business.js
│   ├── constants.js
│   └── seed.js
├── utils/
│   ├── api.js
│   ├── env.js
│   ├── helpers.js
│   └── storage.js
├── cloudfunctions/
│   ├── shared/
│   ├── login/
│   ├── placeOrder/
│   ├── payCallback/
│   ├── refund/
│   ├── review/
│   └── stats/
├── docs/
│   ├── database-schema.md
│   └── acceptance-report.md
└── tests/
    └── business.test.js
```

## 功能说明

### 用户端

1. 手机号登录 / 微信授权登录（演示模式）
2. 首页商家列表、分类筛选、搜索、Banner
3. 商家页商品展示、销量、评分、配送费、起送价
4. 购物车加减与结算
5. 下单：地址选择、备注、优惠券、模拟支付
6. 订单列表：待支付 / 待接单 / 配送中 / 已完成 / 退款
7. 退款申请与退款处理结果展示
8. 评价：星级、文字、示例图片
9. 个人中心：地址管理、优惠券、余额、客服、演示账号切换

### 商家端

1. 商家入驻申请（信息 + 资质模拟上传）
2. 商品管理（新增、编辑、上架、下架、改价、库存）
3. 订单处理（接单、拒单、标记配送）
4. 退款处理（通过 / 驳回）
5. 数据概览（订单、完成单、退款单、收入）

## 部署与运行

### 1. 导入微信开发者工具

1. 打开微信开发者工具
2. 选择“导入项目”
3. 项目目录选择 `wechat-delivery-app`
4. `AppID` 可先使用测试号或 `touristappid`
5. 导入后直接预览页面

### 2. 使用本地演示模式

默认配置在 `utils/env.js`：

```js
module.exports = {
  appName: "好近到家",
  useCloud: false,
  cloudEnvId: "replace-with-your-cloud-env-id",
  customerServicePhone: "400-880-7788"
};
```

默认 `useCloud: false`，小程序使用本地种子数据与本地状态存储，可直接演示完整链路。

### 3. 切换到云开发

如果要接入微信云开发：

1. 在微信开发者工具中开通云开发环境
2. 把 `utils/env.js` 中的 `useCloud` 改为 `true`
3. 把 `cloudEnvId` 改为你的环境 ID
4. 上传 `cloudfunctions/` 目录下的函数
5. 按 `docs/database-schema.md` 建立集合结构

> 当前云函数采用无外部依赖写法，核心业务规则与本地演示模式复用同一套 `shared/business.js`。

## 演示路径

### 用户端完整链路

1. 登录页选择“用户端演示账号”
2. 首页进入商家
3. 加入购物车并结算
4. 选择地址、填写备注、下单或模拟支付
5. 在订单详情中查看状态流转
6. 商家接单后进入配送
7. 用户确认收货并提交评价

### 商家端完整链路

1. 登录页选择“商家端演示账号”
2. 进入“商家”Tab
3. 处理用户下单后的待接单订单
4. 标记配送或处理退款
5. 编辑商品价格、库存与上下架状态

## 数据库结构

详见：`docs/database-schema.md`

## 验收报告

详见：`docs/acceptance-report.md`

## 自动化测试

在项目目录执行：

```bash
npm test
```

当前已覆盖：

- 重复下单幂等
- 库存不足保护
- 支付幂等
- 退款恢复库存
- 已完成订单只可评价一次
- 商家权限隔离
- 用户订单权限隔离
