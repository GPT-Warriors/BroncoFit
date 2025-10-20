"""
Pytest configuration and fixtures for BroncoFit API tests
"""
import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_database
from app.auth import create_access_token
from datetime import timedelta
import os


@pytest.fixture(scope="session")
def test_app():
    """Provide the FastAPI app instance"""
    return app


@pytest.fixture
def client(test_app):
    """Provide a test client for synchronous tests"""
    return TestClient(test_app)


@pytest.fixture
async def async_client(test_app):
    """Provide an async test client for async tests"""
    async with AsyncClient(app=test_app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def test_user_data():
    """Provide test user data"""
    return {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpassword123"
    }


@pytest.fixture
def test_profile_data():
    """Provide test profile data"""
    return {
        "age": 25,
        "sex": "male",
        "height_cm": 175.0,
        "current_weight_kg": 80.0,
        "target_weight_kg": 75.0,
        "activity_level": "moderate",
        "fitness_goal": "lose_weight"
    }


@pytest.fixture
def auth_token():
    """Generate a test JWT token"""
    token = create_access_token(
        data={"sub": "test_user_id_123"},
        expires_delta=timedelta(minutes=30)
    )
    return token


@pytest.fixture
def auth_headers(auth_token):
    """Provide authorization headers with test token"""
    return {"Authorization": f"Bearer {auth_token}"}

