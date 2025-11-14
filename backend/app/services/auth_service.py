from fastapi import HTTPException, status
from ..schemas.auth_schema import LoginResponse
from ..schemas.user_schema import User
from ..repositories.user_repo import get_user_by_id, insert_user, get_user_by_email
from ..security import (
    hash_password,
    verify_password,
    create_access_token,
    create_email_token,
    decode_token,
)

def service_register(email: str, password: str, full_name: str):
    # Block duplicates
    user_exists = get_user_by_email(email)
    if user_exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")
    
    # If user does not exist yet, continue to registration process
    # Hash password
    hashed_pwd = hash_password(password)

    # Insert to DB
    output = insert_user(email, hashed_pwd, full_name)
    if not output["success"]:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not create user: {output["error"]}")

    (user_id, email, full_name, created_at, is_verified) = output["data"]

    # Email verification token
    email_token = create_email_token(user_id, email)

    # TODO: send email with token
    print(f"[DEV] Verify link for {email}: https://gerobakku.example.com/verify?token={email_token}")

    registered_user = User(
        user_id=user_id,
        email=email,
        full_name=full_name,
        created_at=created_at,
        is_verified=is_verified
    )

    # Auto-login after registration, so create access token
    access_token = create_access_token(user_id, email)

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=registered_user
    )

def service_verify_email(token: str):
    payload = decode_token(token)
    if payload.get("type") != "verify":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token type for email verification.")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token payload.")

    # TODO
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    return None

def service_login(email: str, password: str) -> LoginResponse:
    user = get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    (user_id, email, password_hash, full_name, created_at, is_verified) = user
    if not verify_password(password, password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    # Renew token
    access_token = create_access_token(user_id, email)

    logged_in_user = User(
        user_id=user_id,
        email=email,
        full_name=full_name,
        created_at=created_at,
        is_verified=is_verified
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=logged_in_user
    )
