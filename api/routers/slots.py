from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import TimeSlot, User
from schemas import SlotCreate, SlotOut
from dependencies import get_current_user, require_admin

router = APIRouter(prefix="/slots", tags=["slots"])


@router.get("", response_model=list[SlotOut])
async def get_slots(
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    available_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    filters = []
    if available_only:
        filters.append(TimeSlot.is_available == True)
    if from_date:
        filters.append(TimeSlot.date >= from_date)
    if to_date:
        filters.append(TimeSlot.date <= to_date)

    result = await db.execute(
        select(TimeSlot).where(and_(*filters)).order_by(TimeSlot.date, TimeSlot.start_time)
    )
    return result.scalars().all()


@router.post("", response_model=SlotOut, status_code=status.HTTP_201_CREATED)
async def create_slot(
    data: SlotCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    # Check for overlap on the same date
    result = await db.execute(
        select(TimeSlot).where(
            and_(
                TimeSlot.date == data.date,
                TimeSlot.start_time < data.end_time,
                TimeSlot.end_time > data.start_time,
            )
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Slot overlaps with an existing one",
        )

    slot = TimeSlot(
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time,
        created_by=current_user.id,
    )
    db.add(slot)
    await db.flush()
    await db.refresh(slot)
    return slot


@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_slot(
    slot_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    slot = await db.get(TimeSlot, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    await db.delete(slot)


@router.patch("/{slot_id}/toggle", response_model=SlotOut)
async def toggle_slot_availability(
    slot_id: int,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    slot = await db.get(TimeSlot, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    slot.is_available = not slot.is_available
    await db.flush()
    await db.refresh(slot)
    return slot
