import io
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import create_admin_token


class TestUpload:
    @pytest.mark.asyncio
    async def test_upload_image(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session, phone="13200000001")
        fake_image = io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"\x00" * 100)
        resp = await client.post(
            "/api/v1/upload",
            files={"file": ("test.png", fake_image, "image/png")},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["url"].startswith("/uploads/")
        assert data["filename"].endswith(".png")

    @pytest.mark.asyncio
    async def test_upload_invalid_type(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session, phone="13200000002")
        fake_file = io.BytesIO(b"not an image")
        resp = await client.post(
            "/api/v1/upload",
            files={"file": ("test.txt", fake_file, "text/plain")},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 400
        assert "不支持" in resp.json()["detail"]

    @pytest.mark.asyncio
    async def test_upload_too_large(self, client: AsyncClient, db_session: AsyncSession):
        token = await create_admin_token(client, db_session, phone="13200000003")
        large_file = io.BytesIO(b"\x00" * (6 * 1024 * 1024))
        resp = await client.post(
            "/api/v1/upload",
            files={"file": ("big.png", large_file, "image/png")},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 400
        assert "5MB" in resp.json()["detail"]

    @pytest.mark.asyncio
    async def test_upload_no_auth(self, client: AsyncClient):
        fake_image = io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"\x00" * 100)
        resp = await client.post(
            "/api/v1/upload",
            files={"file": ("test.png", fake_image, "image/png")},
        )
        assert resp.status_code in (401, 403)
