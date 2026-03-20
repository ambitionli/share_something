import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import create_admin_token, create_buyer_token


class TestCompanyInfo:
    @pytest.mark.asyncio
    async def test_get_info_empty(self, client: AsyncClient):
        resp = await client.get("/api/v1/company/info")
        assert resp.status_code == 200
        assert resp.json() is None

    @pytest.mark.asyncio
    async def test_update_info_as_admin(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        resp = await client.put("/api/v1/company/info", json={
            "title": "测试公司",
            "description": "公司简介",
            "photos": ["photo1.jpg", "photo2.jpg"],
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "测试公司"
        assert len(data["photos"]) == 2

    @pytest.mark.asyncio
    async def test_update_info_as_buyer_forbidden(self, client: AsyncClient):
        token = await create_buyer_token(client)
        resp = await client.put("/api/v1/company/info", json={
            "title": "不应成功",
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 403

    @pytest.mark.asyncio
    async def test_update_then_get(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        await client.put("/api/v1/company/info", json={
            "title": "更新公司",
            "description": "新简介",
        }, headers={"Authorization": f"Bearer {token}"})

        resp = await client.get("/api/v1/company/info")
        assert resp.status_code == 200
        assert resp.json()["title"] == "更新公司"


class TestNews:
    @pytest.mark.asyncio
    async def test_create_news(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        resp = await client.post("/api/v1/company/news", json={
            "title": "重大新闻",
            "content": "详细内容...",
            "is_published": True,
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "重大新闻"
        assert data["is_published"] is True
        assert data["published_at"] is not None

    @pytest.mark.asyncio
    async def test_list_news_published_only(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        await client.post("/api/v1/company/news", json={
            "title": "已发布", "is_published": True,
        }, headers={"Authorization": f"Bearer {token}"})
        await client.post("/api/v1/company/news", json={
            "title": "草稿", "is_published": False,
        }, headers={"Authorization": f"Bearer {token}"})

        resp = await client.get("/api/v1/company/news", params={"published_only": True})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["items"][0]["title"] == "已发布"

    @pytest.mark.asyncio
    async def test_list_news_all(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        await client.post("/api/v1/company/news", json={
            "title": "新闻1", "is_published": True,
        }, headers={"Authorization": f"Bearer {token}"})
        await client.post("/api/v1/company/news", json={
            "title": "新闻2", "is_published": False,
        }, headers={"Authorization": f"Bearer {token}"})

        resp = await client.get("/api/v1/company/news", params={"published_only": False})
        assert resp.json()["total"] == 2

    @pytest.mark.asyncio
    async def test_update_news(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        create_resp = await client.post("/api/v1/company/news", json={
            "title": "原标题",
        }, headers={"Authorization": f"Bearer {token}"})
        news_id = create_resp.json()["id"]

        resp = await client.put(f"/api/v1/company/news/{news_id}", json={
            "title": "新标题",
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json()["title"] == "新标题"

    @pytest.mark.asyncio
    async def test_delete_news(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session)
        create_resp = await client.post("/api/v1/company/news", json={
            "title": "即将删除",
        }, headers={"Authorization": f"Bearer {token}"})
        news_id = create_resp.json()["id"]

        resp = await client.delete(f"/api/v1/company/news/{news_id}",
                                   headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 204

        resp2 = await client.get(f"/api/v1/company/news/{news_id}")
        assert resp2.status_code == 404

    @pytest.mark.asyncio
    async def test_get_nonexistent_news(self, client: AsyncClient):
        resp = await client.get("/api/v1/company/news/99999")
        assert resp.status_code == 404
