from fastapi import APIRouter, Depends, status
from ..services.auth_service import (
    service_register,
    service_verify_email,
    service_login
)
from ..schemas.auth_schema import (
    RegisterRequest,
    VerifyEmailRequest,
    LoginRequest,
    LoginResponse
)
from ..schemas.user_schema import User
from ..security import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

# User registration, /auth/register
@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    response = service_register(
        email=body.email,
        password=body.password,
        full_name=body.full_name
    )

    return response

# Email verification, /auth/verify-email
@router.post("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(body: VerifyEmailRequest):
    service_verify_email(token=body.token)
    return {"detail": "Email verified successfully."}

# User login, /auth/login
@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
async def login(body: LoginRequest):
    response = service_login(
        email=body.email,
        password=body.password
    )

    return response

# Get current authenticated user, /auth/me
@router.get("/me", response_model=User, status_code=status.HTTP_200_OK)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
