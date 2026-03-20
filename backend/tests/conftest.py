import asyncio
import time
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.database import Base, get_db
from app.core.redis import get_redis

# Import models before `from app.main import app` so `import app.*` does not shadow the FastAPI `app`.
import app.models.company  # noqa: F401
import app.models.order  # noqa: F401
import app.models.product  # noqa: F401

from app.main import app
from app.models.user import User


class FakeRedis:
    """Minimal async Redis stand-in for tests (in-memory with TTL)."""

    def __init__(self) -> None:
        self._data: dict[str, tuple[str, float | None]] = {}

    def _purge_if_expired(self, name: str) -> None:
        if name not in self._data:
            return
        _, exp = self._data[name]
        if exp is not None and time.time() > exp:
            del self._data[name]

    async def set(self, name, value, ex=None, px=None, nx=False, xx=False):
        if nx:
            self._purge_if_expired(name)
            if name in self._data:
                return False
        if xx:
            self._purge_if_expired(name)
            if name not in self._data:
                return False
        exp_at: float | None = None
        if ex is not None:
            exp_at = time.time() + float(ex)
        if px is not None:
            exp_at = time.time() + float(px) / 1000.0
        self._data[name] = (str(value), exp_at)
        return True

    async def get(self, name):
        self._purge_if_expired(name)
        if name not in self._data:
            return None
        return self._data[name][0]

    async def delete(self, *names):
        deleted = 0
        for name in names:
            if name in self._data:
                del self._data[name]
                deleted += 1
        return deleted

    async def exists(self, *names):
        count = 0
        for name in names:
            self._purge_if_expired(name)
            if name in self._data:
                count += 1
        return count

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
test_session_factory = async_sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with test_session_factory() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(lambda sync_conn: Base.metadata.drop_all(sync_conn, checkfirst=True))


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    fake_redis = FakeRedis()

    async def override_get_db():
        yield db_session

    async def override_get_redis():
        return fake_redis

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_redis] = override_get_redis
    app.state._test_fake_redis = fake_redis

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
    delattr(app.state, "_test_fake_redis")


@pytest.fixture(scope="function")
def fake_redis(client: AsyncClient) -> FakeRedis:
    return app.state._test_fake_redis


async def create_admin_token(client: AsyncClient, db_session: AsyncSession, phone: str = "13000000001") -> str:
    await client.post("/api/v1/auth/register", json={
        "phone": phone,
        "password": "admin123456",
    })
    await db_session.execute(update(User).where(User.phone == phone).values(role="admin"))
    await db_session.commit()
    resp = await client.post("/api/v1/auth/login", json={
        "phone": phone,
        "password": "admin123456",
    })
    return resp.json()["access_token"]


async def create_buyer_token(client: AsyncClient, phone: str = "13000000002") -> str:
    resp = await client.post("/api/v1/auth/register", json={
        "phone": phone,
        "password": "buyer123456",
    })
    return resp.json()["access_token"]
