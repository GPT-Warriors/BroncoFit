# app/models.py
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum


class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"
    LIGHT = "light"
    MODERATE = "moderate"
    ACTIVE = "active"
    VERY_ACTIVE = "very_active"


class Sex(str, Enum):
    MALE = "male"
    FEMALE = "female"


class FitnessGoal(str, Enum):
    LOSE_WEIGHT = "lose_weight"
    MAINTAIN = "maintain"
    GAIN_MUSCLE = "gain_muscle"
    IMPROVE_FITNESS = "improve_fitness"


# User Models
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None


# Profile Models
class ProfileBase(BaseModel):
    age: Optional[int] = Field(None, ge=13, le=120)
    sex: Optional[Sex] = None
    height_cm: Optional[float] = Field(None, gt=0, le=300)
    current_weight_kg: Optional[float] = Field(None, gt=0, le=500)
    target_weight_kg: Optional[float] = Field(None, gt=0, le=500)
    activity_level: Optional[ActivityLevel] = None
    fitness_goal: Optional[FitnessGoal] = None
    goal_intensity: Optional[int] = Field(None, ge=0, le=3)
    target_calories: Optional[int] = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(ProfileBase):
    pass


class ProfileOut(ProfileBase):
    user_id: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# TDEE Calculation Models
class TDEERequest(BaseModel):
    age: int = Field(..., ge=13, le=120)
    sex: Sex
    height_cm: float = Field(..., gt=0, le=300)
    weight_kg: float = Field(..., gt=0, le=500)
    activity_level: ActivityLevel


class TDEEResponse(BaseModel):
    bmr: float
    tdee: float
    activity_multiplier: float
    maintenance_calories: float

    # Macro recommendations (grams)
    protein_g: float
    carbs_g: float
    fat_g: float

    # Weight goal recommendations (calories)
    mild_weight_loss: float  # -250 cal
    weight_loss: float  # -500 cal
    extreme_weight_loss: float  # -1000 cal
    mild_weight_gain: float  # +250 cal
    weight_gain: float  # +500 cal
    fast_weight_gain: float  # +1000 cal


# Measurement Models
class MeasurementCreate(BaseModel):
    weight_kg: float = Field(..., gt=0, le=500)
    body_fat_pct: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = None
    measurement_date: Optional[datetime] = None


class MeasurementOut(MeasurementCreate):
    id: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Workout Models
class ExerciseType(str, Enum):
    STRENGTH = "strength"
    CARDIO = "cardio"
    FLEXIBILITY = "flexibility"
    SPORTS = "sports"


class WorkoutExercise(BaseModel):
    exercise_name: str
    exercise_type: ExerciseType
    sets: Optional[int] = None
    reps: Optional[int] = None
    weight_kg: Optional[float] = None
    duration_minutes: Optional[int] = None
    distance_km: Optional[float] = None
    notes: Optional[str] = None


class WorkoutCreate(BaseModel):
    workout_name: str
    exercises: list[WorkoutExercise]
    workout_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None


class WorkoutOut(WorkoutCreate):
    id: str
    user_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Nutrition Models
class MealType(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"


class FoodItem(BaseModel):
    food_name: str
    calories: float
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    serving_size: Optional[str] = None


class MealCreate(BaseModel):
    meal_type: MealType
    foods: list[FoodItem]
    meal_date: Optional[datetime] = None
    notes: Optional[str] = None


class MealOut(MealCreate):
    id: str
    user_id: str
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# AI Coach Models
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[list[ChatMessage]] = []


class ChatResponse(BaseModel):
    response: str
    timestamp: datetime


# Workout Plan Models
class WorkoutPlanRequest(BaseModel):
    goal: FitnessGoal
    experience_level: str  # "beginner", "intermediate", "advanced"
    days_per_week: int = Field(..., ge=1, le=7)
    equipment_available: list[str] = []  # ["dumbbells", "barbell", "resistance_bands", etc.]
    duration_per_session: int = Field(..., ge=15, le=120)  # minutes


class WorkoutPlanOut(BaseModel):
    plan_name: str
    description: str
    duration_weeks: int
    workouts: list[dict]  # Generated workout plan structure
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
