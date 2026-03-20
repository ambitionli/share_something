from datetime import datetime, timezone

from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(128))
    wechat_openid: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    nickname: Mapped[str] = mapped_column(String(50), default="")
    avatar_url: Mapped[str] = mapped_column(String(500), default="")
    role: Mapped[str] = mapped_column(String(10), default="buyer")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
