from datetime import datetime
from decimal import Decimal

from sqlalchemy import String, Text, DateTime, Boolean, JSON, Numeric, Integer, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    images: Mapped[list] = mapped_column(JSON, default=list)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    is_on_shelf: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
