import { useState, useEffect } from 'react';
import apiService from '../services/api';
import WorkoutCalendar from './WorkoutCalendar';
import './DashboardPage.css';

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
      const [
        profileRes,
        nutritionRes,
        measurementRes,
        latestWorkoutRes,
        workoutsRes,
      ] = await Promise.allSettled([
        apiService.getProfile(),
        apiService.getTodaysNutritionSummary(),
        apiService.getLatestMeasurement(),
        apiService.getLatestWorkout(),
        apiService.getWorkouts(100, 0), 
      ]);

      // --- HANDLE PROFILE & TDEE ---
      if (profileRes.status === 'fulfilled' && profileRes.value) {
        const p = profileRes.value;
        setProfile(p);

        // Calculate TDEE if we have enough data
        if (p.current_weight_kg && p.height_cm && p.age && p.sex && p.activity_level) {
            try {
                const tdee = await apiService.calculateTDEE({
                    age: p.age,
                    sex: p.sex,
                    height_cm: p.height_cm,
                    weight_kg: p.current_weight_kg,
                    activity_level: p.activity_level,
                });
                setTdeeData(tdee);
            } catch (err) {
                console.warn("Failed to calc TDEE:", err);
            }
        }
      }

      // --- HANDLE NUTRITION ---
      if (nutritionRes.status === 'fulfilled') {
        setTodaysNutrition(nutritionRes.value);
      }

      // --- HANDLE MEASUREMENT ---
      if (measurementRes.status === 'fulfilled') {
        setRecentMeasurement(measurementRes.value);
      }

      // --- HANDLE WORKOUTS ---
      let rawWorkouts = [];
      if (workoutsRes.status === 'fulfilled' && Array.isArray(workoutsRes.value)) {
        rawWorkouts = workoutsRes.value;
      }

      // Determine Latest Workout
      let finalLatest = null;
      if (latestWorkoutRes.status === 'fulfilled' && latestWorkoutRes.value) {
        finalLatest = latestWorkoutRes.value;
      } else if (rawWorkouts.length > 0) {
        // Sort descending by date
        const sorted = [...rawWorkouts].sort(
          (a, b) => new Date(b.workout_date) - new Date(a.workout_date)
        );
        finalLatest = sorted[0];
      }
      setLatestWorkout(finalLatest);

      const formattedForCalendar = rawWorkouts.map((w) => {
        // Handle potentially different date formats (ISO string vs Date object)
        const d = new Date(w.workout_date);
        
        // Format as MM/DD/YYYY
        const mmddyyyy = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

        return {
          id: w.id || w._id || Math.random(), 
          title: w.workout_name,
          date: mmddyyyy, 
          duration: (w.duration_minutes || 0) + ' min',
          exercises: w.exercises?.length || 0,
          // Create simple string details for the popup
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

  const currentWeightLbs = kgToLbs(recentMeasurement?.weight_kg || profile?.current_weight_kg);
  const targetWeightLbs = kgToLbs(profile?.target_weight_kg);

  const consumed = todaysNutrition?.total_calories ?? 0;
  const maintenance = tdeeData?.maintenance_calories ?? 0;
  const remainingCalories = maintenance
    ? Math.max(0, Math.round(maintenance - consumed))
    : null;

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
                width: `${
                  maintenance
                    ? Math.min((consumed / maintenance) * 100, 100)
                    : 0
                }%`,
              }}
            ></div>
          </div>
          <div className="stat-label">
            Remaining: {maintenance ? remainingCalories : '---'} kcal
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

        {/* TDEE Card */}
        <div className="stat-card workout-card">
          <div className="stat-card-header">
            <span className="stat-icon">📈</span>
            <h3>TDEE</h3>
          </div>
          {tdeeData ? (
            <div className="tdee-summary">
              <div className="tdee-row">
                <span className="tdee-label">Maintenance</span>
                <span className="tdee-value">
                  {Math.round(tdeeData.maintenance_calories)}
                </span>
              </div>
              <div className="tdee-row">
                <span className="tdee-label">Cut</span>
                <span className="tdee-value">
                  {Math.round(tdeeData.weight_loss_calories)}
                </span>
              </div>
              <div className="tdee-row">
                <span className="tdee-label">Bulk</span>
                <span className="tdee-value">
                  {Math.round(tdeeData.weight_gain_calories)}
                </span>
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