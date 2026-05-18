import hashlib
import hmac
import json
import os
from urllib.parse import unquote

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User

BOT_TOKEN = os.getenv("BOT_TOKEN", "")


def verify_telegram_init_data(init_data: str) -> dict:
    """Validate Telegram Mini App initData and return parsed user dict."""
    parsed = {}
    data_check_string_parts = []

    for part in unquote(init_data).split("&"):
        if "=" not in part:
            continue
        key, value = part.split("=", 1)
        if key == "hash":
            parsed["hash"] = value
        else:
            data_check_string_parts.append(f"{key}={value}")
            parsed[key] = value

    if "hash" not in parsed:
        raise HTTPException(status_code=401, detail="Missing hash")

    data_check_string_parts.sort()
    data_check_string = "\n".join(data_check_string_parts)

    secret_key = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
    computed = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(computed, parsed["hash"]):
        raise HTTPException(status_code=401, detail="Invalid initData signature")

    user_json = parsed.get("user", "{}")
    return json.loads(user_json)


def _load_admin_ids() -> list[int]:
    try:
        with open(os.getenv("CONFIG_PATH", "config.json"), "r") as f:
            return json.load(f).get("admin_ids", [])
    except Exception:
        return []


async def get_current_user(
    x_init_data: str = Header(..., alias="X-Init-Data"),
    db: AsyncSession = Depends(get_db),
) -> User:
    tg_user = verify_telegram_init_data(x_init_data)
    user_id = int(tg_user["id"])
    is_admin = user_id in _load_admin_ids()

    user = await db.get(User, user_id)
    if not user:
        user = User(
            id=user_id,
            username=tg_user.get("username"),
            first_name=tg_user.get("first_name"),
            is_admin=is_admin,
        )
        db.add(user)
        await db.flush()
    elif is_admin and not user.is_admin:
        user.is_admin = True
        await db.flush()

    return user


async def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return current_user
