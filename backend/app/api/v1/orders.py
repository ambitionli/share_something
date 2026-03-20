from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_admin
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderItemResponse,
    PaginatedOrders,
    ShipRequest,
)

router = APIRouter(prefix="/orders", tags=["订单"])

VALID_TRANSITIONS = {
    "pending": ["paid", "cancelled"],
    "paid": ["shipped", "cancelled"],
    "shipped": ["completed"],
    "completed": [],
    "cancelled": [],
}


def _build_order_response(order: Order) -> OrderResponse:
    items = []
    for item in order.items:
        items.append(OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
        ))
    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        total_amount=order.total_amount,
        status=order.status,
        payment_method=order.payment_method,
        payment_id=order.payment_id,
        shipping_address=order.shipping_address or {},
        tracking_number=order.tracking_number,
        express_company=order.express_company,
        created_at=order.created_at,
        items=items,
    )


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    body: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not body.items:
        raise HTTPException(status_code=400, detail="订单不能为空")

    product_ids = [item.product_id for item in body.items]
    result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    products = {p.id: p for p in result.scalars().all()}

    order_items = []
    total = Decimal("0")

    for item in body.items:
        product = products.get(item.product_id)
        if product is None:
            raise HTTPException(status_code=400, detail=f"商品 {item.product_id} 不存在")
        if not product.is_on_shelf:
            raise HTTPException(status_code=400, detail=f"商品 {product.name} 已下架")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"商品 {product.name} 库存不足")

        line_total = product.price * item.quantity
        total += line_total
        order_items.append(OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price,
        ))
        product.stock -= item.quantity

    order = Order(
        user_id=current_user.id,
        total_amount=total,
        status="pending",
        payment_method=body.payment_method,
        shipping_address=body.shipping_address.model_dump(),
        items=order_items,
    )
    db.add(order)
    await db.flush()
    await db.refresh(order)
    return _build_order_response(order)


@router.get("", response_model=PaginatedOrders)
async def list_my_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    status_filter: str = "",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    base_q = select(Order).where(Order.user_id == current_user.id)
    if status_filter:
        base_q = base_q.where(Order.status == status_filter)

    count_q = select(func.count()).select_from(base_q.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    items_q = base_q.options(selectinload(Order.items)).order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(items_q)
    orders = result.scalars().unique().all()

    return PaginatedOrders(
        items=[_build_order_response(o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/all", response_model=PaginatedOrders)
async def list_all_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    status_filter: str = "",
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    base_q = select(Order)
    if status_filter:
        base_q = base_q.where(Order.status == status_filter)

    count_q = select(func.count()).select_from(base_q.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    items_q = base_q.options(selectinload(Order.items)).order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(items_q)
    orders = result.scalars().unique().all()

    return PaginatedOrders(
        items=[_build_order_response(o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Order).options(selectinload(Order.items)).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="无权查看该订单")
    return _build_order_response(order)


@router.post("/{order_id}/pay", response_model=OrderResponse)
async def simulate_pay(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Simulate payment success (real integration in Phase 5)."""
    result = await db.execute(select(Order).options(selectinload(Order.items)).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权操作该订单")
    if order.status != "pending":
        raise HTTPException(status_code=400, detail=f"当前状态 {order.status} 不能支付")

    order.status = "paid"
    order.payment_id = f"SIM_{order.id}_{current_user.id}"
    await db.flush()
    await db.refresh(order)
    return _build_order_response(order)


@router.post("/{order_id}/ship", response_model=OrderResponse)
async def ship_order(
    order_id: int,
    body: ShipRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(Order).options(selectinload(Order.items)).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.status != "paid":
        raise HTTPException(status_code=400, detail=f"当前状态 {order.status} 不能发货")

    order.status = "shipped"
    order.express_company = body.express_company
    order.tracking_number = body.tracking_number
    await db.flush()
    await db.refresh(order)
    return _build_order_response(order)


@router.post("/{order_id}/confirm", response_model=OrderResponse)
async def confirm_receipt(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Order).options(selectinload(Order.items)).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="无权操作该订单")
    if order.status != "shipped":
        raise HTTPException(status_code=400, detail=f"当前状态 {order.status} 不能确认收货")

    order.status = "completed"
    await db.flush()
    await db.refresh(order)
    return _build_order_response(order)


@router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Order).options(selectinload(Order.items)).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="无权操作该订单")
    if order.status not in ("pending", "paid"):
        raise HTTPException(status_code=400, detail=f"当前状态 {order.status} 不能取消")

    if order.status in ("pending", "paid"):
        for item in order.items:
            prod_result = await db.execute(select(Product).where(Product.id == item.product_id))
            product = prod_result.scalar_one_or_none()
            if product:
                product.stock += item.quantity

    order.status = "cancelled"
    await db.flush()
    await db.refresh(order)
    return _build_order_response(order)
