from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class ShippingAddress(BaseModel):
    name: str
    phone: str
    province: str = ""
    city: str = ""
    district: str = ""
    detail: str = ""


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    shipping_address: ShippingAddress
    payment_method: str = "wechat"


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str = ""
    quantity: int
    unit_price: Decimal

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: Decimal
    status: str
    payment_method: str | None
    payment_id: str | None
    shipping_address: dict
    tracking_number: str | None
    express_company: str | None
    created_at: datetime
    items: list[OrderItemResponse] = []

    model_config = {"from_attributes": True}


class PaginatedOrders(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    page_size: int


class ShipRequest(BaseModel):
    express_company: str
    tracking_number: str


class PaymentNotify(BaseModel):
    order_id: int
    payment_id: str
    status: str = "success"
