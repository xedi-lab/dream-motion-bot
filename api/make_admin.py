"""Run once: python make_admin.py <telegram_id>"""
import asyncio
import sys
import os
from sqlalchemy import select
from database import AsyncSessionLocal
from models import User


async def make_admin(user_id: int):
    async with AsyncSessionLocal() as session:
        user = await session.get(User, user_id)
        if not user:
            user = User(id=user_id, is_admin=True)
            session.add(user)
            print(f"Created admin user {user_id}")
        else:
            user.is_admin = True
            print(f"Made existing user {user_id} admin")
        await session.commit()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <telegram_id>")
        sys.exit(1)
    asyncio.run(make_admin(int(sys.argv[1])))
