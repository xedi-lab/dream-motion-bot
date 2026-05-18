import os
import httpx
from models import Booking, BookingStatus

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
TG_API = f"https://api.telegram.org/bot{BOT_TOKEN}"


async def _send(chat_id: int, text: str) -> None:
    if not BOT_TOKEN:
        return
    async with httpx.AsyncClient() as client:
        await client.post(
            f"{TG_API}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
            timeout=10,
        )


def _format_date(slot) -> str:
    months = {
        1: "января", 2: "февраля", 3: "марта", 4: "апреля",
        5: "мая", 6: "июня", 7: "июля", 8: "августа",
        9: "сентября", 10: "октября", 11: "ноября", 12: "декабря",
    }
    return f"{slot.date.day} {months[slot.date.month]}"


async def notify_admins_new_booking(booking: Booking, admin_ids: list[int]) -> None:
    if not admin_ids:
        return

    slot = booking.slot
    user = booking.user
    username = f"@{user.username}" if user.username else user.first_name or "—"
    engineer = "со звукарём" if booking.with_engineer else "без звукаря"

    text = (
        f"🎙 <b>Новая заявка #{booking.id}</b>\n\n"
        f"👤 {username}\n"
        f"📞 {booking.phone}\n"
        f"📅 {_format_date(slot)}, {slot.start_time.strftime('%H:%M')}–{slot.end_time.strftime('%H:%M')}\n"
        f"⏱ {booking.duration_hours} ч — {engineer}\n"
        f"💰 {booking.total_price} ₽\n\n"
        f"Подтвердите или отклоните в панели управления."
    )

    for admin_id in admin_ids:
        await _send(admin_id, text)


async def notify_client_status(booking: Booking) -> None:
    slot = booking.slot
    engineer = "со звукарём" if booking.with_engineer else "без звукаря"

    if booking.status == BookingStatus.approved:
        text = (
            f"✅ <b>Заявка подтверждена!</b>\n\n"
            f"📅 {_format_date(slot)}, {slot.start_time.strftime('%H:%M')}–{slot.end_time.strftime('%H:%M')}\n"
            f"⏱ {booking.duration_hours} ч — {engineer}\n"
            f"💰 {booking.total_price} ₽\n\n"
            f"Ждём тебя в <b>Dream Motion</b>!"
        )
    elif booking.status == BookingStatus.rejected:
        comment = f"\n\nПричина: {booking.admin_comment}" if booking.admin_comment else ""
        text = (
            f"❌ <b>Заявка отклонена</b>{comment}\n\n"
            "Попробуй выбрать другое время."
        )
    elif booking.status == BookingStatus.cancelled:
        text = "🚫 <b>Заявка отменена.</b>"
    else:
        return

    await _send(booking.user_id, text)
