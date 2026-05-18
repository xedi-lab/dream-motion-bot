from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models import Booking, BookingStatus, TimeSlot, User
from schemas import BookingCreate, BookingOut, BookingStatusUpdate
from dependencies import get_current_user, require_admin
from routers.config import load_config
from notify import notify_admins_new_booking, notify_client_status

router = APIRouter(prefix="/bookings", tags=["bookings"])


def calculate_price(duration_hours: Decimal, with_engineer: bool) -> Decimal:
    cfg = load_config()
    rate = cfg["price_per_hour_with_engineer"] if with_engineer else cfg["price_per_hour"]
    return Decimal(str(rate)) * duration_hours


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(
    data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    slot = await db.get(TimeSlot, data.slot_id)
    if not slot or not slot.is_available:
        raise HTTPException(status_code=404, detail="Slot not found or unavailable")

    # Check slot is not already booked
    existing = await db.execute(
        select(Booking).where(
            Booking.slot_id == data.slot_id,
            Booking.status.in_([BookingStatus.pending, BookingStatus.approved]),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Slot already booked")

    cfg = load_config()
    if float(data.duration_hours) < cfg["min_session_hours"]:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum session duration is {cfg['min_session_hours']} hour(s)",
        )

    total_price = calculate_price(data.duration_hours, data.with_engineer)

    # Update phone on user record
    if data.phone:
        current_user.phone = data.phone

    booking = Booking(
        user_id=current_user.id,
        slot_id=data.slot_id,
        with_engineer=data.with_engineer,
        duration_hours=data.duration_hours,
        total_price=total_price,
        phone=data.phone,
        chosen_start_time=data.chosen_start_time,
        status=BookingStatus.pending,
    )
    db.add(booking)
    await db.flush()

    result = await db.execute(
        select(Booking)
        .where(Booking.id == booking.id)
        .options(selectinload(Booking.user), selectinload(Booking.slot))
    )
    created = result.scalar_one()

    cfg = load_config()
    await notify_admins_new_booking(created, cfg.get("admin_ids", []))

    return created


@router.get("/my", response_model=list[BookingOut])
async def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Booking)
        .where(Booking.user_id == current_user.id)
        .options(selectinload(Booking.user), selectinload(Booking.slot))
        .order_by(Booking.created_at.desc())
    )
    return result.scalars().all()


@router.get("", response_model=list[BookingOut])
async def get_all_bookings(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.user), selectinload(Booking.slot))
        .order_by(Booking.created_at.desc())
    )
    return result.scalars().all()


@router.patch("/{booking_id}/status", response_model=BookingOut)
async def update_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Booking)
        .where(Booking.id == booking_id)
        .options(selectinload(Booking.user), selectinload(Booking.slot))
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = data.status
    booking.admin_comment = data.admin_comment

    # Free up the slot if rejected or cancelled
    if data.status in (BookingStatus.rejected, BookingStatus.cancelled):
        slot = await db.get(TimeSlot, booking.slot_id)
        if slot:
            slot.is_available = True

    await db.flush()
    await db.refresh(booking)
    await notify_client_status(booking)
    return booking


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Booking).where(
            Booking.id == booking_id,
            Booking.user_id == current_user.id,
        )
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status not in (BookingStatus.pending, BookingStatus.approved):
        raise HTTPException(status_code=400, detail="Cannot cancel this booking")

    booking.status = BookingStatus.cancelled
    slot = await db.get(TimeSlot, booking.slot_id)
    if slot:
        slot.is_available = True


@router.delete("/{booking_id}/admin", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_booking(
    booking_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status in (BookingStatus.pending, BookingStatus.approved):
        slot = await db.get(TimeSlot, booking.slot_id)
        if slot:
            slot.is_available = True

    await db.delete(booking)
