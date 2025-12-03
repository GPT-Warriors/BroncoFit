import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import apiService from '../services/api';
import WorkoutCalendar from './WorkoutCalendar';
import './DashboardPage.css';

function DashboardPage({ user, onBack, onNavigate }) {
  // page state
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [todaysNutrition, setTodaysNutrition] = useState(null);
  const [latestWorkout, setLatestWorkout] = useState(null);
  const [recentMeasurement, setRecentMeasurement] = useState(null);
  const [tdeeData, setTdeeData] = useState(null);
  const [calendarWorkouts, setCalendarWorkouts] = useState([]);

  // load data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // fetch all data in parallel and prepare view models
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profileRes, nutritionRes, measurementRes, workoutsRes] = await Promise.allSettled([
        apiService.getProfile(),
        apiService.getTodaysNutritionSummary(),
        apiService.getLatestMeasurement(),
        apiService.getWorkouts(),
      ]);

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value);
        if (profileRes.value) {
          const tdee = await apiService.calculateTDEE(profileRes.value);
          setTdeeData(tdee);
        }
      }

      if (nutritionRes.status === 'fulfilled') setTodaysNutrition(nutritionRes.value);
      if (measurementRes.status === 'fulfilled') setRecentMeasurement(measurementRes.value);

      // build calendar items from workout history
      if (workoutsRes.status === 'fulfilled' && Array.isArray(workoutsRes.value)) {
        const rawWorkouts = workoutsRes.value;

        if (rawWorkouts.length > 0) {
          const sorted = [...rawWorkouts].sort(
            (a, b) => new Date(b.workout_date) - new Date(a.workout_date)
          );
          setLatestWorkout(sorted[0]);
        }

        const formattedForCalendar = rawWorkouts.map(w => {
          const dateObj = new Date(w.workout_date);
          const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;

          return {
            id: w.id || w._id || Math.random(),
            title: w.workout_name,
            date: dateStr,
            duration: (w.duration_minutes || 0) + ' min',
            exercises: w.exercises?.length || 0,
            details:
              w.exercises?.map(ex => {
                let detail = ex.exercise_name;
                if (ex.sets && ex.reps) detail += ` (${ex.sets}×${ex.reps})`;
                if (ex.weight_kg) detail += ` @ ${(ex.weight_kg * 2.20462).toFixed(1)}lbs`;
                return detail;
              }) || [],
          };
        });
        setCalendarWorkouts(formattedForCalendar);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // unit helper
  const kgToLbs = (kg) => (kg * 2.20462).toFixed(1);

  // loading view
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

  return (
    <div className="dashboard-page">
      <button className="back-button" onClick={onBack}>← Back</button>

      {/* header */}
      <div className="dashboard-header">
        <div className="welcome-message">
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Champion'}! 💪</h1>
          <p>Let&apos;s crush your fitness goals today</p>
        </div>
        <div className="quick-actions">
          <button className="quick-action-btn primary" onClick={() => onNavigate('workout-log')}>
            <span className="btn-icon">🏋️</span> Log Workout
          </button>
          <button className="quick-action-btn secondary" onClick={() => onNavigate('nutrition-log')}>
            <span className="btn-icon">🍽️</span> Log Meal
          </button>
          <button className="quick-action-btn tertiary" onClick={() => onNavigate('exercises')}>
            <span className="btn-icon">📚</span> Exercises
          </button>
          <button className="quick-action-btn tertiary" onClick={() => onNavigate('coach')}>
            <span className="btn-icon">🤖</span> AI Coach
          </button>
        </div>
      </div>

      {/* stats */}
      <div className="stats-grid-modern">
        <div className="stat-card weight-card">
          <div className="stat-card-header"><span className="stat-icon">⚖️</span><h3>Current Weight</h3></div>
          <div className="stat-value-large">
            {recentMeasurement ? kgToLbs(recentMeasurement.weight_kg) : profile ? kgToLbs(profile.current_weight_kg) : '---'}
            <span className="stat-unit">lbs</span>
          </div>
          <div className="stat-label">Target: {profile ? kgToLbs(profile.target_weight_kg) : '---'} lbs</div>
        </div>

        <div className="stat-card calories-card">
          <div className="stat-card-header"><span className="stat-icon">🔥</span><h3>Today&apos;s Calories</h3></div>
          <div className="stat-value-large">
            {todaysNutrition?.total_calories?.toFixed(0) || 0}
            <span className="stat-unit">kcal</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  tdeeData
                    ? Math.min(
                        ((todaysNutrition?.total_calories || 0) / tdeeData.maintenance_calories) * 100,
                        100
                      )
                    : 0
                }%`,
              }}
            ></div>
          </div>
          <div className="stat-label">Goal: {tdeeData?.maintenance_calories?.toFixed(0) || '---'} kcal</div>
        </div>

        <div className="stat-card macros-card">
          <div className="stat-card-header"><span className="stat-icon">📊</span><h3>Macros Today</h3></div>
          <div className="macros-breakdown">
            <div className="macro-item"><span className="macro-label">Protein</span><span className="macro-value">{todaysNutrition?.total_protein_g?.toFixed(0) || 0}g</span></div>
            <div className="macro-item"><span className="macro-label">Carbs</span><span className="macro-value">{todaysNutrition?.total_carbs_g?.toFixed(0) || 0}g</span></div>
            <div className="macro-item"><span className="macro-label">Fat</span><span className="macro-value">{todaysNutrition?.total_fat_g?.toFixed(0) || 0}g</span></div>
          </div>
        </div>

        <div className="stat-card workout-card">
          <div className="stat-card-header"><span className="stat-icon">💪</span><h3>Latest Workout</h3></div>
          {latestWorkout ? (
            <div className="workout-summary">
              <div className="workout-name">{latestWorkout.workout_name}</div>
              <div className="workout-details">
                {latestWorkout.exercises?.length || 0} exercises • {latestWorkout.duration_minutes || 0} min
              </div>
              <div className="workout-date">{new Date(latestWorkout.workout_date).toLocaleDateString()}</div>
            </div>
          ) : (
            <div className="no-data">
              <p>No workouts logged yet</p>
              <button className="btn-small" onClick={() => onNavigate('workout-log')}>Log Your First Workout</button>
            </div>
          )}
        </div>
      </div>

      {/* calendar */}
      <div className="calendar-section" style={{ marginTop: '32px', marginBottom: '32px' }}>
        <div className="section-header" style={{ marginBottom: '16px' }}><h2>Workout History</h2></div>
        <WorkoutCalendar workouts={calendarWorkouts} />
      </div>

      {/* recent activity */}
      <div className="activity-section">
        <div className="section-header"><h2>Recent Activity</h2><button className="view-all-btn" onClick={() => onNavigate('profile')}>View All →</button></div>
        <div className="activity-feed">
          {todaysNutrition?.meals_logged > 0 && (
            <div className="activity-item">
              <span className="activity-icon">🍽️</span>
              <div className="activity-content">
                <p className="activity-title">Logged {todaysNutrition.meals_logged} meal(s) today</p>
                <p className="activity-time">Today</p>
              </div>
            </div>
          )}
          {latestWorkout && (
            <div className="activity-item">
              <span className="activity-icon">🏋️</span>
              <div className="activity-content">
                <p className="activity-title">Completed {latestWorkout.workout_name}</p>
                <p className="activity-time">{new Date(latestWorkout.workout_date).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          {recentMeasurement && (
            <div className="activity-item">
              <span className="activity-icon">📏</span>
              <div className="activity-content">
                <p className="activity-title">Updated weight to {kgToLbs(recentMeasurement.weight_kg)} lbs</p>
                <p className="activity-time">
                  {new Date(recentMeasurement.measurement_date || recentMeasurement.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          {!todaysNutrition?.meals_logged && !latestWorkout && !recentMeasurement && (
            <div className="no-activity"><p>No recent activity. Start by logging a workout or meal!</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
