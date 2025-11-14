from pydantic import BaseModel, EmailStr
from ..schemas.user_schema import User

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class VerifyEmailRequest(BaseModel):
    token: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User