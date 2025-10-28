from datetime import datetime
from pydantic import BaseModel, EmailStr

class User(BaseModel):
    user_id: str
    email: EmailStr
    full_name: str
    created_at: datetime
    is_verified: bool

    class Config:
        from_attributes = False
