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

  const kgToLbs = (kg) => {
    const n = Number(kg);
    return Number.isFinite(n) ? (n * 2.20462).toFixed(1) : '---';
  };

  const coerceNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Normalize measurement from backend
  const normalizeMeasurement = (m) => {
    if (!m) return null;
    return {
      weight_kg: m.weight_kg ?? m.weight ?? m.body_weight_kg ?? null,
      measurement_date: m.measurement_date ?? m.date ?? m.created_at ?? null,
    };
  };

  // Normalize nutrition summary
  const normalizeNutrition = (n) => {
    if (!n) return null;

    // Some backends return {total_*}, others {calories, protein_g, ...}, others nest under .today or .summary
    const src =
      n.summary ??
      n.today ??
      n;

    const total_calories =
      coerceNum(src.total_calories ?? src.calories ?? src.kcal ?? 0);

    const total_protein_g =
      coerceNum(src.total_protein_g ?? src.protein_g ?? src.protein ?? 0);

    const total_carbs_g =
      coerceNum(src.total_carbs_g ?? src.carbs_g ?? src.carbs ?? 0);

    const total_fat_g =
      coerceNum(src.total_fat_g ?? src.fat_g ?? src.fat ?? 0);

    const meals_logged = coerceNum(
      src.meals_logged ??
        src.meal_count ??
        (Array.isArray(src.meals) ? src.meals.length : 0)
    );

    return {
      total_calories,
      total_protein_g,
      total_carbs_g,
      total_fat_g,
      meals_logged,
    };
  };

  // Normalize workout
  const normalizeWorkout = (w) => {
    if (!w) return null;
    const dateRaw =
      w.workout_date ?? w.date ?? w.started_at ?? w.created_at ?? null;

    // Accept different name keys
    const name =
      w.workout_name ?? w.name ?? w.title ?? 'Workout';

    const duration =
      coerceNum(w.duration_minutes ?? w.duration ?? w.length_minutes ?? 0);

    const exercises = Array.isArray(w.exercises)
      ? w.exercises
      : Array.isArray(w.movements)
      ? w.movements
      : [];

    return {
      id: w.id ?? w._id ?? Math.random(),
      workout_name: name,
      workout_date: dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString(),
      duration_minutes: duration,
      exercises,
    };
  };

  // Map a normalized workout to your calendar event shape
  const toCalendarEvent = (w) => {
    const d = new Date(w.workout_date);
    const date = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    return {
      id: w.id,
      title: w.workout_name,
      date,
      duration: `${w.duration_minutes || 0} min`,
      exercises: w.exercises?.length || 0,
      details:
        w.exercises?.map((ex) => {
          const n = ex.exercise_name ?? ex.name ?? ex.title ?? 'Exercise';
          const sets = ex.sets ?? ex.num_sets;
          const reps = ex.reps ?? ex.num_reps;
          const weightKg = ex.weight_kg ?? ex.weight ?? null;
          let s = n;
          if (sets && reps) s += ` (${sets}×${reps})`;
          if (weightKg) s += ` @ ${(Number(weightKg) * 2.20462).toFixed(1)}lbs`;
          return s;
        }) ?? [],
    };
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const getLatestWorkoutSafe =
        typeof apiService.getLatestWorkout === 'function'
          ? apiService.getLatestWorkout()
          : Promise.resolve(null);

      const getWorkoutsSafe =
        typeof apiService.getWorkouts === 'function'
          ? apiService.getWorkouts()
          : Promise.resolve([]);

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
        getLatestWorkoutSafe,
        getWorkoutsSafe,
      ]);

      if (profileRes.status === 'fulfilled') {
        const prof = profileRes.value || null;
        setProfile(prof);
        if (prof) {
          try {
            const tdee = await apiService.calculateTDEE(prof);
            setTdeeData(tdee || null);
          } catch {
            setTdeeData(null);
          }
        }
      }

      if (nutritionRes.status === 'fulfilled') {
        setTodaysNutrition(normalizeNutrition(nutritionRes.value));
      }

      if (measurementRes.status === 'fulfilled') {
        setRecentMeasurement(normalizeMeasurement(measurementRes.value));
      }

      let latestW = null;

      if (latestWorkoutRes.status === 'fulfilled' && latestWorkoutRes.value) {
        latestW = normalizeWorkout(latestWorkoutRes.value);
      }

      let list = [];
      if (workoutsRes.status === 'fulfilled' && Array.isArray(workoutsRes.value)) {
        list = workoutsRes.value.map(normalizeWorkout).filter(Boolean);

        if (!latestW && list.length > 0) {
          list.sort((a, b) => new Date(b.workout_date) - new Date(a.workout_date));
          latestW = list[0];
        }

        setCalendarWorkouts(list.map(toCalendarEvent));
      }

      setLatestWorkout(latestW);
    } catch (e) {
      console.error('Error loading dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const currentWeightLbs =
    recentMeasurement?.weight_kg != null
      ? kgToLbs(recentMeasurement.weight_kg)
      : profile?.current_weight_kg != null
      ? kgToLbs(profile.current_weight_kg)
      : '---';

  const targetWeightLbs =
    profile?.target_weight_kg != null ? kgToLbs(profile.target_weight_kg) : '---';

  const caloriesNow = todaysNutrition?.total_calories ?? 0;
  const tdeeGoal = tdeeData?.maintenance_calories ?? 0;
  const progressPct = tdeeGoal ? Math.min((caloriesNow / tdeeGoal) * 100, 100) : 0;

  return (
    <div className="dashboard-page">
      <button className="back-button" onClick={onBack}>← Back</button>

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

      <div className="stats-grid-modern">
        <div className="stat-card weight-card">
          <div className="stat-card-header">
            <span className="stat-icon">⚖️</span>
            <h3>Current Weight</h3>
          </div>
          <div className="stat-value-large">
            <span className="stat-number">{currentWeightLbs}</span>
            <span className="stat-unit">lbs</span>
          </div>
          <div className="stat-label">Target: {targetWeightLbs} lbs</div>
        </div>

        <div className="stat-card calories-card">
          <div className="stat-card-header">
            <span className="stat-icon">🔥</span>
            <h3>Today&apos;s Calories</h3>
          </div>
          <div className="stat-value-large">
            {Math.round(caloriesNow)}
            <span className="stat-unit">kcal</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="stat-label">
            Goal: {tdeeGoal ? Math.round(tdeeGoal) : '---'} kcal
          </div>
        </div>

        <div className="stat-card macros-card">
          <div className="stat-card-header">
            <span className="stat-icon">📊</span>
            <h3>Macros Today</h3>
          </div>
          <div className="macros-breakdown">
            <div className="macro-item">
              <span className="macro-label">Protein</span>
              <span className="macro-value">{Math.round(todaysNutrition?.total_protein_g ?? 0)}g</span>
            </div>
            <div className="macro-item">
              <span className="macro-label">Carbs</span>
              <span className="macro-value">{Math.round(todaysNutrition?.total_carbs_g ?? 0)}g</span>
            </div>
            <div className="macro-item">
              <span className="macro-label">Fat</span>
              <span className="macro-value">{Math.round(todaysNutrition?.total_fat_g ?? 0)}g</span>
            </div>
          </div>
        </div>

        <div className="stat-card workout-card">
          <div className="stat-card-header">
            <span className="stat-icon">💪</span>
            <h3>Latest Workout</h3>
          </div>
          {latestWorkout ? (
            <div className="workout-summary">
              <div className="workout-name">{latestWorkout.workout_name}</div>
              <div className="workout-details">
                {latestWorkout.exercises?.length || 0} exercises • {latestWorkout.duration_minutes || 0} min
              </div>
              <div className="workout-date">
                {new Date(latestWorkout.workout_date).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="no-data">
              <p>No workouts logged yet</p>
              <button className="btn-small" onClick={() => onNavigate('workout-log')}>
                Log Your First Workout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="calendar-section" style={{ marginTop: '32px', marginBottom: '32px' }}>
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <h2>Workout History</h2>
        </div>
        <WorkoutCalendar workouts={calendarWorkouts} />
      </div>

      <div className="activity-section">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <button className="view-all-btn" onClick={() => onNavigate('profile')}>View All →</button>
        </div>
        <div className="activity-feed">
          {(todaysNutrition?.meals_logged ?? 0) > 0 && (
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
                <p className="activity-time">
                  {new Date(latestWorkout.workout_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {recentMeasurement?.weight_kg != null && (
            <div className="activity-item">
              <span className="activity-icon">📏</span>
              <div className="activity-content">
                <p className="activity-title">
                  Updated weight to {kgToLbs(recentMeasurement.weight_kg)} lbs
                </p>
                <p className="activity-time">
                  {new Date(
                    recentMeasurement.measurement_date ?? new Date()
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {!((todaysNutrition?.meals_logged ?? 0) > 0) && !latestWorkout && !(recentMeasurement?.weight_kg != null) && (
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
