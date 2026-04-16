# 邻里即达微信小程序

原生微信小程序 + 云开发示例项目，覆盖本地生活服务、商家入驻、用户下单、配送、评价、退款全链路。

## 功能清单

### 用户端
- 手机号登录 / 微信授权登录（演示模式）
- 首页商家列表、分类、搜索、Banner
- 商家页浏览商品、加减购物车
- 购物车与结算
- 模拟支付、订单列表、订单轨迹
- 退款申请、评价提交
- 个人中心、地址管理、优惠券、余额、客服、设置

### 商家端
- 商家入驻
- 商品新增、编辑、上下架、库存管理
- 订单接单 / 拒单 / 标记配送
- 退款审核
- 销量、收入、退款数据概览

### 云开发
- 云函数：`login`、`placeOrder`、`paymentCallback`、`refund`、`review`、`stats`
- 数据集合说明见 `database/schema.md`

## 目录结构

```text
wechat-miniapp/
├── app.js / app.json / app.wxss
├── pages/                  # 小程序页面
├── services/api.js         # 页面统一调用入口
├── shared/                 # 共享种子数据与订单业务引擎
├── cloudfunctions/         # 云函数
├── database/schema.md      # 数据结构说明
└── test/                   # 自动验收测试
```

## 运行方式

### 1. 微信开发者工具导入
1. 打开微信开发者工具
2. 选择“导入项目”
3. 项目目录选择 `wechat-miniapp`
4. AppID 可先使用测试号 / 游客模式
5. 勾选“不校验合法域名”

### 2. 当前默认模式
- 默认使用本地 mock 数据存储在 `wx.setStorageSync`
- 直接可跑通演示链路，无需先配置真实云环境

### 3. 切换到云开发
1. 在微信开发者工具中开通云开发环境
2. 将 `app.js` 中 `cloudEnvId` 改为实际环境 ID
3. 在云开发控制台创建 `database/schema.md` 中列出的集合
4. 上传 `cloudfunctions/` 下全部云函数
5. 如需真实数据持久化，可将 `services/api.js` 里的本地 mock 调用替换为 `wx.cloud.callFunction`

## 演示账号

- 买家账号：`13800000000`
- 商家账号：`13900000000`
- 演示验证码固定：`123456`

## 核心业务规则

- 下单使用幂等 `submitToken`，防止重复提交
- 购物车数量不能为负数
- 商品库存不能为负数
- 商家接单前后状态严格校验
- 退款有状态流转，已评价订单禁止退款
- 商家拒单自动退款并恢复库存

## 自动验收

在 `wechat-miniapp` 目录执行：

```bash
npm test
```

验收覆盖：
- 首页与搜索数据
- 加购与结算
- 下单、支付、接单、配送、完成、评价
- 退款申请与审核
- 商家商品新增、编辑、上下架
- 非法库存、重复支付、重复评价等异常路径

## 交付说明

- 小程序源码：当前 `wechat-miniapp/`
- 云函数源码：`wechat-miniapp/cloudfunctions/`
- 数据库结构：`wechat-miniapp/database/schema.md`
- 验收报告：`wechat-miniapp/acceptance-report.md`

