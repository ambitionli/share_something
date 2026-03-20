from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.models.user import User


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_phone(self, phone: str) -> User | None:
        result = await self.db.execute(select(User).where(User.phone == phone))
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: int) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def register(self, phone: str, password: str, nickname: str = "") -> User:
        existing = await self.get_user_by_phone(phone)
        if existing:
            raise ValueError("该手机号已被注册")

        user = User(
            phone=phone,
            password_hash=hash_password(password),
            nickname=nickname or f"用户{phone[-4:]}",
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def login(self, phone: str, password: str) -> User:
        user = await self.get_user_by_phone(phone)
        if user is None:
            raise ValueError("用户不存在")
        if not verify_password(password, user.password_hash):
            raise ValueError("密码错误")
        return user

    def create_tokens(self, user_id: int) -> dict:
        return {
            "access_token": create_access_token(user_id),
            "refresh_token": create_refresh_token(user_id),
            "token_type": "bearer",
        }

    async def refresh_access_token(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if payload is None:
            raise ValueError("无效的刷新令牌")
        if payload.get("type") != "refresh":
            raise ValueError("令牌类型错误")

        user_id = int(payload["sub"])
        user = await self.get_user_by_id(user_id)
        if user is None:
            raise ValueError("用户不存在")

        return self.create_tokens(user.id)
