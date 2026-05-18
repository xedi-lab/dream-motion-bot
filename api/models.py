from datetime import datetime, date, time
from enum import Enum as PyEnum

from sqlalchemy import (
    BigInteger, Boolean, Column, Date, DateTime,
    Enum, ForeignKey, Integer, Numeric, String, Time, Text
)
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class BookingStatus(str, PyEnum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    cancelled = "cancelled"


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True)  # Telegram user ID
    username = Column(String(64), nullable=True)
    first_name = Column(String(128), nullable=True)
    phone = Column(String(20), nullable=True)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bookings = relationship("Booking", back_populates="user")


class TimeSlot(Base):
    __tablename__ = "time_slots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)
    created_by = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bookings = relationship("Booking", back_populates="slot")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    slot_id = Column(Integer, ForeignKey("time_slots.id"), nullable=False)
    with_engineer = Column(Boolean, nullable=False)
    duration_hours = Column(Numeric(4, 1), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    phone = Column(String(20), nullable=False)
    status = Column(
        Enum(BookingStatus),
        default=BookingStatus.pending,
        nullable=False
    )
    chosen_start_time = Column(Time, nullable=True)
    admin_comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="bookings")
    slot = relationship("TimeSlot", back_populates="bookings")
