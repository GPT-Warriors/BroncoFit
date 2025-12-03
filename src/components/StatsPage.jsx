import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import apiService from '../services/api';
import './StatsPage.css';

function StatsPage({ onBack }) {
  // Stores user data from the API
  const [profile, setProfile] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [tdeeData, setTdeeData] = useState(null);
  
  // Tracks loading state and tab selection
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weight');
  const [expandedWorkouts, setExpandedWorkouts] = useState({});
  
  // Controls modal visibility and form fields
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editGoal, setEditGoal] = useState('maintain');
  const [editActivity, setEditActivity] = useState('moderately_active');

  // Helper functions for unit conversions
  const kgToLbs = (kg) => (kg * 2.20462).toFixed(1);
  const lbsToKg = (lbs) => (lbs / 2.20462);
  
  const cmToFeetInches = (cm) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Syncs edit fields with current profile data
  useEffect(() => {
    if (profile) {
      setEditGoal(profile.fitness_goal || 'maintain');
      setEditActivity(profile.activity_level || 'moderately_active');
    }
  }, [profile, showProfileModal]);

  // Loads all stats data from the API
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

      if (profileData) {
        const weightForCalc = measurementData?.[0]?.weight_kg || profileData.current_weight_kg;

        const tdee = await apiService.calculateTDEE({
          age: profileData.age,
          sex: profileData.sex,
          height_cm: profileData.height_cm,
          weight_kg: weightForCalc,
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

  // Handles adding a new weight entry
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
      setShowWeightModal(false);
      await loadAllData();
    } catch (error) {
      console.error("Failed to add weight", error);
      alert("Failed to save weight. Please try again.");
    }
  };

  // Handles updating profile goal and activity level
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateProfile({
        fitness_goal: editGoal,
        activity_level: editActivity
      });
      
      setShowProfileModal(false);
      await loadAllData();
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  // Prepares weight chart data
  const weightChartData = measurements
    .slice()
    .reverse()
    .map(m => ({
      date: new Date(m.measurement_date || m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: parseFloat(kgToLbs(m.weight_kg)),
      target: parseFloat(kgToLbs(profile?.target_weight_kg || 0))
    }));

  // Prepares nutrition chart data
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

  // Chooses target calories based on goal and TDEE
  let goalCalories = 0;
  let goalLabel = "Target";

  if (profile && tdeeData) {
    const goal = (profile.fitness_goal || 'maintain').toLowerCase();

    if (goal.includes('lose') || goal.includes('cut')) {
      goalCalories = tdeeData.weight_loss_calories;
      goalLabel = "Target (Cut)";
    } else if (goal.includes('gain') || goal.includes('bulk') || goal.includes('muscle')) {
      goalCalories = tdeeData.weight_gain_calories;
      goalLabel = "Target (Bulk)";
    } else {
      goalCalories = tdeeData.maintenance_calories;
      goalLabel = "Target (Maintain)";
    }
  }

  // Uses maintenance calories if other values are missing
  if (!goalCalories && tdeeData?.maintenance_calories) {
      goalCalories = tdeeData.maintenance_calories;
  }

  // Renders loading screen when data is loading
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

  // Renders the main stats page
  return (
    <div className="stats-page">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      {/* Page header section */}
      <div className="stats-header">
        <h1>📊 Your Stats</h1>
        <p>Track your progress and achievements</p>
      </div>

      {/* Profile summary section */}
      <div className="profile-summary-card">
        <div className="summary-actions">
           <button 
             className="icon-btn" 
             onClick={() => setShowProfileModal(true)} 
             title="Edit Goals & Activity"
           >
            ✏️ Edit Profile
          </button>
        </div>

        <div className="summary-row">
            <div className="summary-item">
              <span className="summary-label">Height</span>
              <span className="summary-value">{profile ? cmToFeetInches(profile.height_cm) : '---'}</span>
            </div>
            
            <div className="summary-item clickable" onClick={() => setShowWeightModal(true)}>
              <span className="summary-label">Current Weight 📝</span>
              <span className="summary-value">
                  {measurements[0] ? kgToLbs(measurements[0].weight_kg) : profile ? kgToLbs(profile.current_weight_kg) : '---'} lbs
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Maintenance (TDEE)</span>
              <span className="summary-value">
                  {tdeeData ? Math.round(tdeeData.maintenance_calories) : '---'} cal
              </span>
            </div>

            <div className="summary-item highlight">
              <span className="summary-label">{goalLabel}</span>
              <span className="summary-value accent">
                  {goalCalories ? Math.round(goalCalories) : '---'} cal
              </span>
            </div>
        </div>
      </div>

      {/* Tabs for switching between sections */}
      <div className="stats-tabs">
        <button className={`tab-btn ${activeTab === 'weight' ? 'active' : ''}`} onClick={() => setActiveTab('weight')}>⚖️ Weight</button>
        <button className={`tab-btn ${activeTab === 'workouts' ? 'active' : ''}`} onClick={() => setActiveTab('workouts')}>💪 Workouts</button>
        <button className={`tab-btn ${activeTab === 'nutrition' ? 'active' : ''}`} onClick={() => setActiveTab('nutrition')}>🍽️ Nutrition</button>
      </div>

      {/* Tab content area */}
      <div className="tab-content">
        {activeTab === 'weight' && (
          <div className="weight-tab">
            <div className="section-header-row">
                <h2>Weight Progress</h2>
                <button className="action-btn-small" onClick={() => setShowWeightModal(true)}>+ Log Weight</button>
            </div>
            {weightChartData.length > 0 ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={weightChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" stroke="#b0b0b0" />
                    <YAxis stroke="#b0b0b0" domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} labelStyle={{ color: '#fff' }} />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke="#00FF6A" strokeWidth={3} dot={{ fill: '#00FF6A' }} name="Weight (lbs)" />
                    <Line type="monotone" dataKey="target" stroke="#EEC97D" strokeDasharray="5 5" name="Target (lbs)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="no-data"><p>No data. Log your weight to see the graph!</p></div>}
            
            <div className="measurements-list">
              <h3>Recent Measurements</h3>
              {measurements.slice(0, 5).map((m, i) => (
                <div key={i} className="measurement-item">
                  <span className="measurement-date">
                    {new Date(m.measurement_date || m.created_at).toLocaleDateString()}
                  </span>
                  <span className="measurement-weight">{kgToLbs(m.weight_kg)} lbs</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workouts tab content */}
        {activeTab === 'workouts' && (
             <div className="workouts-tab">
                <h2>Recent Workouts</h2>
                {workouts.length === 0 && <div className="no-data"><p>No workouts found.</p></div>}
                <div className="workout-timeline">
                    {workouts.map((w, i) => (
                        <div key={i} className="workout-item">
                            <div className="workout-header">
                                <h4>{w.workout_name}</h4>
                                <span className="workout-date">{new Date(w.workout_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        )}
        
        {/* Nutrition tab content */}
        {activeTab === 'nutrition' && (
             <div className="nutrition-tab">
                <h2>Nutrition</h2>
                {nutritionChartData.length > 0 ? (
                    <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={nutritionChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" stroke="#b0b0b0" />
                        <YAxis stroke="#b0b0b0" />
                        <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                        <Bar dataKey="calories" fill="#00FF6A" radius={[4,4,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    </div>
                ) : <div className="no-data"><p>No meals logged.</p></div>}
             </div>
        )}
      </div>

      {/* Modals for weight logging and profile editing */}
      
      {/* Weight modal */}
      {showWeightModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Log Current Weight</h3>
            <form onSubmit={handleAddWeight}>
              <div className="form-group">
                <label htmlFor="weight-input">Weight (lbs)</label>
                <input 
                  id="weight-input"
                  type="number" 
                  step="0.1" 
                  value={newWeight} 
                  onChange={(e) => setNewWeight(e.target.value)} 
                  placeholder="e.g. 165.5"
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowWeightModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile modal */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Goals & Activity</h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="fitness-goal">Fitness Goal</label>
                <select id="fitness-goal" value={editGoal} onChange={(e) => setEditGoal(e.target.value)}>
                  <option value="lose_weight">Cut (Lose Weight)</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain_muscle">Bulk (Gain Muscle)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="activity-level">Activity Level</label>
                <select id="activity-level" value={editActivity} onChange={(e) => setEditActivity(e.target.value)}>
                  <option value="sedentary">Sedentary</option>
                  <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                  <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                  <option value="very_active">Very Active (6-7 days/week)</option>
                  <option value="extra_active">Extra Active (Physical job + training)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowProfileModal(false)}>Cancel</button>
                <button type="submit" className="btn-save">Update Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsPage;
