import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import './FoodCalendar.css';

const FoodCalendar = ({ meals = [] }) => {
  // state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // Parse date from ISO string to MM/DD/YYYY format
  const formatDateToMMDDYYYY = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  // Parse MM/DD/YYYY to Date
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const [month, day, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Format meals for calendar
  const formattedMeals = meals.map((meal) => ({
    ...meal,
    date: formatDateToMMDDYYYY(meal.meal_date),
    totalCalories: meal.total_calories || 0,
    totalProtein: meal.total_protein_g || 0,
    totalCarbs: meal.total_carbs_g || 0,
    totalFat: meal.total_fat_g || 0
  }));

  // Get meals for a specific calendar day
  const getMealsForDay = (year, month, day) =>
    formattedMeals.filter((meal) => {
      if (!meal.date) return false;
      const d = parseDate(meal.date);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day
      );
    });

  // Calculate daily totals
  const getDayTotals = (meals) => {
    return meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalProtein,
      carbs: acc.carbs + meal.totalCarbs,
      fat: acc.fat + meal.totalFat,
      count: acc.count + 1
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 });
  };

  // month values
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

  // change month
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Build day cells
  const renderCalendarDays = () => {
    const days = [];

    // Leading empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dayMeals = getMealsForDay(year, month, d);
      const isSelected = selectedDay === d;
      const hasMeals = dayMeals.length > 0;
      const totals = getDayTotals(dayMeals);

      // Determine intensity based on calories
      let intensityClass = '';
      if (totals.calories > 0) {
        if (totals.calories < 1500) intensityClass = 'low-cal';
        else if (totals.calories < 2500) intensityClass = 'med-cal';
        else intensityClass = 'high-cal';
      }

      days.push(
        <div
          key={d}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${hasMeals ? 'has-meals' : ''} ${intensityClass}`}
          onClick={() => setSelectedDay(d)}
        >
          <span className="day-number">{d}</span>
          {hasMeals && (
            <div className="meal-indicator">
              <span className="meal-count">{dayMeals.length}</span>
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  // Meals for the chosen day
  const selectedMeals = selectedDay ? getMealsForDay(year, month, selectedDay) : [];
  const selectedTotals = getDayTotals(selectedMeals);

  // Meal type icons
  const getMealIcon = (mealType) => {
    switch(mealType?.toLowerCase()) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  return (
    <div className="calendar-container food-calendar">
      {/* Header */}
      <div className="calendar-header">
        <div className="month-display">
          <CalendarIcon className="icon-green" size={24} />
          <h2>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        </div>
        <div className="nav-buttons">
          <button onClick={prevMonth} className="nav-btn"><ChevronLeft size={20} /></button>
          <button onClick={nextMonth} className="nav-btn"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="calendar-grid-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="day-name">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="calendar-grid">{renderCalendarDays()}</div>

      {/* Details panel */}
      <div className="selected-details">
        {selectedDay ? (
          <>
            <h3 className="details-header">
              Nutrition for {month + 1}/{selectedDay}/{year}
            </h3>
            {selectedMeals.length > 0 ? (
              <>
                {/* Daily Summary */}
                <div className="daily-summary">
                  <div className="summary-item calories">
                    <span className="summary-label">Calories</span>
                    <span className="summary-value">{selectedTotals.calories.toFixed(0)}</span>
                  </div>
                  <div className="summary-item protein">
                    <span className="summary-label">Protein</span>
                    <span className="summary-value">{selectedTotals.protein.toFixed(0)}g</span>
                  </div>
                  <div className="summary-item carbs">
                    <span className="summary-label">Carbs</span>
                    <span className="summary-value">{selectedTotals.carbs.toFixed(0)}g</span>
                  </div>
                  <div className="summary-item fat">
                    <span className="summary-label">Fat</span>
                    <span className="summary-value">{selectedTotals.fat.toFixed(0)}g</span>
                  </div>
                </div>

                {/* Meal List */}
                <div className="meal-list">
                  {selectedMeals.map((meal, index) => (
                    <div key={meal.id || index} className="meal-card">
                      <div className="meal-card-header">
                        <h4>
                          {getMealIcon(meal.meal_type)} {meal.meal_type || 'Meal'}
                          <span className="arrow">▶</span>
                        </h4>
                        <span className="meal-calories">{meal.totalCalories?.toFixed(0)} cal</span>
                      </div>

                      {meal.foods && meal.foods.length > 0 && (
                        <div className="meal-foods">
                          <p className="meal-meta">
                            {meal.foods.length} food item{meal.foods.length !== 1 ? 's' : ''}
                          </p>
                          <div className="tags">
                            {meal.foods.slice(0, 3).map((food, i) => (
                              <span key={i} className="pill">{food.food_name}</span>
                            ))}
                            {meal.foods.length > 3 && <span className="pill italic">+{meal.foods.length - 3} more</span>}
                          </div>
                        </div>
                      )}

                      <div className="meal-macros">
                        <span className="macro-badge protein">P: {meal.totalProtein?.toFixed(0)}g</span>
                        <span className="macro-badge carbs">C: {meal.totalCarbs?.toFixed(0)}g</span>
                        <span className="macro-badge fat">F: {meal.totalFat?.toFixed(0)}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="no-data">No meals logged for this day.</p>
            )}
          </>
        ) : (
          <p className="instruction">Select a date to view nutrition history</p>
        )}
      </div>
    </div>
  );
};

export default FoodCalendar;