# 微信小程序「邻刻达本地生活」

> 最后更新：**2026-04-16**

## 概述

仓库内新增独立目录 `miniprogram-local-life/`：微信小程序原生 + 云开发（统一云函数 `lnk_api`），覆盖用户购物、订单、评价、退款申请与商家入驻/商品/订单/统计等能力。

## 关键路径

- 小程序入口：`miniprogram-local-life/miniprogram/app.js`、`app.json`
- 云函数：`miniprogram-local-life/cloudfunctions/lnk_api/`
- 校验逻辑复用：`cloudfunctions/lnk_api/common/validators.js`（含 `mergeItems`、`buildOrderCents`）
- 自动化测试：`miniprogram-local-life/tests/validators.test.js`（`npm test`）
- 部署与数据结构：`miniprogram-local-life/README.md`、`DATABASE.md`

## 修改记录

- **2026-04-16**：初始提交完整小程序工程、云函数、数据库说明、验收报告与校验单测。
