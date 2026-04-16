# 邻里即达微信小程序

原生微信小程序 + 演示版云开发契约，实现本地生活配送、商家入驻、购物车、下单支付、退款、评价与商家工作台。

## 功能概览
- 用户端：手机号登录 / 微信授权登录（演示）、首页商家列表、分类搜索、商家详情、购物车、结算、订单、退款、评价、个人中心、地址管理、优惠券、余额、客服、设置
- 商家端：商家入驻、商品管理（新增 / 改价 / 库存 / 上下架）、订单管理（接单 / 拒单 / 标记配送 / 处理退款）、数据概览
- 云开发：提供 `login`、`placeOrder`、`payCallback`、`refund`、`submitReview`、`stats`、`merchantOps` 云函数目录与数据库结构说明
- 验收：内置 Node 测试覆盖核心业务逻辑与项目结构

## 目录结构

```text
wechat-miniprogram/
├── app.js
├── app.json
├── app.wxss
├── config/
├── database/
├── cloudfunctions/
├── pages/
├── services/
├── shared/
└── tests/
```

## 快速体验

### 1. 微信开发者工具直接导入
- 打开微信开发者工具
- 选择 `wechat-miniprogram/` 作为项目目录
- `project.config.json` 使用 `touristappid`，可直接游客模式打开
- 默认运行在 **Demo 模式**，无需云环境即可完成全流程体验

### 2. 演示账号
- 买家演示账号：`18800001111`
- 商家演示账号：`16600002222`
- 也支持“微信授权登录（演示）”直接创建临时用户

### 3. Demo 模式说明
默认 `config/env.js` 中 `useCloud = false`，所有业务逻辑由 `shared/engine.js + services/app-service.js` 驱动，并持久化到小程序本地存储，适合直接验收 UI 与流程。

## 切换到云开发模式

1. 在微信开发者工具中开通云开发环境
2. 将 `config/env.js` 的 `cloudEnvId` 填为你的环境 ID
3. 在设置页打开“云开发模式”开关
4. 进入 `cloudfunctions/*` 目录分别安装依赖并上传部署：
   ```bash
   cd cloudfunctions/login && npm install
   cd ../placeOrder && npm install
   cd ../payCallback && npm install
   cd ../refund && npm install
   cd ../submitReview && npm install
   cd ../stats && npm install
   cd ../merchantOps && npm install
   ```
5. 根据 `database/schema.md` 创建集合并设置权限

## 测试与验收

在仓库中执行：

```bash
cd wechat-miniprogram
npm test
npm run acceptance
```

测试内容：
- 下单支付全链路
- 退款流程
- 商家商品与订单管理
- 库存与金额保护
- 小程序页面与云函数目录结构校验

## 关键设计说明
- 使用纯 JS 业务引擎统一订单状态机，避免页面逻辑分散
- 对支付做幂等保护，重复支付不会重复扣库存
- 对商品价格、库存、优惠券、起送价进行显式校验
- 商家演示入驻默认自动通过，便于验收工作台链路
- 订单支持状态时间线展示，方便用户与商家端同步流程

## 交付内容
- 原生微信小程序项目代码
- 云函数代码目录
- 数据库结构说明
- 自动化测试与验收报告脚本
