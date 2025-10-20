"""
Test Pydantic models and data validation
"""
import pytest
from pydantic import ValidationError
from app.models import (
    UserCreate,
    ProfileCreate,
    TDEERequest,
    ActivityLevel,
    Sex,
    FitnessGoal
)


class TestUserModels:
    """Test user-related models"""

    def test_user_create_valid(self):
        """Test creating valid user"""
        user = UserCreate(
            email="test@example.com",
            name="Test User",
            password="password123"
        )

        assert user.email == "test@example.com"
        assert user.name == "Test User"
        assert user.password == "password123"

    def test_user_create_invalid_email(self):
        """Test that invalid email raises validation error"""
        with pytest.raises(ValidationError):
            UserCreate(
                email="not-an-email",
                name="Test",
                password="password123"
            )

    def test_user_create_short_password(self):
        """Test that short password raises validation error"""
        with pytest.raises(ValidationError):
            UserCreate(
                email="test@example.com",
                name="Test",
                password="short"  # Less than 8 characters
            )

    def test_user_create_optional_name(self):
        """Test that name is optional"""
        user = UserCreate(
            email="test@example.com",
            password="password123"
        )

        assert user.email == "test@example.com"
        assert user.name is None


class TestProfileModels:
    """Test profile-related models"""

    def test_profile_create_valid(self):
        """Test creating valid profile"""
        profile = ProfileCreate(
            age=25,
            sex=Sex.MALE,
            height_cm=180.0,
            current_weight_kg=80.0,
            target_weight_kg=75.0,
            activity_level=ActivityLevel.MODERATE,
            fitness_goal=FitnessGoal.LOSE_WEIGHT
        )

        assert profile.age == 25
        assert profile.sex == Sex.MALE
        assert profile.height_cm == 180.0

    def test_profile_create_all_optional(self):
        """Test that all profile fields are optional"""
        profile = ProfileCreate()

        assert profile.age is None
        assert profile.sex is None
        assert profile.height_cm is None

    def test_profile_age_validation(self):
        """Test age validation constraints"""
        # Too young
        with pytest.raises(ValidationError):
            ProfileCreate(age=12)

        # Too old
        with pytest.raises(ValidationError):
            ProfileCreate(age=121)

        # Valid ages
        ProfileCreate(age=13)  # Minimum
        ProfileCreate(age=120)  # Maximum
        ProfileCreate(age=25)  # Normal

    def test_profile_height_validation(self):
        """Test height validation"""
        # Negative height
        with pytest.raises(ValidationError):
            ProfileCreate(height_cm=-10)

        # Zero height
        with pytest.raises(ValidationError):
            ProfileCreate(height_cm=0)

        # Too tall
        with pytest.raises(ValidationError):
            ProfileCreate(height_cm=301)

        # Valid heights
        ProfileCreate(height_cm=150.0)
        ProfileCreate(height_cm=300.0)

    def test_profile_weight_validation(self):
        """Test weight validation"""
        # Invalid weights
        with pytest.raises(ValidationError):
            ProfileCreate(current_weight_kg=-5)

        with pytest.raises(ValidationError):
            ProfileCreate(current_weight_kg=0)

        with pytest.raises(ValidationError):
            ProfileCreate(current_weight_kg=501)

        # Valid weights
        ProfileCreate(current_weight_kg=50.0)
        ProfileCreate(current_weight_kg=500.0)


class TestTDEEModels:
    """Test TDEE calculation models"""

    def test_tdee_request_valid(self):
        """Test valid TDEE request"""
        request = TDEERequest(
            age=25,
            sex=Sex.MALE,
            height_cm=180.0,
            weight_kg=80.0,
            activity_level=ActivityLevel.MODERATE
        )

        assert request.age == 25
        assert request.sex == Sex.MALE
        assert request.activity_level == ActivityLevel.MODERATE

    def test_tdee_request_validation(self):
        """Test TDEE request validation"""
        # Missing required fields
        with pytest.raises(ValidationError):
            TDEERequest()

        # Invalid age
        with pytest.raises(ValidationError):
            TDEERequest(
                age=200,
                sex=Sex.MALE,
                height_cm=180,
                weight_kg=80,
                activity_level=ActivityLevel.MODERATE
            )


class TestEnums:
    """Test enum values"""

    def test_activity_level_enum(self):
        """Test ActivityLevel enum values"""
        assert ActivityLevel.SEDENTARY == "sedentary"
        assert ActivityLevel.LIGHT == "light"
        assert ActivityLevel.MODERATE == "moderate"
        assert ActivityLevel.ACTIVE == "active"
        assert ActivityLevel.VERY_ACTIVE == "very_active"

    def test_sex_enum(self):
        """Test Sex enum values"""
        assert Sex.MALE == "male"
        assert Sex.FEMALE == "female"

    def test_fitness_goal_enum(self):
        """Test FitnessGoal enum values"""
        assert FitnessGoal.LOSE_WEIGHT == "lose_weight"
        assert FitnessGoal.MAINTAIN == "maintain"
        assert FitnessGoal.GAIN_MUSCLE == "gain_muscle"
        assert FitnessGoal.IMPROVE_FITNESS == "improve_fitness"
# Tests package for BroncoFit API

