from datetime import date, time, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, field_validator
from models import BookingStatus


# --- User ---

class UserUpsert(BaseModel):
    id: int
    username: Optional[str] = None
    first_name: Optional[str] = None


class UserOut(BaseModel):
    id: int
    username: Optional[str]
    first_name: Optional[str]
    phone: Optional[str]
    is_admin: bool

    model_config = {"from_attributes": True}


# --- TimeSlot ---

class SlotCreate(BaseModel):
    date: date
    start_time: time
    end_time: time

    @field_validator("end_time")
    @classmethod
    def end_after_start(cls, v, info):
        if "start_time" in info.data and v <= info.data["start_time"]:
            raise ValueError("end_time must be after start_time")
        return v


class SlotOut(BaseModel):
    id: int
    date: date
    start_time: time
    end_time: time
    is_available: bool

    model_config = {"from_attributes": True}


# --- Booking ---

class BookingCreate(BaseModel):
    slot_id: int
    with_engineer: bool
    duration_hours: Decimal
    phone: str
    chosen_start_time: Optional[time] = None

    @field_validator("duration_hours")
    @classmethod
    def valid_duration(cls, v):
        if v <= 0:
            raise ValueError("duration_hours must be positive")
        return v

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, v):
        cleaned = v.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
        if not cleaned.lstrip("+").isdigit() or len(cleaned) < 10:
            raise ValueError("Invalid phone number")
        return cleaned


class BookingOut(BaseModel):
    id: int
    slot_id: int
    with_engineer: bool
    duration_hours: Decimal
    total_price: Decimal
    phone: str
    status: BookingStatus
    chosen_start_time: Optional[time]
    admin_comment: Optional[str]
    created_at: datetime
    user: UserOut
    slot: SlotOut

    model_config = {"from_attributes": True}


class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    admin_comment: Optional[str] = None


# --- Studio Config ---

class StudioConfig(BaseModel):
    studio_name: str
    city: str = ""
    address: Optional[str] = None
    about: Optional[str] = None
    features: Optional[list[str]] = None
    equipment: Optional[list[dict]] = None
    working_hours_label: Optional[str] = None
    currency: str
    min_session_hours: float
    price_per_hour: float
    price_per_hour_with_engineer: float
    working_hours: dict
    admin_ids: list[int]
