"""Redis key helpers for SMS verification."""

SMS_KEY_PREFIX = "sms:"
SMS_LIMIT_PREFIX = "sms_limit:"
SMS_CODE_TTL_SECONDS = 300
SMS_RATE_LIMIT_SECONDS = 60


def sms_code_key(phone: str) -> str:
    return f"{SMS_KEY_PREFIX}{phone}"


def sms_limit_key(phone: str) -> str:
    return f"{SMS_LIMIT_PREFIX}{phone}"
