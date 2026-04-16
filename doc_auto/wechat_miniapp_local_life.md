# 微信小程序本地生活项目 - 交付同步文档

> 最后更新：2026-04-16 00:00 UTC

## 项目定位
- 新增独立目录 `wechat-miniapp/`，不改动现有 Flutter、FastAPI、React 管理端。
- 技术栈采用微信小程序原生 `WXML + WXSS + JS`，默认本地 Mock 运行。
- 同时提供云函数目录与云数据库结构说明，方便后续接入真实云开发。

## 已实现模块

### 用户端
- 登录：手机号登录、微信昵称授权登录（演示模式）
- 首页：Banner、分类、搜索、商家列表
- 商家页：商品列表、价格、销量、评分、配送费、起送价
- 购物车：加减、跨店隔离、金额汇总
- 下单：地址选择、备注、模拟支付、订单创建
- 订单：待支付、待接单、配送中、已完成、退款
- 评价：星级、文字、图片 ID/URL 输入
- 个人中心：地址、余额、优惠券、客服、设置展示

### 商家端
- 商家入驻：信息 + 资质说明
- 商品管理：新增、编辑、改价、改库存、上下架
- 订单管理：接单、拒单、标记配送、处理退款
- 数据概览：订单量、收入、退款、待处理订单

### 业务逻辑防护
- 防重复下单（按商品指纹 + 未完成订单检测）
- 防负库存和超卖
- 防跨店购物车混加
- 防非法状态流转
- 防无效价格输入

### 云开发交付
- `cloudfunctions/login`
- `cloudfunctions/placeOrder`
- `cloudfunctions/paymentNotify`
- `cloudfunctions/refundOrder`
- `cloudfunctions/submitReview`
- `cloudfunctions/stats`
- 数据结构说明：`wechat-miniapp/database/schema.md`

## 自动验收
- Node 测试文件：`wechat-miniapp/scripts/acceptance.test.js`
- 结构测试文件：`wechat-miniapp/scripts/structure.test.js`
- 执行命令：`npm test`

## 修改时间
2026-04-16 00:00 UTC
