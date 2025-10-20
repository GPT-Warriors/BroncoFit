from fastapi import APIRouter, HTTPException, status, Depends
from app.models import TDEERequest, TDEEResponse, MeasurementCreate, MeasurementOut
from app.calculations import calculate_tdee, calculate_bmi, get_bmi_category
from app.dependencies import get_current_user
from app.database import get_database
from bson import ObjectId
from datetime import datetime
from typing import List, Optional

router = APIRouter(prefix="/calculations", tags=["Calculations"])


@router.post("/tdee", response_model=TDEEResponse)
async def calculate_tdee_endpoint(tdee_request: TDEERequest):
    """
    Calculate TDEE (Total Daily Energy Expenditure) and macro recommendations.
    This endpoint does not require authentication and can be used by anyone.
    """
    result = calculate_tdee(
        weight_kg=tdee_request.weight_kg,
        height_cm=tdee_request.height_cm,
        age=tdee_request.age,
        sex=tdee_request.sex.value,
        activity_level=tdee_request.activity_level
    )

    return TDEEResponse(**result)


@router.get("/bmi")
async def calculate_bmi_endpoint(weight_kg: float, height_cm: float):
    """Calculate BMI and get category"""
    if weight_kg <= 0 or height_cm <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Weight and height must be positive numbers"
        )

    bmi = calculate_bmi(weight_kg, height_cm)
    category = get_bmi_category(bmi)

    return {
        "bmi": bmi,
        "category": category,
        "weight_kg": weight_kg,
        "height_cm": height_cm
    }


@router.post("/tdee/from-profile", response_model=TDEEResponse)
async def calculate_tdee_from_profile(current_user = Depends(get_current_user)):
    """
    Calculate TDEE using the current user's profile data.
    Requires authentication and a complete profile.
    """
    db = await get_database()

    profile = await db.profiles.find_one({"user_id": str(current_user["_id"])})

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please create a profile first."
        )

    # Validate required fields
    required_fields = ["age", "sex", "height_cm", "current_weight_kg", "activity_level"]
    missing_fields = [field for field in required_fields if not profile.get(field)]

    if missing_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Profile is incomplete. Missing fields: {', '.join(missing_fields)}"
        )

    result = calculate_tdee(
        weight_kg=profile["current_weight_kg"],
        height_cm=profile["height_cm"],
        age=profile["age"],
        sex=profile["sex"],
        activity_level=profile["activity_level"]
    )

    return TDEEResponse(**result)
