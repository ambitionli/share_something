# 微信小程序：今晚吃点啥

本项目是一个可直接导入微信开发者工具的原生微信小程序示例，覆盖以下完整业务：

- 本地生活服务首页、商家列表、搜索、分类、Banner
- 用户手机号登录 / 微信授权登录（模拟）
- 商家页、商品浏览、购物车、结算、地址管理
- 下单、模拟支付、商家接单、配送、完成、评价
- 用户退款、商家处理退款
- 商家入驻、商品管理、订单管理、数据概览
- 云函数目录与数据库结构说明

> 为了保证在未配置真实云环境时也能直接演示，本项目默认通过 `utils/store.js + shared/core.js` 使用本地持久化数据完成全流程。
> 云函数目录已按微信云开发结构提供，可作为迁移到真实云环境的后端基础。

## 目录结构

```text
wechat-miniapp/
├── app.js
├── app.json
├── app.wxss
├── project.config.json
├── pages/                 # 小程序页面
├── shared/core.js         # 核心业务逻辑：状态机、库存、订单、退款、评价
├── utils/store.js         # 本地运行层与页面服务封装
├── cloudfunctions/        # 云函数目录
├── tests/core.test.js     # 验收 AI 自检测试
├── DATABASE.md            # 数据库结构说明
└── ACCEPTANCE_REPORT.md   # 自检验收报告
```

## 页面与功能

### 用户端

- `pages/login`：手机号登录 / 微信授权登录（模拟）
- `pages/home`：商家列表、分类、搜索、Banner
- `pages/merchant`：商家详情、商品列表、评分、销量、配送信息
- `pages/cart`：购物车加减、清空、金额汇总
- `pages/checkout`：地址选择、备注、优惠券、模拟支付
- `pages/orders`：待支付 / 待接单 / 配送中 / 已完成 / 已退款 等状态查看与操作
- `pages/review`：星级 + 文字 + 图片链接评价
- `pages/address`：地址管理
- `pages/profile`：余额、优惠券、客服、设置、商家端入口

### 商家端

- `pages/merchantCenter`
  - 商家入驻（信息 + 资质链接）
  - 商品管理（新增、编辑、上下架、库存、价格）
  - 订单管理（接单、拒单、标记配送、处理退款）
  - 数据概览（订单数、收入、退款、活跃商品）

## 快速运行

### 方式一：微信开发者工具

1. 打开微信开发者工具
2. 选择“导入项目”
3. 项目目录选择 `wechat-miniapp`
4. AppID 可使用测试号或 `touristappid`
5. 直接编译运行

默认会加载一份本地演示数据，并持久化到 `wx.setStorageSync`。

### 方式二：运行自动验收测试

本项目附带 Node 自检测试，可在仓库中运行：

```bash
cd wechat-miniapp
npm test
```

## 默认演示账号

- 用户账号：`13800000002`
- 商家账号：`13800000001`

你也可以在登录页输入任意手机号自动注册新账号。

## 核心业务规则

- 购物车仅允许单商家结算
- 库存不足不能加购和下单
- 订单金额不能为负数
- 待支付订单可取消，取消后恢复库存并返还优惠券
- 已支付待接单 / 已接单订单可申请退款
- 商家拒单直接退款
- 退款完成恢复库存
- 已完成订单只允许评价一次

## 云函数说明

云函数目录如下：

- `login`：登录
- `placeOrder`：创建订单
- `payCallback`：支付回调
- `refund`：退款申请 / 处理
- `review`：提交评价
- `stats`：商家数据统计

这些函数当前直接复用 `shared/core.js` 的业务逻辑，便于后续替换为真实数据库调用。

## 部署到真实云开发的建议

1. 将 `shared/core.js` 的状态读写替换为云数据库读写
2. 将 `utils/store.js` 中的本地存储改为 `wx.cloud.callFunction`
3. 配置云环境 ID
4. 将图片链接上传替换为 `wx.chooseMedia + 云存储`
5. 将模拟支付替换为真实支付参数签名流程

## 交付说明

- 可直接导入的微信小程序工程：`wechat-miniapp/`
- 云函数代码：`wechat-miniapp/cloudfunctions/`
- 数据库结构说明：`wechat-miniapp/DATABASE.md`
- 验收报告：`wechat-miniapp/ACCEPTANCE_REPORT.md`

---

最后更新：2026-04-16
