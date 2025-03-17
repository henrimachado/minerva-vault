from typing import TypedDict, Optional
from datetime import datetime

class PasswordStatus(TypedDict):
    needs_change: bool
    days_until_expiration: Optional[int]
    last_change: datetime
    urgency: str

class UserResponse(TypedDict):
    password_status: PasswordStatus
    data: dict