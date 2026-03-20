import random
import string

from fastapi import APIRouter, Depends, HTTPException, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.redis import get_redis
from app.core.sms_keys import SMS_CODE_TTL_SECONDS, SMS_RATE_LIMIT_SECONDS, sms_code_key, sms_limit_key
from app.schemas.auth import SmsSendRequest, SmsSendResponse, SmsVerifyRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/sms", tags=["短信"])


def _generate_code() -> str:
    return "".join(random.choices(string.digits, k=6))


@router.post("/send", response_model=SmsSendResponse)
async def send_sms(
    body: SmsSendRequest,
    redis: Redis = Depends(get_redis),
) -> SmsSendResponse:
    settings = get_settings()
    limit_key = sms_limit_key(body.phone)
    if await redis.exists(limit_key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="发送过于频繁，请稍后再试",
        )

    code = _generate_code()
    await redis.set(sms_code_key(body.phone), code, ex=SMS_CODE_TTL_SECONDS)
    await redis.set(limit_key, "1", ex=SMS_RATE_LIMIT_SECONDS)

    if settings.DEBUG:
        return SmsSendResponse(message="ok", code=code)

    # Production: integrate SMS gateway here; do not expose the code.
    return SmsSendResponse(message="ok", code=None)


@router.post("/verify", response_model=TokenResponse)
async def verify_sms(
    body: SmsVerifyRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
) -> TokenResponse:
    key = sms_code_key(body.phone)
    stored = await redis.get(key)
    if stored is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="验证码已过期或无效",
        )
    if stored != body.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="验证码错误",
        )

    await redis.delete(key)

    service = AuthService(db)
    user = await service.login_or_register_by_phone_sms(body.phone)
    return TokenResponse(**service.create_tokens(user.id))
