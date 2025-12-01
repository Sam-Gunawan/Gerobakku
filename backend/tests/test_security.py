"""
Unit tests for security module (JWT tokens and password handling)

This file demonstrates:
- How to test password hashing and verification
- How to test JWT token creation and validation
- How to mock external dependencies
- AAA (Arrange-Act-Assert) pattern
"""

import pytest
from datetime import datetime, timedelta
from jose import jwt
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_email_token,
    decode_token,
    JWT_SECRET,
    JWT_ALGORITHM
)


class TestPasswordFunctions:
    """Tests for password hashing and verification"""
    
    def test_hash_password_creates_different_hashes(self):
        """
        Test that hashing the same password twice produces different hashes
        (bcrypt adds a random salt)
        """
        # Arrange
        password = "mySecurePassword123"
        
        # Act
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        # Assert
        assert hash1 != hash2, "Hashes should be different due to salting"
        assert hash1.startswith("$2b$"), "Hash should use bcrypt format"
    
    def test_verify_password_accepts_correct_password(self):
        """Test that verify_password returns True for correct password"""
        # Arrange
        password = "correctPassword"
        hashed = hash_password(password)
        
        # Act
        result = verify_password(password, hashed)
        
        # Assert
        assert result is True, "Should accept correct password"
    
    def test_verify_password_rejects_wrong_password(self):
        """Test that verify_password returns False for wrong password"""
        # Arrange
        correct_password = "correctPassword"
        wrong_password = "wrongPassword"
        hashed = hash_password(correct_password)
        
        # Act
        result = verify_password(wrong_password, hashed)
        
        # Assert
        assert result is False, "Should reject incorrect password"
    
    def test_verify_password_case_sensitive(self):
        """Test that passwords are case-sensitive"""
        # Arrange
        password = "MyPassword"
        hashed = hash_password(password)
        
        # Act
        result = verify_password("mypassword", hashed)
        
        # Assert
        assert result is False, "Passwords should be case-sensitive"


class TestJWTTokens:
    """Tests for JWT token creation and validation"""
    
    def test_create_access_token_contains_correct_payload(self):
        """Test that access token contains user_id, email, and type"""
        # Arrange
        user_id = 123
        email = "test@example.com"
        
        # Act
        token = create_access_token(user_id, email)
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Assert
        assert payload["sub"] == "123", "Token should contain user_id as 'sub'"
        assert payload["email"] == email, "Token should contain email"
        assert payload["type"] == "access", "Token type should be 'access'"
    
    def test_create_email_token_has_verify_type(self):
        """Test that email verification token has type 'verify'"""
        # Arrange
        user_id = 456
        email = "verify@example.com"
        
        # Act
        token = create_email_token(user_id, email)
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Assert
        assert payload["type"] == "verify", "Email token should have type 'verify'"
    
    def test_access_token_has_expiration(self):
        """Test that access token has an expiration time"""
        # Arrange
        user_id = 789
        email = "expire@example.com"
        
        # Act
        token = create_access_token(user_id, email)
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Assert
        assert "exp" in payload, "Token should have expiration field"
        exp_time = datetime.utcfromtimestamp(payload["exp"])
        now = datetime.utcnow()
        
        # Token should expire in approximately 2 hours (within 5 second tolerance)
        expected_exp = now + timedelta(hours=2)
        time_diff = abs((exp_time - expected_exp).total_seconds())
        assert time_diff < 5, "Token should expire in ~2 hours"
    
    def test_decode_token_successfully_decodes_valid_token(self):
        """Test that decode_token can decode a valid token"""
        # Arrange
        user_id = 999
        email = "decode@example.com"
        token = create_access_token(user_id, email)
        
        # Act
        payload = decode_token(token)
        
        # Assert
        assert payload["sub"] == "999"
        assert payload["email"] == email
    
    def test_decode_token_raises_error_for_invalid_token(self):
        """Test that decode_token raises HTTPException for invalid tokens"""
        # Arrange
        invalid_token = "this.is.not.a.valid.jwt.token"
        
        # Act & Assert
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            decode_token(invalid_token)
        
        assert exc_info.value.status_code == 401
        assert "Invalid or expired token" in exc_info.value.detail
    
    def test_decode_token_raises_error_for_expired_token(self):
        """Test that decode_token rejects expired tokens"""
        # Arrange - Create a token that expires immediately
        payload = {
            "sub": "123",
            "email": "test@example.com",
            "type": "access",
            "exp": datetime.utcnow() - timedelta(seconds=1)  # Expired 1 second ago
        }
        expired_token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        # Act & Assert
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            decode_token(expired_token)
        
        assert exc_info.value.status_code == 401


class TestTokenTypeValidation:
    """Tests for validating token types"""
    
    def test_access_token_and_email_token_are_different(self):
        """Test that access tokens and email tokens have different types"""
        # Arrange
        user_id = 123
        email = "test@example.com"
        
        # Act
        access_token = create_access_token(user_id, email)
        email_token = create_email_token(user_id, email)
        
        access_payload = jwt.decode(access_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email_payload = jwt.decode(email_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Assert
        assert access_payload["type"] == "access"
        assert email_payload["type"] == "verify"
        assert access_token != email_token, "Tokens should be different"


# Optional: Integration test example
class TestPasswordAndTokenIntegration:
    """Integration tests combining password and token operations"""
    
    def test_realistic_registration_flow(self):
        """
        Test a realistic flow: hash password, create token, verify token
        This simulates what happens during user registration
        """
        # Arrange
        user_id = 555
        email = "newuser@example.com"
        password = "SecurePass123!"
        
        # Act - Simulate registration
        hashed_password = hash_password(password)
        access_token = create_access_token(user_id, email)
        
        # Verify we can decode the token
        token_payload = decode_token(access_token)
        
        # Verify password works
        password_valid = verify_password(password, hashed_password)
        
        # Assert
        assert password_valid is True
        assert token_payload["sub"] == str(user_id)
        assert token_payload["email"] == email
