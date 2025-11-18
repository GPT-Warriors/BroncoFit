from fastapi import APIRouter, Depends, HTTPException
from app.models import WorkoutCreate, WorkoutOut
from app.dependencies import get_current_user
from app.database import get_database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/workouts", tags=["Workouts"])


@router.post("", response_model=WorkoutOut)
async def create_workout(
    workout: WorkoutCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Log a new workout"""
    workout_dict = workout.model_dump()
    workout_dict["user_id"] = str(current_user["_id"])
    workout_dict["created_at"] = datetime.now()
    
    if not workout_dict.get("workout_date"):
        workout_dict["workout_date"] = datetime.now()
    
    result = await db.workouts.insert_one(workout_dict)
    workout_dict["id"] = str(result.inserted_id)
    
    return WorkoutOut(**workout_dict)


@router.get("", response_model=list[WorkoutOut])
async def get_workouts(
    limit: int = 30,
    skip: int = 0,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Get user's workout history"""
    workouts = await db.workouts.find(
        {"user_id": str(current_user["_id"])}
    ).sort("workout_date", -1).skip(skip).limit(limit).to_list(limit)
    
    for workout in workouts:
        workout["id"] = str(workout.pop("_id"))
    
    return [WorkoutOut(**w) for w in workouts]


@router.get("/latest", response_model=WorkoutOut)
async def get_latest_workout(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Get the most recent workout"""
    workout = await db.workouts.find_one(
        {"user_id": str(current_user["_id"])},
        sort=[("workout_date", -1)]
    )
    
    if not workout:
        raise HTTPException(status_code=404, detail="No workouts found")
    
    workout["id"] = str(workout.pop("_id"))
    return WorkoutOut(**workout)


@router.get("/{workout_id}", response_model=WorkoutOut)
async def get_workout(
    workout_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Get a specific workout"""
    try:
        workout = await db.workouts.find_one({
            "_id": ObjectId(workout_id),
            "user_id": str(current_user["_id"])
        })
    except:
        raise HTTPException(status_code=400, detail="Invalid workout ID")
    
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    workout["id"] = str(workout.pop("_id"))
    return WorkoutOut(**workout)


@router.put("/{workout_id}", response_model=WorkoutOut)
async def update_workout(
    workout_id: str,
    workout_update: WorkoutCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Update a workout"""
    try:
        result = await db.workouts.update_one(
            {"_id": ObjectId(workout_id), "user_id": str(current_user["_id"])},
            {"$set": workout_update.model_dump()}
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid workout ID")
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    return await get_workout(workout_id, current_user, db)


@router.delete("/{workout_id}")
async def delete_workout(
    workout_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Delete a workout"""
    try:
        result = await db.workouts.delete_one({
            "_id": ObjectId(workout_id),
            "user_id": str(current_user["_id"])
        })
    except:
        raise HTTPException(status_code=400, detail="Invalid workout ID")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workout not found")
    
    return {"message": "Workout deleted successfully"}
