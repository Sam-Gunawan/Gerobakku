"""
Shared test configuration and fixtures for all backend tests

This file is automatically loaded by pytest and provides:
- Shared fixtures used across multiple test files
- Test database setup (if needed)
- Common mock objects
"""

import pytest
from datetime import datetime


# ===== SHARED FIXTURES =====

@pytest.fixture
def sample_user():
    """Returns a sample user data dictionary for testing"""
    return {
        "user_id": 1,
        "email": "testuser@example.com",
        "full_name": "Test User",
        "password": "TestPassword123",
        "created_at": datetime(2024, 1, 1),
        "is_verified": True
    }


@pytest.fixture
def sample_vendor():
    """Returns a sample vendor data for testing"""
    return {
        "vendor_id": 101,
        "user_id": 1,
        "ktp_image_url": "/uploads/vendors/ktp_101.jpg",
        "selfie_image_url": "/uploads/vendors/selfie_101.jpg"
    }


@pytest.fixture
def sample_store():
    """Returns a sample store data for testing"""
    return {
        "store_id": 301,
        "vendor_id": 101,
        "name": "Sate Pak Joko",
        "description": "Delicious satay vendor",
        "category_id": 1,
        "address": "Jl. Test No. 123",
        "rating": 4.5,
        "is_open": True,
        "is_halal": True,
        "open_time": 8,
        "close_time": 20,
        "store_image_url": "/uploads/stores/store_301.jpg"
    }


@pytest.fixture
def sample_location():
    """Returns a sample location point"""
    return {
        "lat": -6.2443,
        "lon": 106.8385
    }


@pytest.fixture(scope="session")
def test_jwt_secret():
    """
    Use a consistent JWT secret for testing
    Scope='session' means this is created once per test run
    """
    return "TEST_SECRET_KEY_DO_NOT_USE_IN_PRODUCTION"


# ===== HELPER FUNCTIONS =====

def assert_valid_jwt_token(token: str):
    """Helper function to validate JWT token structure"""
    assert isinstance(token, str), "Token should be a string"
    assert len(token.split('.')) == 3, "JWT should have 3 parts separated by dots"


def assert_valid_email(email: str):
    """Helper function to validate email format"""
    assert "@" in email, "Email should contain @"
    assert "." in email.split("@")[1], "Email domain should contain a dot"
