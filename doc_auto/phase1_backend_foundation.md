# 阶段一：后端基础 - 完成记录

> 最后更新：2026-03-20

## 完成内容

### 项目脚手架
- FastAPI 应用入口：`backend/app/main.py`
- 配置管理：`backend/app/core/config.py`（使用 pydantic-settings，支持 .env 文件）
- 数据库连接：`backend/app/core/database.py`（SQLAlchemy 2.0 async，AsyncSession）
- Docker Compose：`docker-compose.yml`（PostgreSQL 15、Redis 7、MinIO）

### 数据库模型
- 用户表：`backend/app/models/user.py`
- 公司信息表：`backend/app/models/company.py`
- 商品表：`backend/app/models/product.py`
- 订单表：`backend/app/models/order.py`

### Alembic 迁移
- 配置文件：`backend/alembic.ini`
- 迁移环境：`backend/alembic/env.py`（已导入所有模型）
- 注意：需要 Docker 启动 PostgreSQL 后才能执行 `alembic revision --autogenerate` 和 `alembic upgrade head`

### 认证系统
- 密码哈希：bcrypt（passlib）
- JWT 令牌：access token（30分钟）+ refresh token（7天）
- API 接口：
  - `POST /api/v1/auth/register` - 手机号注册
  - `POST /api/v1/auth/login` - 手机号+密码登录
  - `POST /api/v1/auth/refresh` - 刷新令牌
  - `GET /api/v1/auth/me` - 获取当前用户信息
- 权限依赖：`get_current_user`（普通用户）、`get_current_admin`（管理员）

### 测试
- 20 个测试全部通过
- 覆盖：密码哈希（3）、JWT 令牌（4）、注册 API（4）、登录 API（3）、刷新令牌（3）、用户信息（3）
- 测试使用 SQLite 内存数据库，不依赖 Docker

## 待完成（需要 Docker）
- 安装 Docker Desktop（需手动安装，因为 brew 安装需要 sudo 密码）
- 启动 `docker-compose up -d` 运行 PostgreSQL、Redis、MinIO
- 执行 Alembic 迁移创建数据库表
- 启动 FastAPI 服务 `uvicorn app.main:app --reload`

## 技术栈版本
- Python 3.11.15
- FastAPI 0.135.1
- SQLAlchemy 2.0.48
- Alembic 1.18.4
- bcrypt 4.0.1（pinned，passlib 兼容性）
