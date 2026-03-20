# 阶段二：核心 API + 管理后台 - 完成记录

> 最后更新：2026-03-20

## Flutter 客户端

- 见 `doc_auto/mobile_flutter_services.md`（Dio、`/api/v1`、模型与测试）。

## 后端 API 新增

### 公司信息 (`/api/v1/company`)
- `GET /info` - 获取公司简介（公开）
- `PUT /info` - 更新公司简介（管理员）
- `GET /news` - 新闻列表（支持分页、published_only 筛选）
- `POST /news` - 创建新闻（管理员）
- `GET /news/:id` - 新闻详情
- `PUT /news/:id` - 更新新闻（管理员）
- `DELETE /news/:id` - 删除新闻（管理员）

### 商品管理 (`/api/v1/products`)
- `GET /` - 商品列表（分页、关键字搜索、上架筛选）
- `GET /:id` - 商品详情
- `POST /` - 创建商品（管理员）
- `PUT /:id` - 更新商品（管理员）
- `DELETE /:id` - 删除商品（管理员）

### 文件上传 (`/api/v1/upload`)
- `POST /` - 上传图片（管理员，限制 5MB、仅 JPEG/PNG/GIF/WebP）

## React 管理后台

### 技术栈
- React 18 + TypeScript + Vite
- Ant Design 5 组件库
- react-router-dom 路由
- zustand 状态管理
- axios HTTP 客户端
- i18next 国际化（默认简体中文，支持英文切换）

### 页面
- `/login` - 登录页（渐变背景，手机号+密码）
- `/` - 仪表盘（统计卡片：订单/商品/用户/营收）
- `/products` - 商品管理（表格+增删改查+上下架切换）
- `/company` - 公司信息管理（Tab：简介编辑 + 新闻管理）
- `/users` - 用户管理（列表展示）

### i18n 国际化
- 默认语言：简体中文 (zh-CN)
- 支持语言：英文 (en-US)
- 切换方式：顶栏右上角语言切换按钮
- Ant Design 组件也随语言切换（日期选择器、分页等）

## 测试结果
- 后端测试：46/46 通过
- 覆盖率：78%
- 前端构建：TypeScript 编译 + Vite 构建通过
