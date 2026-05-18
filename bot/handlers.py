import json
import os

from aiogram import Router
from aiogram.filters import CommandStart, Command
from aiogram.types import (
    Message,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo,
)

router = Router()

MINI_APP_URL = os.getenv("MINI_APP_URL", "")

CONFIG_PATH = os.getenv("CONFIG_PATH", "../config.json")


def load_config() -> dict:
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"studio_name": "Dream Motion", "city": "Санкт-Петербург"}


@router.message(CommandStart())
async def cmd_start(message: Message, mini_app_url: str = MINI_APP_URL):
    cfg = load_config()
    studio = cfg.get("studio_name", "Dream Motion")
    city = cfg.get("city", "")

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🎙 Забронировать студию",
                    web_app=WebAppInfo(url=mini_app_url),
                )
            ]
        ]
    )

    await message.answer(
        f"<b>{studio}</b> — студия звукозаписи{f', {city}' if city else ''}\n\n"
        "Нажми кнопку ниже, чтобы забронировать время.",
        reply_markup=keyboard,
    )


@router.message(Command("help"))
async def cmd_help(message: Message):
    await message.answer(
        "<b>Как забронировать студию:</b>\n\n"
        "1. Нажми /start\n"
        "2. Открой приложение\n"
        "3. Выбери дату и свободное время\n"
        "4. Укажи длительность и нужен ли звукорежиссёр\n"
        "5. Подтверди заявку — мы свяжемся с тобой\n\n"
        "По вопросам пиши администратору."
    )
