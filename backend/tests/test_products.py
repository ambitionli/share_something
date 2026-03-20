import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import create_admin_token, create_buyer_token


class TestProductCRUD:
    @pytest.mark.asyncio
    async def test_create_product(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        resp = await client.post("/api/v1/products", json={
            "name": "测试商品",
            "description": "商品描述",
            "price": "99.99",
            "stock": 100,
            "is_on_shelf": True,
            "images": ["img1.jpg"],
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "测试商品"
        assert data["price"] == "99.99"
        assert data["stock"] == 100

    @pytest.mark.asyncio
    async def test_create_product_buyer_forbidden(self, client: AsyncClient):
        token = await create_buyer_token(client)
        resp = await client.post("/api/v1/products", json={
            "name": "非法商品",
            "price": "10.00",
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 403

    @pytest.mark.asyncio
    async def test_list_products_on_shelf_only(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        await client.post("/api/v1/products", json={
            "name": "上架商品", "price": "10.00", "is_on_shelf": True,
        }, headers={"Authorization": f"Bearer {token}"})
        await client.post("/api/v1/products", json={
            "name": "下架商品", "price": "20.00", "is_on_shelf": False,
        }, headers={"Authorization": f"Bearer {token}"})

        resp = await client.get("/api/v1/products", params={"on_shelf_only": True})
        data = resp.json()
        assert data["total"] == 1
        assert data["items"][0]["name"] == "上架商品"

    @pytest.mark.asyncio
    async def test_list_all_products(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        await client.post("/api/v1/products", json={
            "name": "商品A", "price": "10.00", "is_on_shelf": True,
        }, headers={"Authorization": f"Bearer {token}"})
        await client.post("/api/v1/products", json={
            "name": "商品B", "price": "20.00", "is_on_shelf": False,
        }, headers={"Authorization": f"Bearer {token}"})

        resp = await client.get("/api/v1/products", params={"on_shelf_only": False})
        assert resp.json()["total"] == 2

    @pytest.mark.asyncio
    async def test_search_products(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        await client.post("/api/v1/products", json={
            "name": "苹果手机", "price": "5999.00", "is_on_shelf": True,
        }, headers={"Authorization": f"Bearer {token}"})
        await client.post("/api/v1/products", json={
            "name": "华为平板", "price": "3999.00", "is_on_shelf": True,
        }, headers={"Authorization": f"Bearer {token}"})

        resp = await client.get("/api/v1/products", params={"keyword": "苹果", "on_shelf_only": False})
        data = resp.json()
        assert data["total"] == 1
        assert data["items"][0]["name"] == "苹果手机"

    @pytest.mark.asyncio
    async def test_get_product(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        create_resp = await client.post("/api/v1/products", json={
            "name": "详情商品", "price": "50.00",
        }, headers={"Authorization": f"Bearer {token}"})
        pid = create_resp.json()["id"]

        resp = await client.get(f"/api/v1/products/{pid}")
        assert resp.status_code == 200
        assert resp.json()["name"] == "详情商品"

    @pytest.mark.asyncio
    async def test_get_nonexistent_product(self, client: AsyncClient):
        resp = await client.get("/api/v1/products/99999")
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_update_product(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        create_resp = await client.post("/api/v1/products", json={
            "name": "旧名称", "price": "10.00",
        }, headers={"Authorization": f"Bearer {token}"})
        pid = create_resp.json()["id"]

        resp = await client.put(f"/api/v1/products/{pid}", json={
            "name": "新名称", "price": "20.00", "is_on_shelf": True,
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "新名称"
        assert data["price"] == "20.00"
        assert data["is_on_shelf"] is True

    @pytest.mark.asyncio
    async def test_toggle_shelf(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        create_resp = await client.post("/api/v1/products", json={
            "name": "上下架测试", "price": "10.00", "is_on_shelf": False,
        }, headers={"Authorization": f"Bearer {token}"})
        pid = create_resp.json()["id"]

        resp = await client.put(f"/api/v1/products/{pid}", json={
            "is_on_shelf": True,
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.json()["is_on_shelf"] is True

        resp2 = await client.put(f"/api/v1/products/{pid}", json={
            "is_on_shelf": False,
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp2.json()["is_on_shelf"] is False

    @pytest.mark.asyncio
    async def test_delete_product(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        create_resp = await client.post("/api/v1/products", json={
            "name": "即将删除", "price": "10.00",
        }, headers={"Authorization": f"Bearer {token}"})
        pid = create_resp.json()["id"]

        resp = await client.delete(f"/api/v1/products/{pid}",
                                   headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 204

        resp2 = await client.get(f"/api/v1/products/{pid}")
        assert resp2.status_code == 404

    @pytest.mark.asyncio
    async def test_negative_price_rejected(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        resp = await client.post("/api/v1/products", json={
            "name": "负价格", "price": "-10.00",
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_negative_stock_rejected(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        resp = await client.post("/api/v1/products", json={
            "name": "负库存", "price": "10.00", "stock": -5,
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 422
