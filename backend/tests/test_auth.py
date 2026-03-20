import pytest
from httpx import AsyncClient

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)


class TestPasswordHashing:
    def test_hash_and_verify(self):
        password = "test123456"
        hashed = hash_password(password)
        assert hashed != password
        assert verify_password(password, hashed)

    def test_wrong_password(self):
        hashed = hash_password("correct_password")
        assert not verify_password("wrong_password", hashed)

    def test_different_hashes_for_same_password(self):
        p = "same_password"
        assert hash_password(p) != hash_password(p)


class TestJWT:
    def test_create_and_decode_access_token(self):
        token = create_access_token(subject=42)
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "42"
        assert payload["type"] == "access"

    def test_create_and_decode_refresh_token(self):
        token = create_refresh_token(subject=42)
        payload = decode_token(token)
        assert payload is not None
        assert payload["sub"] == "42"
        assert payload["type"] == "refresh"

    def test_invalid_token(self):
        assert decode_token("invalid.token.here") is None

    def test_tampered_token(self):
        token = create_access_token(subject=1)
        tampered = token[:-5] + "XXXXX"
        assert decode_token(tampered) is None


class TestRegisterAPI:
    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/register", json={
            "phone": "13800138000",
            "password": "test123456",
            "nickname": "测试用户",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_register_duplicate_phone(self, client: AsyncClient):
        payload = {"phone": "13800138001", "password": "test123456"}
        resp1 = await client.post("/api/v1/auth/register", json=payload)
        assert resp1.status_code == 201

        resp2 = await client.post("/api/v1/auth/register", json=payload)
        assert resp2.status_code == 400
        assert "已被注册" in resp2.json()["detail"]

    @pytest.mark.asyncio
    async def test_register_invalid_phone(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/register", json={
            "phone": "12345",
            "password": "test123456",
        })
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_register_short_password(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/register", json={
            "phone": "13800138002",
            "password": "123",
        })
        assert resp.status_code == 422


class TestLoginAPI:
    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient):
        await client.post("/api/v1/auth/register", json={
            "phone": "13900139000",
            "password": "test123456",
        })
        resp = await client.post("/api/v1/auth/login", json={
            "phone": "13900139000",
            "password": "test123456",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient):
        await client.post("/api/v1/auth/register", json={
            "phone": "13900139001",
            "password": "test123456",
        })
        resp = await client.post("/api/v1/auth/login", json={
            "phone": "13900139001",
            "password": "wrongpassword",
        })
        assert resp.status_code == 401
        assert "密码错误" in resp.json()["detail"]

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/login", json={
            "phone": "13900139099",
            "password": "test123456",
        })
        assert resp.status_code == 401
        assert "用户不存在" in resp.json()["detail"]


class TestRefreshTokenAPI:
    @pytest.mark.asyncio
    async def test_refresh_success(self, client: AsyncClient):
        reg_resp = await client.post("/api/v1/auth/register", json={
            "phone": "13700137000",
            "password": "test123456",
        })
        refresh_token = reg_resp.json()["refresh_token"]

        resp = await client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data

    @pytest.mark.asyncio
    async def test_refresh_with_access_token_fails(self, client: AsyncClient):
        reg_resp = await client.post("/api/v1/auth/register", json={
            "phone": "13700137001",
            "password": "test123456",
        })
        access_token = reg_resp.json()["access_token"]

        resp = await client.post("/api/v1/auth/refresh", json={
            "refresh_token": access_token,
        })
        assert resp.status_code == 401

    @pytest.mark.asyncio
    async def test_refresh_with_invalid_token(self, client: AsyncClient):
        resp = await client.post("/api/v1/auth/refresh", json={
            "refresh_token": "invalid.token.value",
        })
        assert resp.status_code == 401


class TestMeAPI:
    @pytest.mark.asyncio
    async def test_get_me_success(self, client: AsyncClient):
        reg_resp = await client.post("/api/v1/auth/register", json={
            "phone": "13600136000",
            "password": "test123456",
            "nickname": "我是测试",
        })
        token = reg_resp.json()["access_token"]

        resp = await client.get("/api/v1/auth/me", headers={
            "Authorization": f"Bearer {token}",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["phone"] == "13600136000"
        assert data["nickname"] == "我是测试"
        assert data["role"] == "buyer"

    @pytest.mark.asyncio
    async def test_get_me_no_token(self, client: AsyncClient):
        resp = await client.get("/api/v1/auth/me")
        assert resp.status_code in (401, 403)

    @pytest.mark.asyncio
    async def test_get_me_invalid_token(self, client: AsyncClient):
        resp = await client.get("/api/v1/auth/me", headers={
            "Authorization": "Bearer invalid.token.here",
        })
        assert resp.status_code == 401
