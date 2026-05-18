import json
import os
from fastapi import APIRouter
from schemas import StudioConfig

router = APIRouter(prefix="/config", tags=["config"])

CONFIG_PATH = os.getenv("CONFIG_PATH", "config.json")


def load_config() -> dict:
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("", response_model=StudioConfig)
async def get_config():
    return load_config()
