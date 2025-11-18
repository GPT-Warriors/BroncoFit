import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import apiService from '../services/api';
import './StatsPage.css';

function StatsPage({ user, onBack }) {
  const [profile, setProfile] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weight'); // weight, workouts, nutrition, prs
  const [tdeeData, setTdeeData] = useState(null);
  const [expandedWorkouts, setExpandedWorkouts] = useState({});

  const kgToLbs = (kg) => (kg * 2.20462).toFixed(1);
  const cmToFeetInches = (cm) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);

      const [profileData, measurementData, workoutData, mealData] = await Promise.all([
        apiService.getProfile(),
        apiService.getMeasurements(30),
        apiService.getWorkouts(20),
        apiService.getMeals(30)
      ]);

      setProfile(profileData);
      setMeasurements(measurementData || []);
      setWorkouts(workoutData || []);
      setMeals(mealData || []);

      // Calculate TDEE
      if (profileData) {
        const tdee = await apiService.calculateTDEE({
          age: profileData.age,
          sex: profileData.sex,
          height_cm: profileData.height_cm,
          weight_kg: measurementData?.[0]?.weight_kg || profileData.current_weight_kg,
          activity_level: profileData.activity_level,
        });
        setTdeeData(tdee);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare weight chart data
  const weightChartData = measurements
    .slice()
    .reverse()
    .map(m => ({
      date: new Date(m.measurement_date || m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: parseFloat(kgToLbs(m.weight_kg)),
      target: parseFloat(kgToLbs(profile?.target_weight_kg || 0))
    }));

  // Prepare nutrition chart data (last 7 days)
  const nutritionChartData = meals
    .reduce((acc, meal) => {
      const date = new Date(meal.meal_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = acc.find(d => d.date === date);

      if (existing) {
        existing.calories += meal.total_calories;
        existing.protein += meal.total_protein_g;
        existing.carbs += meal.total_carbs_g;
        existing.fat += meal.total_fat_g;
      } else {
        acc.push({
          date,
          calories: meal.total_calories,
          protein: meal.total_protein_g,
          carbs: meal.total_carbs_g,
          fat: meal.total_fat_g
        });
      }
      return acc;
    }, [])
    .slice(0, 7)
    .reverse();

  // Calculate PRs from workouts
  const calculatePRs = () => {
    const prs = {};

    workouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        if (exercise.exercise_type === 'strength' && exercise.weight_kg) {
          const key = exercise.exercise_name.toLowerCase();
          const weightLbs = parseFloat(kgToLbs(exercise.weight_kg));

          if (!prs[key] || weightLbs > prs[key].weight) {
            prs[key] = {
              name: exercise.exercise_name,
              weight: weightLbs,
              reps: exercise.reps,
              date: workout.workout_date
            };
          }
        }
      });
    });

    return Object.values(prs).sort((a, b) => b.weight - a.weight).slice(0, 10);
  };

  const personalRecords = calculatePRs();

  if (loading) {
    return (
      <div className="stats-page">
        <div className="stats-loading">
          <div className="loading-spinner"></div>
          <p>Loading your stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-page">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      {/* Header */}
      <div className="stats-header">
        <h1>📊 Your Stats</h1>
        <p>Track your progress and achievements</p>
      </div>

      {/* Profile Summary */}
      <div className="profile-summary-card">
        <div className="summary-item">
          <span className="summary-label">Height</span>
          <span className="summary-value">{profile ? cmToFeetInches(profile.height_cm) : '---'}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Current Weight</span>
          <span className="summary-value">{measurements[0] ? kgToLbs(measurements[0].weight_kg) : profile ? kgToLbs(profile.current_weight_kg) : '---'} lbs</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Target Weight</span>
          <span className="summary-value">{profile ? kgToLbs(profile.target_weight_kg) : '---'} lbs</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">TDEE</span>
          <span className="summary-value">{tdeeData ? tdeeData.maintenance_calories.toFixed(0) : '---'} cal</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="stats-tabs">
        <button
          className={`tab-btn ${activeTab === 'weight' ? 'active' : ''}`}
          onClick={() => setActiveTab('weight')}
        >
          ⚖️ Weight
        </button>
        <button
          className={`tab-btn ${activeTab === 'workouts' ? 'active' : ''}`}
          onClick={() => setActiveTab('workouts')}
        >
          💪 Workouts
        </button>
        <button
          className={`tab-btn ${activeTab === 'nutrition' ? 'active' : ''}`}
          onClick={() => setActiveTab('nutrition')}
        >
          🍽️ Nutrition
        </button>
        <button
          className={`tab-btn ${activeTab === 'prs' ? 'active' : ''}`}
          onClick={() => setActiveTab('prs')}
        >
          🏆 PRs
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'weight' && (
          <div className="weight-tab">
            <h2>Weight Progress</h2>
            {weightChartData.length > 0 ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#b0b0b0" />
                    <YAxis stroke="#b0b0b0" />
                    <Tooltip
                      contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke="#00FF6A" strokeWidth={3} dot={{ fill: '#00FF6A', r: 5 }} name="Current Weight (lbs)" />
                    <Line type="monotone" dataKey="target" stroke="#EEC97D" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target Weight (lbs)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="no-data">
                <p>No weight measurements yet. Start tracking your progress!</p>
              </div>
            )}

            {/* Recent Measurements */}
            <div className="measurements-list">
              <h3>Recent Measurements</h3>
              {measurements.slice(0, 5).map((m, i) => (
                <div key={i} className="measurement-item">
                  <span className="measurement-date">
                    {new Date(m.measurement_date || m.created_at).toLocaleDateString()}
                  </span>
                  <span className="measurement-weight">{kgToLbs(m.weight_kg)} lbs</span>
                  {m.notes && <span className="measurement-notes">{m.notes}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'workouts' && (
          <div className="workouts-tab">
            <h2>Workout History</h2>
            {workouts.length > 0 ? (
              <div className="workout-timeline">
                {workouts.map((workout, i) => {
                  const workoutId = workout.id || `workout-${i}`;
                  const isExpanded = expandedWorkouts[workoutId];

                  return (
                    <div key={i} className={`workout-item ${isExpanded ? 'expanded' : ''}`}>
                      <div
                        className="workout-header-clickable"
                        onClick={() => setExpandedWorkouts(prev => ({
                          ...prev,
                          [workoutId]: !prev[workoutId]
                        }))}
                      >
                        <div className="workout-header">
                          <h4>{workout.workout_name}</h4>
                          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                        </div>
                        <span className="workout-date">
                          {new Date(workout.workout_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="workout-details">
                        <span>{workout.exercises?.length || 0} exercises</span>
                        {workout.duration_minutes && <span>• {workout.duration_minutes} min</span>}
                      </div>

                      {isExpanded ? (
                        <div className="workout-exercises-expanded">
                          {workout.exercises?.map((ex, j) => (
                            <div key={j} className="exercise-detail-item">
                              <div className="exercise-detail-header">
                                <span className="exercise-number">{j + 1}</span>
                                <span className="exercise-name">{ex.exercise_name}</span>
                                <span className={`exercise-type-badge ${ex.exercise_type}`}>
                                  {ex.exercise_type}
                                </span>
                              </div>
                              <div className="exercise-stats">
                                {ex.sets && ex.reps && (
                                  <span className="stat">{ex.sets} sets × {ex.reps} reps</span>
                                )}
                                {ex.weight_kg && (
                                  <span className="stat weight">@ {kgToLbs(ex.weight_kg)} lbs</span>
                                )}
                                {ex.duration_minutes && (
                                  <span className="stat">{ex.duration_minutes} min</span>
                                )}
                              </div>
                              {ex.notes && <div className="exercise-notes">{ex.notes}</div>}
                            </div>
                          ))}
                          {workout.notes && (
                            <div className="workout-notes-section">
                              <strong>Notes:</strong> {workout.notes}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="workout-exercises">
                          {workout.exercises?.slice(0, 3).map((ex, j) => (
                            <div key={j} className="exercise-pill">
                              {ex.exercise_name}
                              {ex.sets && ex.reps && ` (${ex.sets}x${ex.reps})`}
                              {ex.weight_kg && ` @ ${kgToLbs(ex.weight_kg)}lbs`}
                            </div>
                          ))}
                          {workout.exercises?.length > 3 && (
                            <span className="more-exercises">Click to see all {workout.exercises.length} exercises</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data">
                <p>No workouts logged yet. Start tracking your training!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="nutrition-tab">
            <h2>Nutrition Analytics</h2>
            {nutritionChartData.length > 0 ? (
              <>
                <div className="chart-container">
                  <h3>Daily Calories</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={nutritionChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="#b0b0b0" />
                      <YAxis stroke="#b0b0b0" />
                      <Tooltip
                        contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="calories" fill="#00FF6A" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-container">
                  <h3>Macronutrients Breakdown</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={nutritionChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="#b0b0b0" />
                      <YAxis stroke="#b0b0b0" />
                      <Tooltip
                        contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="protein" stroke="#FF6B9D" strokeWidth={2} name="Protein (g)" />
                      <Line type="monotone" dataKey="carbs" stroke="#4ECDC4" strokeWidth={2} name="Carbs (g)" />
                      <Line type="monotone" dataKey="fat" stroke="#FFE66D" strokeWidth={2} name="Fat (g)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="no-data">
                <p>No nutrition data yet. Start logging your meals!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'prs' && (
          <div className="prs-tab">
            <h2>Personal Records</h2>
            {personalRecords.length > 0 ? (
              <div className="prs-grid">
                {personalRecords.map((pr, i) => (
                  <div key={i} className="pr-card">
                    <div className="pr-rank">#{i + 1}</div>
                    <h4>{pr.name}</h4>
                    <div className="pr-weight">{pr.weight} lbs</div>
                    {pr.reps && <div className="pr-reps">{pr.reps} reps</div>}
                    <div className="pr-date">
                      {new Date(pr.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No personal records yet. Keep lifting to set new PRs!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsPage;
