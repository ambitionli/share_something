from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, field_validator


class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: Decimal
    images: list[str] = []
    stock: int = 0
    is_on_shelf: bool = False

    @field_validator("price")
    @classmethod
    def validate_price(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("价格不能为负数")
        return v

    @field_validator("stock")
    @classmethod
    def validate_stock(cls, v: int) -> int:
        if v < 0:
            raise ValueError("库存不能为负数")
        return v


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    images: list[str] | None = None
    stock: int | None = None
    is_on_shelf: bool | None = None


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    price: Decimal
    images: list[str]
    stock: int
    is_on_shelf: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedProducts(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
