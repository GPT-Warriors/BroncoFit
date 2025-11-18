from fastapi import APIRouter, Depends, HTTPException
from app.models import ChatRequest, ChatResponse, WorkoutPlanRequest, WorkoutPlanOut
from app.dependencies import get_current_user
from app.database import get_database
from app.ai_coach import chat_with_coach, generate_workout_plan, get_user_context, suggest_workout
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/ai-coach", tags=["AI Coach"])


class WorkoutSuggestionRequest(BaseModel):
    message: str


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Chat with the AI fitness coach
    """
    try:
        # Gather user context
        user_data = {}
        
        # Get profile
        user_id = str(current_user["_id"])
        profile = await db.profiles.find_one({"user_id": user_id})
        if profile:
            profile.pop("_id", None)
            user_data["profile"] = profile

        # Get latest measurement
        latest_measurement = await db.measurements.find_one(
            {"user_id": user_id},
            sort=[("measurement_date", -1)]
        )
        if latest_measurement:
            latest_measurement.pop("_id", None)
            user_data["latest_measurement"] = latest_measurement

        # Get recent workouts (last 7 days)
        recent_workouts = await db.workouts.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(5).to_list(5)
        user_data["recent_workouts"] = recent_workouts

        # Get recent meals (last 7 days)
        recent_meals = await db.meals.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(5).to_list(5)
        user_data["recent_meals"] = recent_meals
        
        # Build context
        context = await get_user_context(user_data)
        
        # Get AI response
        response_text = await chat_with_coach(
            user_message=request.message,
            user_context=context,
            conversation_history=request.conversation_history
        )
        
        return ChatResponse(
            response=response_text,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-workout-plan", response_model=dict)
async def create_workout_plan(
    request: WorkoutPlanRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Generate a personalized workout plan using AI
    """
    try:
        # Get user profile for context
        user_id = str(current_user["_id"])
        profile = await db.profiles.find_one({"user_id": user_id})

        user_data = {}
        if profile:
            profile.pop("_id", None)
            user_data["profile"] = profile

        context = await get_user_context(user_data)

        # Generate plan
        plan = await generate_workout_plan(
            goal=request.goal,
            experience_level=request.experience_level,
            days_per_week=request.days_per_week,
            equipment=request.equipment_available,
            duration_minutes=request.duration_per_session,
            user_context=context
        )

        return plan

    except Exception as e:
        print(f"Workout plan generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/suggest-workout", response_model=dict)
async def get_workout_suggestion(
    request: WorkoutSuggestionRequest,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """
    Get an AI-generated workout suggestion that can be saved directly
    """
    try:
        # Get user context
        user_id = str(current_user["_id"])
        profile = await db.profiles.find_one({"user_id": user_id})

        user_data = {}
        if profile:
            profile.pop("_id", None)
            user_data["profile"] = profile

        # Get latest measurement
        latest_measurement = await db.measurements.find_one(
            {"user_id": user_id},
            sort=[("measurement_date", -1)]
        )
        if latest_measurement:
            latest_measurement.pop("_id", None)
            user_data["latest_measurement"] = latest_measurement

        context = await get_user_context(user_data)

        # Generate workout suggestion
        result = await suggest_workout(
            user_message=request.message,
            user_context=context
        )

        return result

    except Exception as e:
        print(f"Workout suggestion error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
