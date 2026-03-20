import asyncio
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.database import Base, get_db
from app.main import app
from app.models.user import User

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

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
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


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
