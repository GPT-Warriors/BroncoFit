// StatsPage.jsx
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import apiService from '../services/api';
import './StatsPage.css';

function StatsPage({ onBack }) {
  const [profile, setProfile] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [tdeeData, setTdeeData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weight');
  const [expandedWorkouts, setExpandedWorkouts] = useState({});

  const [newWeight, setNewWeight] = useState('');

  const [editGoal, setEditGoal] = useState('maintain');
  const [editActivity, setEditActivity] = useState('moderate');

  const kgToLbs = (kg) => (kg * 2.20462).toFixed(1);
  const lbsToKg = (lbs) => lbs / 2.20462;

  const cmToFeetInches = (cm) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (profile) {
      setEditGoal(profile.fitness_goal || 'maintain');
      setEditActivity(profile.activity_level || 'moderate');
    }
  }, [profile]);

  // Loads profile, measurements, workouts, meals and calculates TDEE
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [profileRes, measurementRes, workoutRes, mealRes] = await Promise.all([
        apiService.getProfile(),
        apiService.getMeasurements(30),
        apiService.getWorkouts(20),
        apiService.getMeals(30)
      ]);

      setProfile(profileRes);
      setMeasurements(measurementRes || []);
      setWorkouts(workoutRes || []);
      setMeals(mealRes || []);

      if (profileRes) {
        await runCalculation(profileRes, measurementRes);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculates TDEE using profile and measurement data
  const runCalculation = async (profileData, measurementsData) => {
    const weightForCalc = measurementsData?.[0]?.weight_kg || profileData.current_weight_kg;

    try {
      const tdee = await apiService.calculateTDEE({
        age: profileData.age,
        sex: profileData.sex,
        height_cm: profileData.height_cm,
        weight_kg: weightForCalc,
        activity_level: profileData.activity_level
      });
      setTdeeData(tdee);
    } catch (error) {
      console.warn('TDEE Calc failed:', error);
    }
  };

  // Handles saving a new weight entry
  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!newWeight) return;

    try {
      const weightKg = lbsToKg(parseFloat(newWeight));
      await apiService.addMeasurement({
        weight_kg: weightKg,
        measurement_date: new Date().toISOString(),
        notes: 'Manual entry from Stats'
      });

      setNewWeight('');
      await loadAllData();
    } catch (error) {
      alert('Failed to save weight.');
    }
  };

  // Handles updating profile goal and activity level
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updatedProfile = await apiService.updateProfile({
        fitness_goal: editGoal,
        activity_level: editActivity
      });

      setProfile(updatedProfile);

      const profileForCalc = { ...updatedProfile, activity_level: editActivity };
      await runCalculation(profileForCalc, measurements);
    } catch (error) {
      console.error('Update failed', error);
      alert('Failed to update profile. Check activity level inputs.');
    }
  };

  const weightChartData = measurements
    .slice()
    .reverse()
    .map((m) => ({
      date: new Date(m.measurement_date || m.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      weight: parseFloat(kgToLbs(m.weight_kg)),
      target: parseFloat(kgToLbs(profile?.target_weight_kg || 0))
    }));

  const nutritionChartData = meals
    .reduce((acc, meal) => {
      const date = new Date(meal.meal_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      const existing = acc.find((d) => d.date === date);
      if (existing) {
        existing.calories += meal.total_calories;
      } else {
        acc.push({ date, calories: meal.total_calories });
      }
      return acc;
    }, [])
    .slice(0, 7)
    .reverse();

  let goalCalories = 0;
  let goalLabel = 'Target';

  if (profile && tdeeData) {
    const goal = (profile.fitness_goal || 'maintain').toLowerCase();
    if (goal.includes('lose') || goal.includes('cut')) {
      goalCalories = tdeeData.weight_loss_calories;
      goalLabel = 'Target (Cut)';
    } else if (goal.includes('gain') || goal.includes('bulk') || goal.includes('muscle')) {
      goalCalories = tdeeData.weight_gain_calories;
      goalLabel = 'Target (Bulk)';
    } else {
      goalCalories = tdeeData.maintenance_calories;
      goalLabel = 'Target (Maintain)';
    }
  }

  // Uses maintenance calories if no other target is set
  if (!goalCalories && tdeeData?.maintenance_calories) {
    goalCalories = tdeeData.maintenance_calories;
  }

  if (loading) {
    return (
      <div className="stats-page">
        <div className="stats-loading">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-page">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="stats-header">
        <h1>📊 Your Stats</h1>
        <p>Track your progress and achievements</p>
      </div>

      <div className="profile-summary-card">
        <div className="summary-control-panel">
          <div className="summary-control-header">
            <h3>Log Current Weight</h3>
            <p>Update today&apos;s weight and fine-tune your goals.</p>
          </div>

          <form className="quick-form quick-form-weight" onSubmit={handleAddWeight}>
            <div className="quick-form-group">
              <label htmlFor="weight-input-top">Weight (lbs)</label>
              <input
                id="weight-input-top"
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="e.g. 165.5"
              />
            </div>
            <div className="quick-form-actions">
              <button type="submit" className="btn-primary">
                Save Weight
              </button>
            </div>
          </form>

          <form className="quick-form quick-form-goals" onSubmit={handleUpdateProfile}>
            <div className="quick-form-inline">
              <div className="quick-form-group">
                <label htmlFor="fitness-goal-inline">Fitness Goal</label>
                <select
                  id="fitness-goal-inline"
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                >
                  <option value="lose_weight">Cut (Lose Weight)</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain_muscle">Bulk (Gain Muscle)</option>
                </select>
              </div>

              <div className="quick-form-group">
                <label htmlFor="activity-level-inline">Activity Level</label>
                <select
                  id="activity-level-inline"
                  value={editActivity}
                  onChange={(e) => setEditActivity(e.target.value)}
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Lightly Active (1-3 days/week)</option>
                  <option value="moderate">Moderately Active (3-5 days/week)</option>
                  <option value="active">Very Active (6-7 days/week)</option>
                  <option value="very_active">Extra Active (Physical job + training)</option>
                </select>
              </div>
            </div>

            <div className="quick-form-actions">
              <button type="submit" className="btn-secondary">
                Update Goals
              </button>
            </div>
          </form>
        </div>

        <div className="summary-stats-grid">
          <div className="summary-item">
            <span className="summary-label">Height</span>
            <span className="summary-value">
              {profile ? cmToFeetInches(profile.height_cm) : '---'}
            </span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Current Weight</span>
            <span className="summary-value">
              {measurements[0]
                ? kgToLbs(measurements[0].weight_kg)
                : profile
                  ? kgToLbs(profile.current_weight_kg)
                  : '---'}{' '}
              lbs
            </span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Maintenance (TDEE)</span>
            <span className="summary-value">
              {tdeeData ? Math.round(tdeeData.maintenance_calories) : '---'} cal
            </span>
          </div>

          <div className="summary-item">
            <span className="summary-label">{goalLabel}</span>
            <span className="summary-value accent">
              {goalCalories ? Math.round(goalCalories) : '---'} cal
            </span>
          </div>
        </div>
      </div>

      {/* Tab buttons to switch between sections */}
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
      </div>

      {/* Shows content for the selected tab */}
      {activeTab === 'weight' && (
        <div className="tab-content">
          <h2>Weight Progress</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#00FF6A"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#00FF6A' }}
                />
              </LineChart>
            </ResponsiveContainer>

          </div>
        </div>
      )}

      {/* Workouts tab content */}
      {activeTab === 'workouts' && (
        <div className="tab-content">
          <h2>Recent Workouts</h2>
          <div className="workout-timeline">
            {workouts.map((w, i) => (
              <div key={i} className="workout-item">
                <div className="workout-header">
                  <h4>{w.workout_name}</h4>
                  <span className="workout-date">
                    {new Date(w.workout_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {workouts.length === 0 && (
              <div className="no-data">
                <p>No workouts logged yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nutrition tab content */}
      {activeTab === 'nutrition' && (
        <div className="tab-content">
          <h2>Daily Calories</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={nutritionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
                <Bar dataKey="calories" fill="#00FF6A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsPage;
