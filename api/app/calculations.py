from app.models import ActivityLevel


# Activity level multipliers for TDEE calculation
ACTIVITY_MULTIPLIERS = {
    ActivityLevel.SEDENTARY: 1.2,        # Little or no exercise
    ActivityLevel.LIGHT: 1.375,          # Light exercise 1-3 days/week
    ActivityLevel.MODERATE: 1.55,        # Moderate exercise 3-5 days/week
    ActivityLevel.ACTIVE: 1.725,         # Hard exercise 6-7 days/week
    ActivityLevel.VERY_ACTIVE: 1.9,      # Very hard exercise & physical job
}


def calculate_bmr_mifflin_st_jeor(weight_kg: float, height_cm: float, age: int, sex: str) -> float:
    """
    Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation.
    This is the most accurate formula for BMR calculation.

    For men: BMR = 10W + 6.25H - 5A + 5
    For women: BMR = 10W + 6.25H - 5A - 161

    Where:
    W = weight in kg
    H = height in cm
    A = age in years
    """
    base = (10 * weight_kg) + (6.25 * height_cm) - (5 * age)

    if sex.lower() in ("male", "m"):
        bmr = base + 5
    else:  # female
        bmr = base - 161

    return round(bmr, 2)


def calculate_tdee(weight_kg: float, height_cm: float, age: int, sex: str, activity_level: ActivityLevel) -> dict:
    """
    Calculate Total Daily Energy Expenditure (TDEE) and related metrics.

    Returns a dictionary with:
    - bmr: Basal Metabolic Rate
    - tdee: Total Daily Energy Expenditure
    - activity_multiplier: The multiplier used
    - maintenance_calories: Same as TDEE
    - protein_g, carbs_g, fat_g: Macro recommendations
    - Weight goal calorie recommendations
    """
    bmr = calculate_bmr_mifflin_st_jeor(weight_kg, height_cm, age, sex)
    multiplier = ACTIVITY_MULTIPLIERS[activity_level]
    tdee = round(bmr * multiplier, 2)

    # Calculate macros (using moderate approach)
    # Protein: 2g per kg body weight
    # Fat: 25% of calories
    # Carbs: remaining calories
    protein_g = round(weight_kg * 2, 2)
    fat_calories = tdee * 0.25
    fat_g = round(fat_calories / 9, 2)  # 9 calories per gram of fat

    protein_calories = protein_g * 4  # 4 calories per gram of protein
    fat_calories_actual = fat_g * 9
    carb_calories = tdee - protein_calories - fat_calories_actual
    carbs_g = round(carb_calories / 4, 2)  # 4 calories per gram of carbs

    return {
        "bmr": bmr,
        "tdee": tdee,
        "activity_multiplier": multiplier,
        "maintenance_calories": tdee,
        "protein_g": protein_g,
        "carbs_g": carbs_g,
        "fat_g": fat_g,
        # Weight loss recommendations
        "mild_weight_loss": round(tdee - 250, 2),      # 0.5 lb/week
        "weight_loss": round(tdee - 500, 2),           # 1 lb/week
        "extreme_weight_loss": round(tdee - 1000, 2),  # 2 lb/week
        # Weight gain recommendations
        "mild_weight_gain": round(tdee + 250, 2),      # 0.5 lb/week
        "weight_gain": round(tdee + 500, 2),           # 1 lb/week
        "fast_weight_gain": round(tdee + 1000, 2),     # 2 lb/week
    }


def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    """
    Calculate Body Mass Index (BMI).
    BMI = weight(kg) / (height(m))^2
    """
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)
    return round(bmi, 2)


def get_bmi_category(bmi: float) -> str:
    """Get BMI category based on WHO classifications"""
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25:
        return "Normal weight"
    elif bmi < 30:
        return "Overweight"
    else:
        return "Obese"

