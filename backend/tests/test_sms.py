import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.core.sms_keys import sms_code_key
from app.models.user import User


@pytest.mark.asyncio
async def test_send_sms_returns_code_in_dev_mode(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/sms/send",
        json={"phone": "13800138000"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("message") == "ok"
    assert "code" in data
    assert data["code"] is not None
    assert len(data["code"]) == 6
    assert data["code"].isdigit()


@pytest.mark.asyncio
async def test_verify_sms_correct_code_returns_tokens(client: AsyncClient, fake_redis):
    phone = "13800138001"
    send_resp = await client.post(
        "/api/v1/auth/sms/send",
        json={"phone": phone},
    )
    assert send_resp.status_code == 200
    code = send_resp.json()["code"]

    verify_resp = await client.post(
        "/api/v1/auth/sms/verify",
        json={"phone": phone, "code": code},
    )
    assert verify_resp.status_code == 200
    body = verify_resp.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["token_type"] == "bearer"

    stored = await fake_redis.get(sms_code_key(phone))
    assert stored is None


@pytest.mark.asyncio
async def test_verify_sms_wrong_code(client: AsyncClient):
    phone = "13800138002"
    send_resp = await client.post(
        "/api/v1/auth/sms/send",
        json={"phone": phone},
    )
    code = send_resp.json()["code"]
    wrong = f"{(int(code) + 1) % 1000000:06d}"

    verify_resp = await client.post(
        "/api/v1/auth/sms/verify",
        json={"phone": phone, "code": wrong},
    )
    assert verify_resp.status_code == 400
    assert "验证码错误" in verify_resp.json()["detail"]


@pytest.mark.asyncio
async def test_verify_sms_auto_registers_new_user(client: AsyncClient, db_session):
    phone = "13800138003"
    send_resp = await client.post(
        "/api/v1/auth/sms/send",
        json={"phone": phone},
    )
    code = send_resp.json()["code"]

    verify_resp = await client.post(
        "/api/v1/auth/sms/verify",
        json={"phone": phone, "code": code},
    )
    assert verify_resp.status_code == 200

    result = await db_session.execute(select(User).where(User.phone == phone))
    user = result.scalar_one_or_none()
    assert user is not None
    assert user.phone == phone


@pytest.mark.asyncio
async def test_send_sms_rate_limit_within_60s(client: AsyncClient):
    phone = "13800138004"
    r1 = await client.post("/api/v1/auth/sms/send", json={"phone": phone})
    assert r1.status_code == 200

    r2 = await client.post("/api/v1/auth/sms/send", json={"phone": phone})
    assert r2.status_code == 429
    assert "频繁" in r2.json()["detail"]


@pytest.mark.asyncio
async def test_verify_sms_expired_or_missing_code(client: AsyncClient, fake_redis):
    phone = "13800138005"
    send_resp = await client.post(
        "/api/v1/auth/sms/send",
        json={"phone": phone},
    )
    code = send_resp.json()["code"]

    await fake_redis.delete(sms_code_key(phone))

    verify_resp = await client.post(
        "/api/v1/auth/sms/verify",
        json={"phone": phone, "code": code},
    )
    assert verify_resp.status_code == 400
    assert "过期" in verify_resp.json()["detail"] or "无效" in verify_resp.json()["detail"]
