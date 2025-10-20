"""
Test authentication endpoints
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.auth import get_password_hash, verify_password, create_access_token, decode_access_token


class TestPasswordHashing:
    """Test password hashing functionality"""

    def test_password_hash_and_verify(self):
        """Test that passwords are hashed and verified correctly"""
        plain_password = "mySecurePassword123"
        hashed = get_password_hash(plain_password)

        assert hashed != plain_password
        assert verify_password(plain_password, hashed) is True
        assert verify_password("wrongPassword", hashed) is False

    def test_different_hashes_for_same_password(self):
        """Test that same password produces different hashes (salt)"""
        password = "testPassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        assert hash1 != hash2
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


class TestJWTTokens:
    """Test JWT token creation and validation"""

    def test_create_access_token(self):
        """Test JWT token creation"""
        user_data = {"sub": "user123"}
        token = create_access_token(user_data)

        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

    def test_decode_access_token(self):
        """Test JWT token decoding"""
        user_id = "test_user_456"
        token = create_access_token({"sub": user_id})

        decoded_user_id = decode_access_token(token)
        assert decoded_user_id == user_id

    def test_decode_invalid_token(self):
        """Test decoding invalid JWT token"""
        invalid_token = "invalid.token.here"
        result = decode_access_token(invalid_token)

        assert result is None


class TestAuthEndpoints:
    """Test authentication API endpoints"""

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data

    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data

    def test_register_new_user(self, client):
        """Test user registration with mocked database"""
        with patch('app.routers.auth.get_database') as mock_db:
            # Mock database to return None (user doesn't exist)
            mock_collection = AsyncMock()
            mock_collection.find_one = AsyncMock(return_value=None)
            mock_collection.insert_one = AsyncMock(return_value=MagicMock(inserted_id="test_id_123"))

            mock_db_instance = AsyncMock()
            mock_db_instance.users = mock_collection
            mock_db.return_value = mock_db_instance

            user_data = {
                "email": "newuser@example.com",
                "name": "New User",
                "password": "password123"
            }

            response = client.post("/api/auth/register", json=user_data)

            assert response.status_code == 201
            data = response.json()
            assert data["email"] == user_data["email"]
            assert data["name"] == user_data["name"]
            assert "id" in data
            assert "password" not in data

    def test_register_duplicate_user(self, client):
        """Test registering duplicate user fails"""
        with patch('app.routers.auth.get_database') as mock_db:
            # Mock database to return existing user
            mock_collection = AsyncMock()
            mock_collection.find_one = AsyncMock(return_value={"email": "existing@example.com"})

            mock_db_instance = AsyncMock()
            mock_db_instance.users = mock_collection
            mock_db.return_value = mock_db_instance

            user_data = {
                "email": "existing@example.com",
                "name": "Existing User",
                "password": "password123"
            }

            response = client.post("/api/auth/register", json=user_data)
            assert response.status_code == 400
            assert "already registered" in response.json()["detail"].lower()

    def test_register_invalid_email(self, client):
        """Test registration with invalid email"""
        invalid_user = {
            "email": "not-an-email",
            "name": "Test",
            "password": "password123"
        }

        response = client.post("/api/auth/register", json=invalid_user)
        assert response.status_code == 422  # Validation error

    def test_register_short_password(self, client):
        """Test registration with password too short"""
        user_data = {
            "email": "test@example.com",
            "name": "Test",
            "password": "short"
        }

        response = client.post("/api/auth/register", json=user_data)
        assert response.status_code == 422  # Validation error

    def test_login_success(self, client):
        """Test successful login with mocked database"""
        with patch('app.routers.auth.get_database') as mock_db:
            # Create a hashed password
            password = "testpassword123"
            hashed_pw = get_password_hash(password)

            # Mock database to return user with hashed password
            mock_collection = AsyncMock()
            mock_collection.find_one = AsyncMock(return_value={
                "_id": "test_user_id",
                "email": "test@example.com",
                "name": "Test User",
                "password_hash": hashed_pw
            })

            mock_db_instance = AsyncMock()
            mock_db_instance.users = mock_collection
            mock_db.return_value = mock_db_instance

            login_data = {
                "username": "test@example.com",
                "password": password
            }

            response = client.post("/api/auth/login", data=login_data)

            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client):
        """Test login with wrong password"""
        with patch('app.routers.auth.get_database') as mock_db:
            # Mock database to return user
            mock_collection = AsyncMock()
            mock_collection.find_one = AsyncMock(return_value={
                "_id": "test_user_id",
                "email": "test@example.com",
                "password_hash": get_password_hash("correctpassword")
            })

            mock_db_instance = AsyncMock()
            mock_db_instance.users = mock_collection
            mock_db.return_value = mock_db_instance

            login_data = {
                "username": "test@example.com",
                "password": "wrongpassword"
            }

            response = client.post("/api/auth/login", data=login_data)
            assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user"""
        with patch('app.routers.auth.get_database') as mock_db:
            # Mock database to return None (user not found)
            mock_collection = AsyncMock()
            mock_collection.find_one = AsyncMock(return_value=None)

            mock_db_instance = AsyncMock()
            mock_db_instance.users = mock_collection
            mock_db.return_value = mock_db_instance

            login_data = {
                "username": "doesnotexist@example.com",
                "password": "password123"
            }

            response = client.post("/api/auth/login", data=login_data)
            assert response.status_code == 401  # Returns 401 for both wrong password and non-existent user
