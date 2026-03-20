from decimal import Decimal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.order import Order
from app.models.product import Product
from app.models.user import User as UserModel

router = APIRouter(prefix="/admin", tags=["管理员"])


class DashboardStats(BaseModel):
    total_orders: int
    total_products: int
    total_users: int
    revenue: Decimal


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    _admin: UserModel = Depends(get_current_admin),
):
    total_orders = (await db.execute(select(func.count()).select_from(Order))).scalar() or 0
    total_products = (await db.execute(select(func.count()).select_from(Product))).scalar() or 0
    total_users = (await db.execute(select(func.count()).select_from(UserModel))).scalar() or 0

    revenue_result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0))
        .where(Order.status.in_(["paid", "shipped", "completed"]))
    )
    revenue = revenue_result.scalar() or Decimal("0")

    return DashboardStats(
        total_orders=total_orders,
        total_products=total_products,
        total_users=total_users,
        revenue=revenue,
    )
