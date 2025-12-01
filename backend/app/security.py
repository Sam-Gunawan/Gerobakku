import os
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from .repositories.user_repo import get_user_by_id
from .schemas.user_schema import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET", "DEFAULT JWT KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 2 # 2 hours
EMAIL_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Password helpers
def hash_password(plaintxt: str) -> str:
    return pwd_context.hash(plaintxt)

def verify_password(plaintxt: str, hashed: str) -> bool:
    return pwd_context.verify(plaintxt, hashed)

# JWT helpers
def _make_token(data: dict, minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(minutes=minutes)
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_access_token(user_id: int | str, email: str) -> str:
    """
    Token used after login
    """
    return _make_token(
        {
            "sub": str(user_id),
            "email": email,
            "type": "access",
        },
        ACCESS_TOKEN_EXPIRE_MINUTES
    )

def create_email_token(user_id: int | str, email: str) -> str:
    """
    Token sent in email verification link
    """
    return _make_token(
        {
            "sub": str(user_id),
            "email": email,
            "type": "verify"
        },
        EMAIL_TOKEN_EXPIRE_MINUTES
    )

def decode_token(token: str) -> dict:
    try:
        print("token recieved:", token)
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError as e:
        print("JWT Error:", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token, please login again."
        )

# FastAPI dependency for authenticated routes
def get_current_user(token: str = Depends(oauth2_scheme)) -> User: 
    payload = decode_token(token)
    
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type."
        )
    
    uid = payload.get("sub")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload."
        )
    
    row = get_user_by_id(uid)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )

    return User(
        user_id=row[0],
        email=row[1],
        full_name=row[3],
        created_at=row[4],
        is_verified=row[5]
    )