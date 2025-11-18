import google.generativeai as genai
from app.config import settings
from app.models import ChatMessage
from typing import Optional
from datetime import datetime
import json
import re

# Configure Gemini
genai.configure(api_key=settings.gemini_api_key)

# Initialize the model (using gemini-2.5-flash for faster responses)
model = genai.GenerativeModel('gemini-2.5-flash')


async def get_user_context(user_data: dict) -> str:
    """Build context about the user for the AI coach"""
    context_parts = []
    
    if user_data.get('profile'):
        profile = user_data['profile']
        context_parts.append(f"User Profile:")
        context_parts.append(f"- Age: {profile.get('age')} years old")
        context_parts.append(f"- Sex: {profile.get('sex')}")
        context_parts.append(f"- Height: {profile.get('height_cm')} cm")
        context_parts.append(f"- Current Weight: {profile.get('current_weight_kg')} kg")
        context_parts.append(f"- Target Weight: {profile.get('target_weight_kg')} kg")
        context_parts.append(f"- Activity Level: {profile.get('activity_level')}")
        context_parts.append(f"- Fitness Goal: {profile.get('fitness_goal')}")
    
    if user_data.get('latest_measurement'):
        meas = user_data['latest_measurement']
        context_parts.append(f"\nLatest Measurement:")
        context_parts.append(f"- Weight: {meas.get('weight_kg')} kg")
        if meas.get('body_fat_pct'):
            context_parts.append(f"- Body Fat: {meas.get('body_fat_pct')}%")
    
    if user_data.get('recent_workouts'):
        workouts = user_data['recent_workouts']
        context_parts.append(f"\nRecent Workouts: {len(workouts)} workouts logged")
    
    if user_data.get('recent_meals'):
        meals = user_data['recent_meals']
        context_parts.append(f"Recent Nutrition: {len(meals)} meals logged")
    
    return "\n".join(context_parts)


async def chat_with_coach(
    user_message: str,
    user_context: str,
    conversation_history: Optional[list[ChatMessage]] = None
) -> str:
    """
    Chat with the AI fitness coach
    
    Args:
        user_message: The user's current message
        user_context: Context about the user (profile, goals, etc.)
        conversation_history: Previous messages in the conversation
    
    Returns:
        AI coach's response
    """
    
    # Build the system prompt
    system_prompt = f"""You are an expert AI fitness coach for BroncoFit. Your role is to provide:
- Personalized fitness advice
- Nutrition guidance
- Motivation and support
- Workout recommendations
- Progress tracking insights

You are encouraging, knowledgeable, and focus on sustainable, healthy practices.
Never recommend extreme diets or unsafe exercises.

Here is the user's information:
{user_context}

Provide helpful, actionable advice based on their goals and current situation.
Keep responses concise but informative (2-4 paragraphs max).
"""
    
    # Build conversation history
    messages = [system_prompt]
    
    if conversation_history:
        for msg in conversation_history[-5:]:  # Keep last 5 messages for context
            role_prefix = "User" if msg.role == "user" else "Coach"
            messages.append(f"{role_prefix}: {msg.content}")
    
    messages.append(f"User: {user_message}")
    
    # Generate response
    try:
        response = model.generate_content("\n\n".join(messages))
        return response.text
    except Exception as e:
        print(f"Error generating AI response: {e}")
        return "I'm having trouble connecting right now. Please try again in a moment."


async def generate_workout_plan(
    goal: str,
    experience_level: str,
    days_per_week: int,
    equipment: list[str],
    duration_minutes: int,
    user_context: str
) -> dict:
    """
    Generate a personalized workout plan using Gemini

    Returns a structured workout plan
    """

    equipment_str = ", ".join(equipment) if equipment else "bodyweight only"

    prompt = f"""Create a detailed {days_per_week}-day per week workout plan with the following specifications:

User Context:
{user_context}

Plan Requirements:
- Goal: {goal}
- Experience Level: {experience_level}
- Equipment Available: {equipment_str}
- Session Duration: {duration_minutes} minutes per workout
- Days per Week: {days_per_week}

Please provide:
1. A plan name
2. Brief description (2-3 sentences)
3. Recommended duration (weeks)
4. Detailed workout structure for each day, including:
   - Exercise names
   - Sets and reps (or duration for cardio)
   - Brief form tips
   - Rest periods

Format the response as a structured plan that's easy to follow.
Focus on progressive overload and sustainability.
"""

    try:
        response = model.generate_content(prompt)

        return {
            "plan_name": f"{experience_level.title()} {goal.replace('_', ' ').title()} Plan",
            "description": f"A {days_per_week}-day per week program designed for {goal.replace('_', ' ')}",
            "duration_weeks": 8 if experience_level == "beginner" else 12,
            "ai_generated_plan": response.text,
            "created_at": datetime.now()
        }
    except Exception as e:
        print(f"Error generating workout plan: {e}")
        raise Exception("Failed to generate workout plan")


async def suggest_workout(
    user_message: str,
    user_context: str
) -> dict:
    """
    Generate a structured workout suggestion based on user's request

    Returns a structured workout with exercises that can be saved directly
    """

    prompt = f"""You are an expert fitness coach. The user is asking for a workout suggestion.

User Context:
{user_context}

User Request:
{user_message}

Generate a workout with 4-8 exercises that matches their request. Return your response as a JSON object with this exact structure:

{{
  "workout_name": "Name of the workout (e.g., 'Upper Body Strength')",
  "description": "Brief 1-2 sentence description of the workout",
  "exercises": [
    {{
      "exercise_name": "Exercise name",
      "exercise_type": "strength",
      "sets": 3,
      "reps": 10,
      "weight_kg": null,
      "notes": "Brief form tip or instruction"
    }}
  ],
  "duration_minutes": 45,
  "notes": "Any additional tips for the workout"
}}

Rules:
- exercise_type must be one of: "strength", "cardio", "flexibility", "sports"
- For strength exercises: include sets and reps, leave weight_kg as null (user will fill in)
- For cardio: include duration_minutes in the exercise, leave sets/reps as null
- Include 4-8 exercises total
- Base recommendations on their fitness goal and experience level
- Make it practical and effective
- Return ONLY the JSON, no other text"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Extract JSON from markdown code blocks if present
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(1)

        # Parse the JSON response
        workout_data = json.loads(response_text)

        # Validate the structure
        if not workout_data.get("workout_name"):
            workout_data["workout_name"] = "AI Suggested Workout"
        if not workout_data.get("exercises"):
            raise ValueError("No exercises in workout")

        return {
            "success": True,
            "workout": workout_data,
            "message": "Here's a workout I've created for you! You can review it and save it directly to your workout log."
        }

    except json.JSONDecodeError as e:
        print(f"Error parsing AI JSON response: {e}")
        print(f"Response was: {response_text}")
        # Return a fallback workout
        return {
            "success": False,
            "error": "Failed to generate structured workout",
            "fallback_text": response_text
        }
    except Exception as e:
        print(f"Error generating workout suggestion: {e}")
        raise Exception("Failed to generate workout suggestion")
