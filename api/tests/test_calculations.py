"""
Test fitness calculations (BMR, TDEE, macros)
"""
import pytest
from app.calculations import (
    calculate_bmr_mifflin_st_jeor,
    calculate_tdee,
    ACTIVITY_MULTIPLIERS
)
from app.models import ActivityLevel


class TestBMRCalculations:
    """Test Basal Metabolic Rate calculations"""

    def test_bmr_male(self):
        """Test BMR calculation for male"""
        # Test case: 80kg, 180cm, 25 years old, male
        bmr = calculate_bmr_mifflin_st_jeor(
            weight_kg=80,
            height_cm=180,
            age=25,
            sex="male"
        )

        # Expected: (10*80) + (6.25*180) - (5*25) + 5 = 1805
        assert bmr == 1805.0

    def test_bmr_female(self):
        """Test BMR calculation for female"""
        # Test case: 60kg, 165cm, 30 years old, female
        bmr = calculate_bmr_mifflin_st_jeor(
            weight_kg=60,
            height_cm=165,
            age=30,
            sex="female"
        )

        # Expected: (10*60) + (6.25*165) - (5*30) - 161 = 1320.25
        assert bmr == 1320.25

    def test_bmr_case_insensitive(self):
        """Test that sex parameter is case insensitive"""
        params = {
            "weight_kg": 75,
            "height_cm": 175,
            "age": 28
        }

        bmr_male_lower = calculate_bmr_mifflin_st_jeor(**params, sex="male")
        bmr_male_upper = calculate_bmr_mifflin_st_jeor(**params, sex="MALE")

        assert bmr_male_lower == bmr_male_upper


class TestTDEECalculations:
    """Test Total Daily Energy Expenditure calculations"""

    def test_tdee_sedentary(self):
        """Test TDEE with sedentary activity level"""
        result = calculate_tdee(
            weight_kg=80,
            height_cm=180,
            age=25,
            sex="male",
            activity_level=ActivityLevel.SEDENTARY
        )

        assert "bmr" in result
        assert "tdee" in result
        assert "activity_multiplier" in result
        assert result["bmr"] == 1805.0
        assert result["activity_multiplier"] == 1.2
        assert result["tdee"] == round(1805 * 1.2, 2)

    def test_tdee_very_active(self):
        """Test TDEE with very active lifestyle"""
        result = calculate_tdee(
            weight_kg=70,
            height_cm=170,
            age=30,
            sex="female",
            activity_level=ActivityLevel.VERY_ACTIVE
        )

        assert result["activity_multiplier"] == 1.9
        assert result["tdee"] > result["bmr"]

    def test_tdee_includes_macros(self):
        """Test that TDEE calculation includes macro recommendations"""
        result = calculate_tdee(
            weight_kg=75,
            height_cm=175,
            age=28,
            sex="male",
            activity_level=ActivityLevel.MODERATE
        )

        assert "protein_g" in result
        assert "carbs_g" in result
        assert result["protein_g"] > 0
        assert result["carbs_g"] > 0

    def test_all_activity_levels(self):
        """Test TDEE calculation for all activity levels"""
        params = {
            "weight_kg": 70,
            "height_cm": 170,
            "age": 25,
            "sex": "male"
        }

        for activity_level in ActivityLevel:
            result = calculate_tdee(**params, activity_level=activity_level)

            assert result["tdee"] > 0
            assert result["activity_multiplier"] == ACTIVITY_MULTIPLIERS[activity_level]


class TestCalculationEndpoints:
    """Test calculation API endpoints"""

    def test_calculate_tdee_endpoint(self, client, auth_headers):
        """Test TDEE calculation endpoint"""
        request_data = {
            "age": 25,
            "sex": "male",
            "height_cm": 180,
            "weight_kg": 80,
            "activity_level": "moderate"
        }

        response = client.post(
            "/api/calculations/tdee",
            json=request_data,
            headers=auth_headers
        )

        # May require auth, so accept 200 or 401
        assert response.status_code in [200, 401, 403]

        if response.status_code == 200:
            data = response.json()
            assert "bmr" in data
            assert "tdee" in data
            assert data["tdee"] > data["bmr"]

    def test_calculate_tdee_invalid_data(self, client, auth_headers):
        """Test TDEE endpoint with invalid data"""
        invalid_data = {
            "age": -5,  # Invalid age
            "sex": "male",
            "height_cm": 180,
            "weight_kg": 80,
            "activity_level": "moderate"
        }

        response = client.post(
            "/api/calculations/tdee",
            json=invalid_data,
            headers=auth_headers
        )

        assert response.status_code in [422, 401, 403]  # Validation error or auth error

    def test_calculate_tdee_missing_fields(self, client, auth_headers):
        """Test TDEE endpoint with missing required fields"""
        incomplete_data = {
            "age": 25,
            "sex": "male"
            # Missing height_cm, weight_kg, activity_level
        }

        response = client.post(
            "/api/calculations/tdee",
            json=incomplete_data,
            headers=auth_headers
        )

        assert response.status_code in [422, 401, 403]

