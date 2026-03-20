# 阶段一：后端基础 - 完成记录

> 最后更新：2026-03-20（SMS 验证码、微信 OAuth Mock、全局异常与 Request-ID）

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
- Redis 辅助：`app/core/redis.py`（`get_redis()` 单例，`redis.asyncio`）
- SMS Redis 键：`app/core/sms_keys.py`（验证码 `sms:{phone}` 5 分钟、发送间隔 `sms_limit:{phone}` 60 秒）
- API 接口：
  - `POST /api/v1/auth/register` - 手机号注册
  - `POST /api/v1/auth/login` - 手机号+密码登录
  - `POST /api/v1/auth/refresh` - 刷新令牌
  - `GET /api/v1/auth/me` - 获取当前用户信息
  - `POST /api/v1/auth/sms/send` - 发送短信验证码（`DEBUG=True` 时在响应中返回 `code` 便于联调）
  - `POST /api/v1/auth/sms/verify` - 校验验证码并登录；无用户则自动注册后签发令牌
  - `POST /api/v1/auth/wechat` - 微信登录（`DEBUG` 下 mock openid；未绑定用户返回 `needs_bindphone` + `temp_openid`）
  - `POST /api/v1/auth/wechat/bindphone` - 校验短信后绑定手机号与 `openid`（`DEBUG` 下可用）
- 全局：`ValueError` → 400；其余未处理异常 → 500 并写日志；`RequestIdMiddleware` 响应头 `X-Request-ID`
- 权限依赖：`get_current_user`（普通用户）、`get_current_admin`（管理员）

### 测试
- 全量 pytest 通过（含 SMS：`tests/test_sms.py`，`conftest` 内 dict 假 Redis）
- 覆盖：密码哈希、JWT、注册/登录/刷新/me、公司/商品/订单/上传、SMS 发送/校验/限流/过期等
- 测试库：`sqlite+aiosqlite:///:memory:`，建表前显式导入各模型模块以保证 `Base.metadata` 完整；`import app.models.*` 须在 `from app.main import app` 之前，避免 `app` 被包名遮蔽

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
