import redis.asyncio as aioredis

from app.core.config import get_settings

_redis: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    """Return a shared async Redis client (singleton)."""
    global _redis
    if _redis is None:
        settings = get_settings()
        _redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis
