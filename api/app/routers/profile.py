# app/routers/profile.py
from fastapi import APIRouter, HTTPException, status, Depends
from app.models import ProfileCreate, ProfileUpdate, ProfileOut
from app.dependencies import get_current_user
from app.database import get_database
from datetime import datetime
from zoneinfo import ZoneInfo

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=ProfileOut)
async def get_profile(current_user = Depends(get_current_user)):
    """Get current user's profile"""
    db = await get_database()

    profile = await db.profiles.find_one({"user_id": str(current_user["_id"])})

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please create a profile first."
        )

    return ProfileOut(
        user_id=profile["user_id"],
        age=profile.get("age"),
        sex=profile.get("sex"),
        height_cm=profile.get("height_cm"),
        current_weight_kg=profile.get("current_weight_kg"),
        target_weight_kg=profile.get("target_weight_kg"),
        activity_level=profile.get("activity_level"),
        fitness_goal=profile.get("fitness_goal"),
        goal_intensity=profile.get("goal_intensity"),
        target_calories=profile.get("target_calories"),
        updated_at=profile["updated_at"]
    )


@router.post("", response_model=ProfileOut, status_code=status.HTTP_201_CREATED)
async def create_profile(profile: ProfileCreate, current_user = Depends(get_current_user)):
    """Create user profile"""
    db = await get_database()

    existing_profile = await db.profiles.find_one({"user_id": str(current_user["_id"])})
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists. Use PUT to update."
        )

    profile_dict = profile.model_dump(exclude_none=True)
    profile_dict["user_id"] = str(current_user["_id"])
    profile_dict["updated_at"] = datetime.utcnow()

    await db.profiles.insert_one(profile_dict)

    return ProfileOut(**profile_dict)


@router.put("", response_model=ProfileOut)
async def update_profile(profile: ProfileUpdate, current_user = Depends(get_current_user)):
    """Update user profile"""
    db = await get_database()

    existing_profile = await db.profiles.find_one({"user_id": str(current_user["_id"])})

    if not existing_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please create a profile first."
        )

    update_data = profile.model_dump(exclude_none=True)
    update_data["updated_at"] = datetime.utcnow()

    await db.profiles.update_one(
        {"user_id": str(current_user["_id"])},
        {"$set": update_data}
    )

    updated_profile = await db.profiles.find_one({"user_id": str(current_user["_id"])})

    return ProfileOut(
        user_id=updated_profile["user_id"],
        age=updated_profile.get("age"),
        sex=updated_profile.get("sex"),
        height_cm=updated_profile.get("height_cm"),
        current_weight_kg=updated_profile.get("current_weight_kg"),
        target_weight_kg=updated_profile.get("target_weight_kg"),
        activity_level=updated_profile.get("activity_level"),
        fitness_goal=updated_profile.get("fitness_goal"),
        goal_intensity=updated_profile.get("goal_intensity"),
        target_calories=updated_profile.get("target_calories"),
        updated_at=updated_profile["updated_at"]
    )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(current_user = Depends(get_current_user)):
    """Delete user profile"""
    db = await get_database()

    result = await db.profiles.delete_one({"user_id": str(current_user["_id"])})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    return None
