from fastapi import APIRouter, Depends, HTTPException
from app.models import MealCreate, MealOut
from app.dependencies import get_current_user
from app.database import get_database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/nutrition", tags=["Nutrition"])


@router.post("", response_model=MealOut)
async def create_meal(
    meal: MealCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Log a new meal"""
    meal_dict = meal.model_dump()
    meal_dict["user_id"] = str(current_user["_id"])
    meal_dict["created_at"] = datetime.now()
    
    if not meal_dict.get("meal_date"):
        meal_dict["meal_date"] = datetime.now()
    
    # Calculate totals
    total_calories = sum(food["calories"] for food in meal_dict["foods"])
    total_protein = sum(food.get("protein_g", 0) for food in meal_dict["foods"])
    total_carbs = sum(food.get("carbs_g", 0) for food in meal_dict["foods"])
    total_fat = sum(food.get("fat_g", 0) for food in meal_dict["foods"])
    
    meal_dict["total_calories"] = total_calories
    meal_dict["total_protein_g"] = total_protein
    meal_dict["total_carbs_g"] = total_carbs
    meal_dict["total_fat_g"] = total_fat
    
    result = await db.meals.insert_one(meal_dict)
    meal_dict["id"] = str(result.inserted_id)
    
    return MealOut(**meal_dict)


@router.get("", response_model=list[MealOut])
async def get_meals(
    limit: int = 30,
    skip: int = 0,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Get user's meal history"""
    meals = await db.meals.find(
        {"user_id": str(current_user["_id"])}
    ).sort("meal_date", -1).skip(skip).limit(limit).to_list(limit)
    
    for meal in meals:
        meal["id"] = str(meal.pop("_id"))
    
    return [MealOut(**m) for m in meals]


@router.get("/today", response_model=list[MealOut])
async def get_todays_meals(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Get today's meals"""
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    meals = await db.meals.find({
        "user_id": str(current_user["_id"]),
        "meal_date": {"$gte": today_start}
    }).sort("meal_date", -1).to_list(100)
    
    for meal in meals:
        meal["id"] = str(meal.pop("_id"))
    
    return [MealOut(**m) for m in meals]


@router.get("/summary/today")
async def get_todays_nutrition_summary(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Get nutrition summary for today"""
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    meals = await db.meals.find({
        "user_id": str(current_user["_id"]),
        "meal_date": {"$gte": today_start}
    }).to_list(100)
    
    total_calories = sum(m.get("total_calories", 0) for m in meals)
    total_protein = sum(m.get("total_protein_g", 0) for m in meals)
    total_carbs = sum(m.get("total_carbs_g", 0) for m in meals)
    total_fat = sum(m.get("total_fat_g", 0) for m in meals)
    
    return {
        "date": today_start,
        "total_calories": total_calories,
        "total_protein_g": total_protein,
        "total_carbs_g": total_carbs,
        "total_fat_g": total_fat,
        "meals_logged": len(meals)
    }


@router.get("/{meal_id}", response_model=MealOut)
async def get_meal(
    meal_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Get a specific meal"""
    try:
        meal = await db.meals.find_one({
            "_id": ObjectId(meal_id),
            "user_id": str(current_user["_id"])
        })
    except:
        raise HTTPException(status_code=400, detail="Invalid meal ID")
    
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    meal["id"] = str(meal.pop("_id"))
    return MealOut(**meal)


@router.put("/{meal_id}", response_model=MealOut)
async def update_meal(
    meal_id: str,
    meal_update: MealCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Update a meal"""
    meal_dict = meal_update.model_dump()
    
    # Recalculate totals
    total_calories = sum(food["calories"] for food in meal_dict["foods"])
    total_protein = sum(food.get("protein_g", 0) for food in meal_dict["foods"])
    total_carbs = sum(food.get("carbs_g", 0) for food in meal_dict["foods"])
    total_fat = sum(food.get("fat_g", 0) for food in meal_dict["foods"])
    
    meal_dict["total_calories"] = total_calories
    meal_dict["total_protein_g"] = total_protein
    meal_dict["total_carbs_g"] = total_carbs
    meal_dict["total_fat_g"] = total_fat
    
    try:
        result = await db.meals.update_one(
            {"_id": ObjectId(meal_id), "user_id": str(current_user["_id"])},
            {"$set": meal_dict}
        )
    except:
        raise HTTPException(status_code=400, detail="Invalid meal ID")
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    return await get_meal(meal_id, current_user, db)


@router.delete("/{meal_id}")
async def delete_meal(
    meal_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_database)
):
    """Delete a meal"""
    try:
        result = await db.meals.delete_one({
            "_id": ObjectId(meal_id),
            "user_id": str(current_user["_id"])
        })
    except:
        raise HTTPException(status_code=400, detail="Invalid meal ID")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    return {"message": "Meal deleted successfully"}
