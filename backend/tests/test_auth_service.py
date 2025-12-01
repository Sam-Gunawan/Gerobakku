"""
Unit tests for authentication service (login and registration)

This file demonstrates:
- How to mock database calls
- How to test service layer functions
- How to verify HTTPException is raised
- Parametrized tests for multiple scenarios
"""

import pytest
from unittest.mock import Mock, patch
from fastapi import HTTPException
from datetime import datetime
from app.services.auth_service import (
    service_register,
    service_login,
    service_verify_email
)
from app.schemas.user_schema import User


# ===== FIXTURES =====
# Fixtures are reusable test data

@pytest.fixture
def mock_user_data():
    """Sample user data for testing"""
    return {
        "user_id": 123,
        "email": "test@example.com",
        "full_name": "Test User",
        "password_hash": "$2b$12$abcdefghijklmnopqrstuvwxyz",  # Fake hash
        "created_at": datetime(2024, 1, 1),
        "is_verified": False
    }


@pytest.fixture
def mock_existing_user_tuple():
    """Database returns tuples, not dicts"""
    return (
        123,  # user_id
        "test@example.com",  # email
        "$2b$12$abcdefghijklmnopqrstuvwxyz",  # password_hash
        "Test User",  # full_name
        datetime(2024, 1, 1),  # created_at
        False  # is_verified
    )


# ===== REGISTRATION TESTS =====

class TestServiceRegister:
    """Tests for user registration service"""
    
    @patch('app.services.auth_service.get_user_by_email')
    @patch('app.services.auth_service.insert_user')
    @patch('app.services.auth_service.hash_password')
    def test_register_success(self, mock_hash, mock_insert, mock_get_user):
        """
        Test successful user registration
        
        Mocking strategy:
        - Mock get_user_by_email to return None (user doesn't exist)
        - Mock hash_password to return a fake hash
        - Mock insert_user to return success
        """
        # Arrange
        mock_get_user.return_value = None  # User doesn't exist
        mock_hash.return_value = "hashed_password_123"
        mock_insert.return_value = {
            "success": True,
            "data": (
                456,  # user_id
                "newuser@example.com",
                "New User",
                datetime(2024, 12, 1),
                False
            )
        }
        
        # Act
        result = service_register(
            email="newuser@example.com",
            password="MyPassword123",
            full_name="New User"
        )
        
        # Assert
        assert result.user.user_id == 456
        assert result.user.email == "newuser@example.com"
        assert result.user.full_name == "New User"
        assert result.access_token is not None
        assert result.token_type == "bearer"
        
        # Verify mocked functions were called correctly
        mock_get_user.assert_called_once_with("newuser@example.com")
        mock_hash.assert_called_once_with("MyPassword123")
        mock_insert.assert_called_once()
    
    @patch('app.services.auth_service.get_user_by_email')
    def test_register_fails_with_duplicate_email(self, mock_get_user, mock_user_data):
        """Test that registration fails if email already exists"""
        # Arrange
        mock_get_user.return_value = (
            mock_user_data["user_id"],
            mock_user_data["email"],
            mock_user_data["password_hash"],
            mock_user_data["full_name"],
            mock_user_data["created_at"],
            mock_user_data["is_verified"]
        )
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            service_register(
                email=mock_user_data["email"],
                password="AnyPassword",
                full_name="Any Name"
            )
        
        assert exc_info.value.status_code == 400
        assert "already registered" in exc_info.value.detail.lower()
    
    @patch('app.services.auth_service.get_user_by_email')
    @patch('app.services.auth_service.insert_user')
    @patch('app.services.auth_service.hash_password')
    def test_register_fails_when_database_error(self, mock_hash, mock_insert, mock_get_user):
        """Test that registration fails gracefully on database errors"""
        # Arrange
        mock_get_user.return_value = None
        mock_hash.return_value = "hashed_password"
        mock_insert.return_value = {
            "success": False,
            "error": "Database connection failed"
        }
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            service_register(
                email="test@example.com",
                password="password123",
                full_name="Test User"
            )
        
        assert exc_info.value.status_code == 500
        assert "Could not create user" in exc_info.value.detail


# ===== LOGIN TESTS =====

class TestServiceLogin:
    """Tests for user login service"""
    
    @patch('app.services.auth_service.get_user_by_email')
    @patch('app.services.auth_service.verify_password')
    def test_login_success(self, mock_verify, mock_get_user, mock_existing_user_tuple):
        """Test successful login with correct credentials"""
        # Arrange
        mock_get_user.return_value = mock_existing_user_tuple
        mock_verify.return_value = True  # Password is correct
        
        # Act
        result = service_login(
            email="test@example.com",
            password="correctPassword"
        )
        
        # Assert
        assert result.user.user_id == 123
        assert result.user.email == "test@example.com"
        assert result.user.full_name == "Test User"
        assert result.access_token is not None
        assert result.token_type == "bearer"
        
        # Verify password was checked
        mock_verify.assert_called_once_with("correctPassword", mock_existing_user_tuple[2])
    
    @patch('app.services.auth_service.get_user_by_email')
    def test_login_fails_with_non_existent_email(self, mock_get_user):
        """Test that login fails for non-existent email"""
        # Arrange
        mock_get_user.return_value = None  # User not found
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            service_login(
                email="nonexistent@example.com",
                password="anyPassword"
            )
        
        assert exc_info.value.status_code == 401
        assert "Invalid email or password" in exc_info.value.detail
    
    @patch('app.services.auth_service.get_user_by_email')
    @patch('app.services.auth_service.verify_password')
    def test_login_fails_with_wrong_password(self, mock_verify, mock_get_user, mock_existing_user_tuple):
        """Test that login fails with incorrect password"""
        # Arrange
        mock_get_user.return_value = mock_existing_user_tuple
        mock_verify.return_value = False  # Password is wrong
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            service_login(
                email="test@example.com",
                password="wrongPassword"
            )
        
        assert exc_info.value.status_code == 401
        assert "Invalid email or password" in exc_info.value.detail
    
    @pytest.mark.parametrize("email,password", [
        ("", "password123"),  # Empty email
        ("test@example.com", ""),  # Empty password
        ("", ""),  # Both empty
    ])
    @patch('app.services.auth_service.get_user_by_email')
    def test_login_with_empty_credentials(self, mock_get_user, email, password):
        """
        Parametrized test: test multiple scenarios with one test function
        Tests that login fails with empty email/password
        """
        # Arrange
        mock_get_user.return_value = None
        
        # Act & Assert
        with pytest.raises(HTTPException):
            service_login(email=email, password=password)


# ===== EMAIL VERIFICATION TESTS =====

class TestServiceVerifyEmail:
    """Tests for email verification service"""
    
    @patch('app.services.auth_service.get_user_by_id')
    @patch('app.services.auth_service.decode_token')
    def test_verify_email_success(self, mock_decode, mock_get_user):
        """Test successful email verification"""
        # Arrange
        mock_decode.return_value = {
            "sub": "123",
            "email": "test@example.com",
            "type": "verify"
        }
        mock_get_user.return_value = (
            123, "test@example.com", "hash", "Test User",
            datetime(2024, 1, 1), False
        )
        
        # Act
        result = service_verify_email("valid_token")
        
        # Assert
        assert result is None  # Function returns None on success
        mock_decode.assert_called_once_with("valid_token")
    
    @patch('app.services.auth_service.decode_token')
    def test_verify_email_fails_with_wrong_token_type(self, mock_decode):
        """Test that verification fails if token type is not 'verify'"""
        # Arrange
        mock_decode.return_value = {
            "sub": "123",
            "email": "test@example.com",
            "type": "access"  # Wrong type!
        }
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            service_verify_email("access_token")
        
        assert exc_info.value.status_code == 400
        assert "Invalid token type" in exc_info.value.detail
    
    @patch('app.services.auth_service.get_user_by_id')
    @patch('app.services.auth_service.decode_token')
    def test_verify_email_fails_if_user_not_found(self, mock_decode, mock_get_user):
        """Test that verification fails if user doesn't exist"""
        # Arrange
        mock_decode.return_value = {
            "sub": "999",
            "type": "verify"
        }
        mock_get_user.return_value = None  # User not found
        
        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            service_verify_email("valid_token")
        
        assert exc_info.value.status_code == 404
        assert "User not found" in exc_info.value.detail
