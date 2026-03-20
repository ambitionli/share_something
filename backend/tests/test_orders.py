import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import create_admin_token, create_buyer_token


async def _create_product(client: AsyncClient, token: str, name: str = "测试商品", price: str = "100.00", stock: int = 50) -> int:
    resp = await client.post("/api/v1/products", json={
        "name": name, "price": price, "stock": stock, "is_on_shelf": True,
    }, headers={"Authorization": f"Bearer {token}"})
    return resp.json()["id"]


async def _create_order(client: AsyncClient, token: str, product_id: int, qty: int = 1) -> dict:
    resp = await client.post("/api/v1/orders", json={
        "items": [{"product_id": product_id, "quantity": qty}],
        "shipping_address": {"name": "张三", "phone": "13800000000", "detail": "某某路1号"},
        "payment_method": "wechat",
    }, headers={"Authorization": f"Bearer {token}"})
    return resp.json()


class TestOrderCreation:
    @pytest.mark.asyncio
    async def test_create_order_success(self, client: AsyncClient, db_session: AsyncSession):
        admin_token = await create_admin_token(client, db_session)
        buyer_token = await create_buyer_token(client, phone="13100000099")
        pid = await _create_product(client, admin_token)

        resp = await client.post("/api/v1/orders", json={
            "items": [{"product_id": pid, "quantity": 2}],
            "shipping_address": {"name": "张三", "phone": "13800000000", "detail": "某某路1号"},
            "payment_method": "wechat",
        }, headers={"Authorization": f"Bearer {buyer_token}"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["status"] == "pending"
        assert data["total_amount"] == "200.00"
        assert len(data["items"]) == 1

    @pytest.mark.asyncio
    async def test_create_order_insufficient_stock(self, client: AsyncClient, db_session: AsyncSession):
        admin_token = await create_admin_token(client, db_session)
        buyer_token = await create_buyer_token(client, phone="13100000098")
        pid = await _create_product(client, admin_token, stock=5)

        resp = await client.post("/api/v1/orders", json={
            "items": [{"product_id": pid, "quantity": 10}],
            "shipping_address": {"name": "张三", "phone": "13800000000", "detail": "某某路1号"},
        }, headers={"Authorization": f"Bearer {buyer_token}"})
        assert resp.status_code == 400
        assert "库存不足" in resp.json()["detail"]

    @pytest.mark.asyncio
    async def test_create_order_off_shelf(self, client: AsyncClient, db_session: AsyncSession):
        admin_token = await create_admin_token(client, db_session)
        buyer_token = await create_buyer_token(client, phone="13100000097")
        resp = await client.post("/api/v1/products", json={
            "name": "下架商品", "price": "10.00", "stock": 100, "is_on_shelf": False,
        }, headers={"Authorization": f"Bearer {admin_token}"})
        pid = resp.json()["id"]

        resp = await client.post("/api/v1/orders", json={
            "items": [{"product_id": pid, "quantity": 1}],
            "shipping_address": {"name": "张三", "phone": "13800000000", "detail": "某某路1号"},
        }, headers={"Authorization": f"Bearer {buyer_token}"})
        assert resp.status_code == 400
        assert "已下架" in resp.json()["detail"]

    @pytest.mark.asyncio
    async def test_create_order_empty(self, client: AsyncClient, db_session: AsyncSession):
        buyer_token = await create_buyer_token(client, phone="13100000096")
        resp = await client.post("/api/v1/orders", json={
            "items": [],
            "shipping_address": {"name": "张三", "phone": "13800000000", "detail": "某某路1号"},
        }, headers={"Authorization": f"Bearer {buyer_token}"})
        assert resp.status_code == 400

    @pytest.mark.asyncio
    async def test_create_order_no_auth(self, client: AsyncClient):
        resp = await client.post("/api/v1/orders", json={
            "items": [{"product_id": 1, "quantity": 1}],
            "shipping_address": {"name": "张三", "phone": "13800000000", "detail": "某某路1号"},
        })
        assert resp.status_code in (401, 403)


class TestOrderFlow:
    @pytest.mark.asyncio
    async def test_full_order_lifecycle(self, client: AsyncClient, db_session: AsyncSession):
        """pending -> paid -> shipped -> completed"""
        admin_token = await create_admin_token(client, db_session)
        buyer_token = await create_buyer_token(client, phone="13100000090")
        pid = await _create_product(client, admin_token, stock=100)

        order = await _create_order(client, buyer_token, pid, qty=3)
        oid = order["id"]
        assert order["status"] == "pending"

        resp = await client.post(f"/api/v1/orders/{oid}/pay",
                                 headers={"Authorization": f"Bearer {buyer_token}"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "paid"
        assert resp.json()["payment_id"] is not None

        resp = await client.post(f"/api/v1/orders/{oid}/ship", json={
            "express_company": "顺丰速运",
            "tracking_number": "SF1234567890",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "shipped"
        assert resp.json()["tracking_number"] == "SF1234567890"

        resp = await client.post(f"/api/v1/orders/{oid}/confirm",
                                 headers={"Authorization": f"Bearer {buyer_token}"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "completed"

    @pytest.mark.asyncio
    async def test_cancel_pending_order_restores_stock(self, client: AsyncClient, db_session: AsyncSession):
        admin_token = await create_admin_token(client, db_session)
        buyer_token = await create_buyer_token(client, phone="13100000089")
        pid = await _create_product(client, admin_token, stock=50)

        order = await _create_order(client, buyer_token, pid, qty=10)
        oid = order["id"]

        prod_before = await client.get(f"/api/v1/products/{pid}")
        assert prod_before.json()["stock"] == 40

        resp = await client.post(f"/api/v1/orders/{oid}/cancel",
                                 headers={"Authorization": f"Bearer {buyer_token}"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "cancelled"

        prod_after = await client.get(f"/api/v1/products/{pid}")
        assert prod_after.json()["stock"] == 50

    @pytest.mark.asyncio
    async def test_cannot_ship_pending_order(self, client: AsyncClient, db_session: AsyncSession):
        admin_token = await create_admin_token(client, db_session)
        buyer_token = await create_buyer_token(client, phone="13100000088")
        pid = await _create_product(client, admin_token)
        order = await _create_order(client, buyer_token, pid)

        resp = await client.post(f"/api/v1/orders/{order['id']}/ship", json={
            "express_company": "顺丰", "tracking_number": "SF000",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 400

    @pytest.mark.asyncio
    async def test_cannot_confirm_paid_order(self, client: AsyncClient, db_session: AsyncSession):
        admin_token = await create_admin_token(client, db_session)
        buyer_token = await create_buyer_token(client, phone="13100000087")
        pid = await _create_product(client, admin_token)
        order = await _create_order(client, buyer_token, pid)

        await client.post(f"/api/v1/orders/{order['id']}/pay",
                          headers={"Authorization": f"Bearer {buyer_token}"})
        resp = await client.post(f"/api/v1/orders/{order['id']}/confirm",
                                 headers={"Authorization": f"Bearer {buyer_token}"})
        assert resp.status_code == 400

    @pytest.mark.asyncio
    async def test_cannot_cancel_shipped_order(self, client: AsyncClient, db_session: AsyncSession):
        admin_token = await create_admin_token(client, db_session)
        buyer_token = await create_buyer_token(client, phone="13100000086")
        pid = await _create_product(client, admin_token)
        order = await _create_order(client, buyer_token, pid)
        oid = order["id"]

        await client.post(f"/api/v1/orders/{oid}/pay", headers={"Authorization": f"Bearer {buyer_token}"})
        await client.post(f"/api/v1/orders/{oid}/ship", json={
            "express_company": "圆通", "tracking_number": "YT000",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        resp = await client.post(f"/api/v1/orders/{oid}/cancel",
                                 headers={"Authorization": f"Bearer {buyer_token}"})
        assert resp.status_code == 400

    @pytest.mark.asyncio
    async def test_duplicate_pay_rejected(self, client: AsyncClient, db_session: AsyncSession):
        admin_token = await create_admin_token(client, db_session)
        buyer_token = await create_buyer_token(client, phone="13100000085")
        pid = await _create_product(client, admin_token)
        order = await _create_order(client, buyer_token, pid)

        resp1 = await client.post(f"/api/v1/orders/{order['id']}/pay",
                                  headers={"Authorization": f"Bearer {buyer_token}"})
        assert resp1.status_code == 200
        resp2 = await client.post(f"/api/v1/orders/{order['id']}/pay",
                                  headers={"Authorization": f"Bearer {buyer_token}"})
        assert resp2.status_code == 400


class TestOrderQuery:
    @pytest.mark.asyncio
    async def test_list_my_orders(self, client: AsyncClient, db_session: AsyncSession):
        admin_token = await create_admin_token(client, db_session)
        buyer_token = await create_buyer_token(client, phone="13100000080")
        pid = await _create_product(client, admin_token)
        await _create_order(client, buyer_token, pid)
        await _create_order(client, buyer_token, pid)

        resp = await client.get("/api/v1/orders", headers={"Authorization": f"Bearer {buyer_token}"})
        assert resp.status_code == 200
        assert resp.json()["total"] == 2

    @pytest.mark.asyncio
    async def test_admin_list_all_orders(self, client: AsyncClient, db_session: AsyncSession):
        admin_token = await create_admin_token(client, db_session)
        buyer_token = await create_buyer_token(client, phone="13100000079")
        pid = await _create_product(client, admin_token)
        await _create_order(client, buyer_token, pid)

        resp = await client.get("/api/v1/orders/all", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert resp.json()["total"] >= 1

    @pytest.mark.asyncio
    async def test_buyer_cannot_list_all(self, client: AsyncClient, db_session: AsyncSession):
        buyer_token = await create_buyer_token(client, phone="13100000078")
        resp = await client.get("/api/v1/orders/all", headers={"Authorization": f"Bearer {buyer_token}"})
        assert resp.status_code == 403

    @pytest.mark.asyncio
    async def test_get_order_detail(self, client: AsyncClient, db_session: AsyncSession):
        admin_token = await create_admin_token(client, db_session)
        buyer_token = await create_buyer_token(client, phone="13100000077")
        pid = await _create_product(client, admin_token)
        order = await _create_order(client, buyer_token, pid)

        resp = await client.get(f"/api/v1/orders/{order['id']}",
                                headers={"Authorization": f"Bearer {buyer_token}"})
        assert resp.status_code == 200
        assert resp.json()["id"] == order["id"]
