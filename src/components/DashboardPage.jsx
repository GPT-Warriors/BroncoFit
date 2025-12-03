import { useState, useEffect } from 'react';
import apiService from '../services/api';
import WorkoutCalendar from './WorkoutCalendar';
import './DashboardPage.css';

const GOAL_OFFSETS = [250, 500, 750, 1000];
const INTENSITY_LBS = [0.5, 1, 1.5, 2];

function DashboardPage({ user, onBack, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [todaysNutrition, setTodaysNutrition] = useState(null);
  const [latestWorkout, setLatestWorkout] = useState(null);
  const [recentMeasurement, setRecentMeasurement] = useState(null);
  const [tdeeData, setTdeeData] = useState(null);
  const [calendarWorkouts, setCalendarWorkouts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const kgToLbs = (kg) => (kg ? (kg * 2.20462).toFixed(1) : '---');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profileRes, nutritionRes] = await Promise.allSettled([
        apiService.getProfile(),
        apiService.getTodaysNutritionSummary(),
      ]);

      const measurementsRes = await apiService.getMeasurements(1);
      const latestMeas = measurementsRes && measurementsRes.length > 0 ? measurementsRes[0] : null;
      setRecentMeasurement(latestMeas);

      // Handle Profile
      let currentProfile = null;
      if (profileRes.status === 'fulfilled') {
        currentProfile = profileRes.value;
        setProfile(currentProfile);
      }

      if (currentProfile) {
        // Use measurement weight if available, otherwise profile weight
        const weightForCalc = latestMeas?.weight_kg || currentProfile.current_weight_kg;

        try {
          const tdee = await apiService.calculateTDEE({
            age: currentProfile.age,
            sex: currentProfile.sex,
            height_cm: currentProfile.height_cm,
            weight_kg: weightForCalc, // <--- FIXED: Uses measured weight
            activity_level: currentProfile.activity_level,
          });
          setTdeeData(tdee);
        } catch (err) {
          console.warn("Failed to calc TDEE:", err);
        }
      }

      // Handle Nutrition
      if (nutritionRes.status === 'fulfilled') {
        setTodaysNutrition(nutritionRes.value);
      }

      // 4. Handle Workouts (Calendar + Latest)
      const workoutsRes = await apiService.getWorkouts(100, 0); // Fetch enough for calendar
      
      let rawWorkouts = [];
      if (workoutsRes && Array.isArray(workoutsRes)) {
        rawWorkouts = workoutsRes;
      }

      // Determine Latest Workout (Sort by date descending)
      if (rawWorkouts.length > 0) {
        const sorted = [...rawWorkouts].sort(
          (a, b) => new Date(b.workout_date) - new Date(a.workout_date)
        );
        setLatestWorkout(sorted[0]);
      }

      // Format for Calendar
      const formattedForCalendar = rawWorkouts.map((w) => {
        const d = new Date(w.workout_date);
        const mmddyyyy = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

        return {
          id: w.id || w._id || Math.random(),
          title: w.workout_name,
          date: mmddyyyy,
          duration: (w.duration_minutes || 0) + ' min',
          exercises: w.exercises?.length || 0,
          details: w.exercises?.map((ex) => {
              let str = ex.exercise_name || "Exercise";
              if (ex.sets && ex.reps) str += ` (${ex.sets}×${ex.reps})`;
              return str;
            }) || [],
        };
      });

      setCalendarWorkouts(formattedForCalendar);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // --- Logic for Goal-Based TDEE Display ---
  let targetCalories = tdeeData?.maintenance_calories || 0;
  let goalLabel = "Maintenance";

  if (profile && tdeeData) {
    const goal = (profile.fitness_goal || 'maintain').toLowerCase();
    const maintenance = tdeeData.maintenance_calories;
    const intensityIndex =
      typeof profile.goal_intensity === 'number' ? profile.goal_intensity : 1;
    const offset = GOAL_OFFSETS[intensityIndex] || 0;
    const intensityLbs = INTENSITY_LBS[intensityIndex] || 1;

    if (goal.includes('lose') || goal.includes('cut')) {
      targetCalories =
        profile.target_calories ||
        (maintenance ? Math.round(maintenance - offset) : tdeeData.weight_loss_calories);
      goalLabel = `Cut • ${intensityLbs} lb/week`;
    } else if (goal.includes('gain') || goal.includes('bulk') || goal.includes('muscle')) {
      targetCalories =
        profile.target_calories ||
        (maintenance ? Math.round(maintenance + offset) : tdeeData.weight_gain_calories);
      goalLabel = `Bulk • ${intensityLbs} lb/week`;
    } else {
      targetCalories = profile.target_calories || maintenance || tdeeData.maintenance_calories;
      goalLabel = "Maintenance";
    }
  }

  if (!targetCalories && tdeeData?.maintenance_calories) {
      targetCalories = tdeeData.maintenance_calories;
      goalLabel = "Maintenance";
  }

  const displayWeight = recentMeasurement?.weight_kg || profile?.current_weight_kg;
  const currentWeightLbs = kgToLbs(displayWeight);
  const targetWeightLbs = kgToLbs(profile?.target_weight_kg);

  const consumed = todaysNutrition?.total_calories ?? 0;
  const progressMax = targetCalories || tdeeData?.maintenance_calories || 2000;

  let remainingText = 'Remaining: ---';
  if (targetCalories) {
    const diff = Math.round(targetCalories - consumed);
    if (diff >= 0) {
      remainingText = `Remaining: ${diff} kcal`;
    } else {
      remainingText = `Exceeding by ${Math.abs(diff)} kcal`;
    }
  }

  return (
    <div className="dashboard-page">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      {/* Header */}
      <div className="dashboard-header">
        <div className="welcome-message">
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Champion'}! 💪</h1>
          <p>Let&apos;s crush your fitness goals today</p>
        </div>
        <div className="quick-actions">
          <button className="quick-action-btn primary" onClick={() => onNavigate('workout-log')}>
            <span className="btn-icon">🏋️</span>
            Log Workout
          </button>
          <button className="quick-action-btn secondary" onClick={() => onNavigate('nutrition-log')}>
            <span className="btn-icon">🍽️</span>
            Log Meal
          </button>
          <button className="quick-action-btn tertiary" onClick={() => onNavigate('exercises')}>
            <span className="btn-icon">📚</span>
            Exercises
          </button>
          <button className="quick-action-btn tertiary" onClick={() => onNavigate('coach')}>
            <span className="btn-icon">🤖</span>
            AI Coach
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid-modern">
        {/* Current Weight Card */}
        <div className="stat-card weight-card">
          <div className="stat-card-header">
            <span className="stat-icon">⚖️</span>
            <h3>Current Weight</h3>
          </div>
          <div className="stat-value-large">
            {currentWeightLbs}
            <span className="stat-unit">{currentWeightLbs !== '---' ? 'lbs' : ''}</span>
          </div>
          <div className="stat-label">
            Target: {targetWeightLbs} {targetWeightLbs !== '---' ? 'lbs' : ''}
          </div>
        </div>

        {/* Calories Card */}
        <div className="stat-card calories-card">
          <div className="stat-card-header">
            <span className="stat-icon">🔥</span>
            <h3>Today&apos;s Calories</h3>
          </div>
          <div className="stat-value-large">
            {(todaysNutrition?.total_calories ?? 0).toFixed(0)}
            <span className="stat-unit">kcal</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min((consumed / progressMax) * 100, 100)}%`,
                backgroundColor: consumed > progressMax ? '#ff4d4d' : undefined
              }}
            ></div>
          </div>
          <div className="stat-label">
            {remainingText}
          </div>
        </div>

        {/* Macros Card */}
        <div className="stat-card macros-card">
          <div className="stat-card-header">
            <span className="stat-icon">📊</span>
            <h3>Macros Today</h3>
          </div>
          <div className="macros-breakdown">
            <div className="macro-item">
              <span className="macro-label">Protein</span>
              <span className="macro-value">
                {todaysNutrition?.total_protein_g?.toFixed(0) || 0}g
              </span>
            </div>
            <div className="macro-item">
              <span className="macro-label">Carbs</span>
              <span className="macro-value">
                {todaysNutrition?.total_carbs_g?.toFixed(0) || 0}g
              </span>
            </div>
            <div className="macro-item">
              <span className="macro-label">Fat</span>
              <span className="macro-value">
                {todaysNutrition?.total_fat_g?.toFixed(0) || 0}g
              </span>
            </div>
          </div>
        </div>

        {/* TDEE / Goal Card - FIXED DISPLAY */}
        <div className="stat-card workout-card">
          <div className="stat-card-header">
            <span className="stat-icon">🎯</span>
            <h3>Daily Target</h3>
          </div>
          {tdeeData ? (
            <div className="tdee-summary single-goal">
               <div className="stat-value-large">
                {targetCalories ? Math.round(targetCalories) : '---'}
                <span className="stat-unit">kcal</span>
              </div>
              <div className="stat-label">
                Goal: {goalLabel}
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>TDEE not available</p>
              <button className="btn-small" onClick={() => onNavigate('profile')}>
                Update Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Workout History Calendar */}
      <div className="calendar-section" style={{ marginTop: '32px', marginBottom: '32px' }}>
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <h2>Workout History</h2>
        </div>
        <WorkoutCalendar workouts={calendarWorkouts} />
      </div>

      {/* Activity Section */}
      <div className="activity-section">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <button className="view-all-btn" onClick={() => onNavigate('profile')}>
            View All →
          </button>
        </div>

        <div className="activity-feed">
          {todaysNutrition?.meals_logged > 0 && (
            <div className="activity-item">
              <span className="activity-icon">🍽️</span>
              <div className="activity-content">
                <p className="activity-title">
                  Logged {todaysNutrition.meals_logged} meal(s) today
                </p>
                <p className="activity-time">Today</p>
              </div>
            </div>
          )}

          {latestWorkout && (
            <div className="activity-item">
              <span className="activity-icon">🏋️</span>
              <div className="activity-content">
                <p className="activity-title">Completed {latestWorkout.workout_name}</p>
                <p className="activity-time">
                  {new Date(latestWorkout.workout_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {recentMeasurement && (
            <div className="activity-item">
              <span className="activity-icon">📏</span>
              <div className="activity-content">
                <p className="activity-title">
                  Updated weight to {kgToLbs(recentMeasurement.weight_kg)} lbs
                </p>
                <p className="activity-time">
                  {new Date(
                    recentMeasurement.measurement_date || recentMeasurement.created_at
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {!todaysNutrition?.meals_logged && !latestWorkout && !recentMeasurement && (
            <div className="no-activity">
              <p>No recent activity. Start by logging a workout or meal!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
