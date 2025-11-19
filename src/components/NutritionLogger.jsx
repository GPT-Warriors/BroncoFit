import { useState } from 'react';
import apiService from '../services/api';
import './WorkoutLogger.css';  // Shared styles

function NutritionLogger({ onBack, onSuccess }) {
  const [mealType, setMealType] = useState('breakfast');
  const [foods, setFoods] = useState([
    { food_name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '', serving_size: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mealTypes = [
    { value: 'breakfast', label: '🌅 Breakfast' },
    { value: 'lunch', label: '☀️ Lunch' },
    { value: 'dinner', label: '🌙 Dinner' },
    { value: 'snack', label: '🍎 Snack' }
  ];

  const addFood = () => {
    setFoods([
      ...foods,
      { food_name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '', serving_size: '' }
    ]);
  };

  const removeFood = (index) => {
    setFoods(foods.filter((_, i) => i !== index));
  };

  const updateFood = (index, field, value) => {
    const updated = [...foods];
    updated[index][field] = value;
    setFoods(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validFoods = foods.filter(f => f.food_name.trim() && f.calories);

    if (validFoods.length === 0) {
      setError('Please add at least one food item with calories');
      return;
    }

    setLoading(true);

    try {
      const formattedFoods = validFoods.map(food => ({
        food_name: food.food_name,
        calories: parseFloat(food.calories),
        protein_g: food.protein_g ? parseFloat(food.protein_g) : 0,
        carbs_g: food.carbs_g ? parseFloat(food.carbs_g) : 0,
        fat_g: food.fat_g ? parseFloat(food.fat_g) : 0,
        serving_size: food.serving_size || null
      }));

      const mealData = {
        meal_type: mealType,
        foods: formattedFoods,
        notes: notes || null,
        meal_date: new Date().toISOString()
      };

      await apiService.createMeal(mealData);

      // Reset form
      setMealType('breakfast');
      setFoods([{ food_name: '', calories: '', protein_g: '', carbs_g: '', fat_g: '', serving_size: '' }]);
      setNotes('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to log meal');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const validFoods = foods.filter(f => f.food_name.trim() && f.calories);
    return {
      calories: validFoods.reduce((sum, f) => sum + (parseFloat(f.calories) || 0), 0),
      protein: validFoods.reduce((sum, f) => sum + (parseFloat(f.protein_g) || 0), 0),
      carbs: validFoods.reduce((sum, f) => sum + (parseFloat(f.carbs_g) || 0), 0),
      fat: validFoods.reduce((sum, f) => sum + (parseFloat(f.fat_g) || 0), 0)
    };
  };

  const totals = calculateTotals();

  return (
    <div className="nutrition-logger-page">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="logger-container">
        <div className="logger-header">
          <h1>🍽️ Log Meal</h1>
          <p>Track your nutrition</p>
        </div>

        <form className="logger-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          {/* Meal Info */}
          <div className="form-section">
            <h3 className="section-title">Meal Details</h3>

            <div className="form-group">
              <label className="form-label">Meal Type *</label>
              <select
                className="form-input"
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                disabled={loading}
              >
                {mealTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-input"
                placeholder="Meal notes or context..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                rows="2"
              ></textarea>
            </div>
          </div>

          {/* Foods */}
          <div className="form-section">
            <div className="section-title-row">
              <h3 className="section-title">Food Items</h3>
              <button
                type="button"
                className="add-exercise-btn"
                onClick={addFood}
                disabled={loading}
              >
                + Add Food
              </button>
            </div>

            {foods.map((food, index) => (
              <div key={index} className="meal-card">
                <div className="meal-header">
                  <span className="meal-number">#{index + 1}</span>
                  {foods.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeFood(index)}
                      disabled={loading}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Food Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Chicken Breast"
                    value={food.food_name}
                    onChange={(e) => updateFood(index, 'food_name', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Calories *</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="250"
                      value={food.calories}
                      onChange={(e) => updateFood(index, 'calories', e.target.value)}
                      disabled={loading}
                      min="0"
                      step="1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Serving Size</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="100g"
                      value={food.serving_size}
                      onChange={(e) => updateFood(index, 'serving_size', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Protein (g)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="30"
                      value={food.protein_g}
                      onChange={(e) => updateFood(index, 'protein_g', e.target.value)}
                      disabled={loading}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Carbs (g)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="10"
                      value={food.carbs_g}
                      onChange={(e) => updateFood(index, 'carbs_g', e.target.value)}
                      disabled={loading}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fat (g)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="5"
                      value={food.fat_g}
                      onChange={(e) => updateFood(index, 'fat_g', e.target.value)}
                      disabled={loading}
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Totals Summary */}
            {totals.calories > 0 && (
              <div className="totals-summary">
                <h4>Meal Totals:</h4>
                <div className="totals-grid">
                  <div className="total-item">
                    <span className="total-label">Calories</span>
                    <span className="total-value">{totals.calories.toFixed(0)}</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">Protein</span>
                    <span className="total-value">{totals.protein.toFixed(1)}g</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">Carbs</span>
                    <span className="total-value">{totals.carbs.toFixed(1)}g</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">Fat</span>
                    <span className="total-value">{totals.fat.toFixed(1)}g</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onBack} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : '✓ Log Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NutritionLogger;
