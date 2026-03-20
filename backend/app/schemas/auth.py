import re
from typing import Literal

from pydantic import BaseModel, field_validator


class RegisterRequest(BaseModel):
    phone: str
    password: str
    nickname: str = ""

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not re.match(r"^1[3-9]\d{9}$", v):
            raise ValueError("手机号格式不正确")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("密码长度不能少于6位")
        return v


class LoginRequest(BaseModel):
    phone: str
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    phone: str
    nickname: str
    avatar_url: str
    role: str

    model_config = {"from_attributes": True}


class SmsSendRequest(BaseModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not re.match(r"^1[3-9]\d{9}$", v):
            raise ValueError("手机号格式不正确")
        return v


class SmsSendResponse(BaseModel):
    message: str = "ok"
    code: str | None = None


class SmsVerifyRequest(BaseModel):
    phone: str
    code: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not re.match(r"^1[3-9]\d{9}$", v):
            raise ValueError("手机号格式不正确")
        return v


class WeChatLoginRequest(BaseModel):
    code: str


class WeChatNeedsBindResponse(BaseModel):
    needs_bindphone: Literal[True] = True
    temp_openid: str


class WeChatBindPhoneRequest(BaseModel):
    openid: str
    phone: str
    code: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not re.match(r"^1[3-9]\d{9}$", v):
            raise ValueError("手机号格式不正确")
        return v
