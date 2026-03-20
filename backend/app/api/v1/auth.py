import hashlib

from fastapi import APIRouter, Depends, HTTPException, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.redis import get_redis
from app.core.sms_keys import sms_code_key
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserResponse,
    WeChatBindPhoneRequest,
    WeChatLoginRequest,
    WeChatNeedsBindResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["认证"])


def _wechat_openid_from_code(code: str) -> str:
    digest = hashlib.sha256(f"wechat_mock:{code}".encode()).hexdigest()[:32]
    return f"mock_wx_{digest}"


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        user = await service.register(body.phone, body.password, body.nickname)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    return service.create_tokens(user.id)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        user = await service.login(body.phone, body.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    return service.create_tokens(user.id)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        tokens = await service.refresh_access_token(body.refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    return tokens


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/wechat", response_model=TokenResponse | WeChatNeedsBindResponse)
async def wechat_login(
    body: WeChatLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    settings = get_settings()
    if not settings.DEBUG:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="生产环境需配置微信 OAuth",
        )
    openid = _wechat_openid_from_code(body.code)
    service = AuthService(db)
    user = await service.get_user_by_wechat_openid(openid)
    if user is not None:
        return TokenResponse(**service.create_tokens(user.id))
    return WeChatNeedsBindResponse(temp_openid=openid)


@router.post("/wechat/bindphone", response_model=TokenResponse)
async def wechat_bind_phone(
    body: WeChatBindPhoneRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    settings = get_settings()
    if not settings.DEBUG:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="生产环境需配置微信绑定",
        )
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
    try:
        user = await service.bind_wechat_openid(body.phone, body.openid)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    return TokenResponse(**service.create_tokens(user.id))
