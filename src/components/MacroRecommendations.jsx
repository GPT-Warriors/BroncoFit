import { useState, useEffect, useMemo } from 'react';
import apiService from '../services/api';
import './MacroRecommendations.css';

const GOAL_OFFSETS = [250, 500, 750, 1000];

// Macro calculation based on goals
const calculateMacros = (calories, goal, weight_kg) => {
  if (!calories || calories <= 0) return null;

  const weightLbs = weight_kg * 2.20462;

  let proteinPercent, carbPercent, fatPercent;
  let proteinGrams, carbGrams, fatGrams;

  switch(goal?.toLowerCase()) {
    case 'lose_weight':
    case 'cut':
      // Higher protein for muscle preservation during cut
      proteinGrams = weightLbs * 1.0; // 1g per lb bodyweight
      proteinPercent = (proteinGrams * 4) / calories * 100;

      fatPercent = 25; // 25% from fat
      fatGrams = (calories * fatPercent / 100) / 9;

      // Rest from carbs
      const remainingCalories = calories - (proteinGrams * 4) - (fatGrams * 9);
      carbGrams = remainingCalories / 4;
      carbPercent = (carbGrams * 4) / calories * 100;
      break;

    case 'gain_muscle':
    case 'bulk':
      // Moderate protein, higher carbs for energy
      proteinGrams = weightLbs * 0.8; // 0.8g per lb bodyweight
      proteinPercent = (proteinGrams * 4) / calories * 100;

      carbPercent = 45; // 45% from carbs for energy
      carbGrams = (calories * carbPercent / 100) / 4;

      // Rest from fat
      const bulkRemainingCalories = calories - (proteinGrams * 4) - (carbGrams * 4);
      fatGrams = bulkRemainingCalories / 9;
      fatPercent = (fatGrams * 9) / calories * 100;
      break;

    case 'maintain':
    default:
      // Balanced macros
      proteinGrams = weightLbs * 0.9; // 0.9g per lb bodyweight
      proteinPercent = (proteinGrams * 4) / calories * 100;

      carbPercent = 40; // 40% from carbs
      carbGrams = (calories * carbPercent / 100) / 4;

      fatPercent = 30; // 30% from fat
      fatGrams = (calories * fatPercent / 100) / 9;

      // Adjust if protein takes more than expected
      const maintainTotal = proteinPercent + carbPercent + fatPercent;
      if (maintainTotal > 100) {
        const diff = maintainTotal - 100;
        carbPercent -= diff;
        carbGrams = (calories * carbPercent / 100) / 4;
      }
      break;
  }

  return {
    calories: Math.round(calories),
    protein: {
      grams: Math.round(proteinGrams),
      calories: Math.round(proteinGrams * 4),
      percent: Math.round(proteinPercent)
    },
    carbs: {
      grams: Math.round(carbGrams),
      calories: Math.round(carbGrams * 4),
      percent: Math.round(carbPercent)
    },
    fat: {
      grams: Math.round(fatGrams),
      calories: Math.round(fatGrams * 9),
      percent: Math.round(fatPercent)
    }
  };
};

function MacroRecommendationsPage({ onBack, profile, tdeeData }) {
  const [todaysNutrition, setTodaysNutrition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodaysNutrition();
  }, []);

  const loadTodaysNutrition = async () => {
    try {
      const nutrition = await apiService.getTodaysNutritionSummary();
      setTodaysNutrition(nutrition);
    } catch (error) {
      console.error('Error loading nutrition:', error);
      setTodaysNutrition(null);
    } finally {
      setLoading(false);
    }
  };

  // Calculate target calories based on goal
  const targetCalories = useMemo(() => {
    if (!profile || !tdeeData) return null;

    const goal = (profile.fitness_goal || 'maintain').toLowerCase();
    const maintenance = tdeeData.maintenance_calories;
    const intensityIndex = typeof profile.goal_intensity === 'number' ? profile.goal_intensity : 1;
    const offset = GOAL_OFFSETS[intensityIndex] || 0;

    if (goal.includes('lose') || goal.includes('cut')) {
      return profile.target_calories || (maintenance ? Math.round(maintenance - offset) : tdeeData.weight_loss_calories);
    } else if (goal.includes('gain') || goal.includes('bulk') || goal.includes('muscle')) {
      return profile.target_calories || (maintenance ? Math.round(maintenance + offset) : tdeeData.weight_gain_calories);
    } else {
      return profile.target_calories || maintenance || tdeeData.maintenance_calories;
    }
  }, [profile, tdeeData]);

  // Get current weight
  const currentWeight = useMemo(() => {
    return profile?.current_weight_kg || 70;
  }, [profile]);

  // Calculate recommended macros
  const recommended = useMemo(() => {
    if (!targetCalories || !profile) return null;
    return calculateMacros(targetCalories, profile.fitness_goal, currentWeight);
  }, [targetCalories, profile, currentWeight]);

  // Current nutrition data
  const currentCalories = todaysNutrition?.total_calories ?? 0;
  const currentProtein = todaysNutrition?.total_protein_g ?? 0;
  const currentCarbs = todaysNutrition?.total_carbs_g ?? 0;
  const currentFat = todaysNutrition?.total_fat_g ?? 0;

  if (!profile || !tdeeData) {
    return (
      <div className="macro-recommendations-page">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="macro-recommendations">
          <div className="no-recommendations">
            <p>Complete your profile to get personalized macro recommendations</p>
          </div>
        </div>
      </div>
    );
  }

  if (!recommended) {
    return (
      <div className="macro-recommendations-page">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="macro-recommendations">
          <div className="no-recommendations">
            <p>Unable to calculate macro recommendations. Please check your profile settings.</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate percentages of recommended amounts consumed
  const proteinProgress = Math.min((currentProtein / recommended.protein.grams) * 100, 100);
  const carbsProgress = Math.min((currentCarbs / recommended.carbs.grams) * 100, 100);
  const fatProgress = Math.min((currentFat / recommended.fat.grams) * 100, 100);
  const calorieProgress = Math.min((currentCalories / recommended.calories) * 100, 100);

  // Goal-specific tips
  const getTips = () => {
    switch(profile.fitness_goal?.toLowerCase()) {
      case 'lose_weight':
      case 'cut':
        return [
          '💡 High protein helps preserve muscle during weight loss',
          '🥗 Focus on whole foods for satiety',
          '💧 Stay hydrated - aim for 8+ glasses of water'
        ];
      case 'gain_muscle':
      case 'bulk':
        return [
          '💪 Eat protein throughout the day for muscle synthesis',
          '🍝 Time carbs around workouts for energy',
          '😴 Don\'t forget recovery - sleep is crucial'
        ];
      default:
        return [
          '⚖️ Maintain consistent meal timing',
          '🎯 Focus on nutrient-dense whole foods',
          '📊 Track weekly averages, not just daily'
        ];
    }
  };

  const formatGoalName = () => {
    switch(profile.fitness_goal?.toLowerCase()) {
      case 'lose_weight': return 'Cut (Fat Loss)';
      case 'gain_muscle': return 'Bulk (Muscle Gain)';
      case 'maintain': return 'Maintenance';
      default: return profile.fitness_goal;
    }
  };

  return (
    <div className="macro-recommendations-page">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="page-header">
        <h1>🎯 Macro Recommendations</h1>
        <p>Personalized nutrition targets based on your goals</p>
      </div>

      <div className="macro-recommendations">
        <div className="recommendations-header">
          <h3>
            <span className="icon">🎯</span>
            Today's Macro Targets
          </h3>
          <span className="goal-badge">{formatGoalName()}</span>
        </div>

        <div className="macro-grid">
          {/* Calories */}
          <div className="macro-card calories">
            <div className="macro-header">
              <span className="macro-name">Calories</span>
              <span className="macro-icon">🔥</span>
            </div>
            <div className="macro-values">
              <span className="current">{currentCalories}</span>
              <span className="divider">/</span>
              <span className="target">{recommended.calories}</span>
            </div>
            <div className="progress-container">
              <div
                className="progress-bar-fill calories-fill"
                style={{ width: `${calorieProgress}%` }}
              />
            </div>
            <span className="remaining">
              {recommended.calories - currentCalories > 0
                ? `${recommended.calories - currentCalories} remaining`
                : `${Math.abs(recommended.calories - currentCalories)} over`
              }
            </span>
          </div>

          {/* Protein */}
          <div className="macro-card protein">
            <div className="macro-header">
              <span className="macro-name">Protein</span>
              <span className="macro-icon">💪</span>
            </div>
            <div className="macro-values">
              <span className="current">{currentProtein.toFixed(0)}g</span>
              <span className="divider">/</span>
              <span className="target">{recommended.protein.grams}g</span>
            </div>
            <div className="progress-container">
              <div
                className="progress-bar-fill protein-fill"
                style={{ width: `${proteinProgress}%` }}
              />
            </div>
            <div className="macro-info">
              <span className="macro-percent">{recommended.protein.percent}%</span>
              <span className="macro-cal">{recommended.protein.calories} cal</span>
            </div>
          </div>

          {/* Carbs */}
          <div className="macro-card carbs">
            <div className="macro-header">
              <span className="macro-name">Carbs</span>
              <span className="macro-icon">🌾</span>
            </div>
            <div className="macro-values">
              <span className="current">{currentCarbs.toFixed(0)}g</span>
              <span className="divider">/</span>
              <span className="target">{recommended.carbs.grams}g</span>
            </div>
            <div className="progress-container">
              <div
                className="progress-bar-fill carbs-fill"
                style={{ width: `${carbsProgress}%` }}
              />
            </div>
            <div className="macro-info">
              <span className="macro-percent">{recommended.carbs.percent}%</span>
              <span className="macro-cal">{recommended.carbs.calories} cal</span>
            </div>
          </div>

          {/* Fat */}
          <div className="macro-card fat">
            <div className="macro-header">
              <span className="macro-name">Fat</span>
              <span className="macro-icon">🥑</span>
            </div>
            <div className="macro-values">
              <span className="current">{currentFat.toFixed(0)}g</span>
              <span className="divider">/</span>
              <span className="target">{recommended.fat.grams}g</span>
            </div>
            <div className="progress-container">
              <div
                className="progress-bar-fill fat-fill"
                style={{ width: `${fatProgress}%` }}
              />
            </div>
            <div className="macro-info">
              <span className="macro-percent">{recommended.fat.percent}%</span>
              <span className="macro-cal">{recommended.fat.calories} cal</span>
            </div>
          </div>
        </div>

        {/* Macro Distribution Chart */}
        <div className="macro-distribution">
          <h4>Recommended Distribution</h4>
          <div className="distribution-bar">
            <div
              className="distribution-segment protein-segment"
              style={{ width: `${recommended.protein.percent}%` }}
              title={`Protein: ${recommended.protein.percent}%`}
            >
              <span>{recommended.protein.percent}%</span>
            </div>
            <div
              className="distribution-segment carbs-segment"
              style={{ width: `${recommended.carbs.percent}%` }}
              title={`Carbs: ${recommended.carbs.percent}%`}
            >
              <span>{recommended.carbs.percent}%</span>
            </div>
            <div
              className="distribution-segment fat-segment"
              style={{ width: `${recommended.fat.percent}%` }}
              title={`Fat: ${recommended.fat.percent}%`}
            >
              <span>{recommended.fat.percent}%</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="macro-tips">
          <h4>💡 Daily Tips</h4>
          <ul>
            {getTips().map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MacroRecommendationsPage;