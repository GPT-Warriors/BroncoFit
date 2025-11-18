import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import apiService from '../services/api';
import './ProfilePage.css';

function ProfilePage({ user, onBack }) {
  const [profile, setProfile] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState('');
  const [showAddMeasurement, setShowAddMeasurement] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState({
    weight_lbs: '',
    notes: ''
  });
  const [addingMeasurement, setAddingMeasurement] = useState(false);
  const [measurementError, setMeasurementError] = useState('');
  const [tdeeData, setTdeeData] = useState(null);
  const [tdeeError, setTdeeError] = useState('');

// 🧪 If mock data exists, use it for design preview
useEffect(() => {
  const mockProfile = localStorage.getItem("mock_profile");
  const mockMeasurements = localStorage.getItem("mock_measurements");
  const mockTdee = localStorage.getItem("mock_tdee");          

  if (mockProfile && mockMeasurements) {
    setProfile(JSON.parse(mockProfile));
    setMeasurements(JSON.parse(mockMeasurements));
    if (mockTdee) setTdeeData(JSON.parse(mockTdee));            
    setLoading(false);
  }
}, []);


  // Conversion functions
  const kgToLbs = (kg) => kg * 2.20462;
  const lbsToKg = (lbs) => lbs * 0.453592;
  const cmToFeetInches = (cm) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  };

  useEffect(() => {
    loadProfileData();
  }, []);

const loadProfileData = async () => {
  try {
    setLoading(true);

    const profileData = await apiService.getProfile();
    setProfile(profileData);

    const measurementData = await apiService.getMeasurements(30);
    setMeasurements(measurementData || []);

    // ✅ SAFE: we're inside an async function
    const payload = {
      age: profileData.age,
      sex: profileData.sex,                 // "male" | "female"
      height_cm: profileData.height_cm,
      weight_kg: measurementData?.[0]?.weight_kg ?? profileData.current_weight_kg,
      activity_level: profileData.activity_level,
    };

    const result = await apiService.calculateTDEE(payload);
    setTdeeData(result);
    setTdeeError('');
  } catch (err) {
    console.error('Error fetching TDEE:', err);
    setTdeeError('Failed to calculate TDEE');
  } finally {
    setLoading(false);
  }
};



  const generateAIInsight = (measurements, profile) => {
    if (measurements.length === 0) {
      setAiInsight("Start tracking your measurements to get personalized insights!");
      return;
    }

    const latestWeightKg = measurements[0]?.weight_kg;
    const oldestWeightKg = measurements[measurements.length - 1]?.weight_kg;
    const weightChangeLbs = kgToLbs(latestWeightKg - oldestWeightKg);
    const daysTracking = measurements.length;

    let insight = '';

    if (weightChangeLbs < 0) {
      insight = `🎉 Great progress! You've lost ${Math.abs(weightChangeLbs).toFixed(1)} lbs over ${daysTracking} measurements. `;
      insight += `You're on track to reach your goal! Keep up the excellent work with your ${profile?.activity_level || 'current'} activity level.`;
    } else if (weightChangeLbs > 0) {
      insight = `You've gained ${weightChangeLbs.toFixed(1)} lbs over ${daysTracking} measurements. `;
      if (profile?.fitness_goal === 'gain_muscle') {
        insight += `This is great for your muscle gain goal! Make sure you're getting enough protein and maintaining your workout routine.`;
      } else {
        insight += `Consider reviewing your nutrition and activity levels. Small adjustments can make a big difference!`;
      }
    } else {
      insight = `Your weight has been stable over ${daysTracking} measurements. `;
      if (profile?.fitness_goal === 'maintain') {
        insight += `Perfect! You're maintaining your target weight successfully.`;
      } else {
        insight += `To see changes, try adjusting your calorie intake or increasing activity levels gradually.`;
      }
    }

    setAiInsight(insight);
  };

  const formatChartData = () => {
    if (!measurements || measurements.length === 0) return [];

    return measurements
      .slice()
      .reverse()
      .map((m, index) => ({
        name: `Day ${index + 1}`,
        weight: kgToLbs(m.weight_kg).toFixed(1),
        date: new Date(m.measurement_date).toLocaleDateString()
      }));
  };

  const calculateStats = () => {
    if (!profile) return null;

    const currentWeightKg = measurements[0]?.weight_kg || profile.current_weight_kg;
    const targetWeightKg = profile.target_weight_kg;
    const weightToGoKg = Math.abs(currentWeightKg - targetWeightKg);
    const bmi = currentWeightKg / Math.pow(profile.height_cm / 100, 2);

    // Convert to imperial
    const currentWeightLbs = kgToLbs(currentWeightKg);
    const targetWeightLbs = kgToLbs(targetWeightKg);
    const weightToGoLbs = kgToLbs(weightToGoKg);
    const height = cmToFeetInches(profile.height_cm);

    return {
      currentWeight: currentWeightLbs?.toFixed(1) || 'N/A',
      targetWeight: targetWeightLbs?.toFixed(1) || 'N/A',
      weightToGo: weightToGoLbs?.toFixed(1) || 'N/A',
      bmi: bmi?.toFixed(1) || 'N/A',
      height: `${height.feet}'${height.inches}"`,
      age: profile.age,
      activityLevel: profile.activity_level,
      fitnessGoal: profile.fitness_goal
    };
  };

  const handleAddMeasurement = async (e) => {
    e.preventDefault();
    setMeasurementError('');

    const weightLbs = parseFloat(newMeasurement.weight_lbs);
    if (!weightLbs || weightLbs <= 0) {
      setMeasurementError('Please enter a valid weight');
      return;
    }

    setAddingMeasurement(true);

    try {
      await apiService.addMeasurement({
        weight_kg: lbsToKg(weightLbs),
        notes: newMeasurement.notes || null
      });

      // Reload data
      await loadProfileData();

      // Reset form and close modal
      setNewMeasurement({ weight_lbs: '', notes: '' });
      setShowAddMeasurement(false);
    } catch (err) {
      setMeasurementError(err.message || 'Failed to add measurement');
    } finally {
      setAddingMeasurement(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <button className="back-button" onClick={onBack} style={{ position: 'fixed' }}>
          ← Back
        </button>
        <div className="loading-spinner">Loading your profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <button className="back-button" onClick={onBack} style={{ position: 'fixed' }}>
          ← Back
        </button>
        <div className="profile-content">
          <div className="profile-card">
            <div className="no-data-message">
              <div className="no-data-icon">📊</div>
              <h2>No Profile Found</h2>
              <p>Create your profile to start tracking your fitness journey!</p>
              <button className="create-profile-button" onClick={() => alert('Profile creation form coming soon!')}>
                Create Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const chartData = formatChartData();

  return (
    <div className="profile-container">
      <button className="back-button" onClick={onBack} style={{ position: 'fixed' }}>
        ← Back
      </button>

      {/* Add Measurement Modal */}
      {showAddMeasurement && (
        <div className="modal-overlay" onClick={() => setShowAddMeasurement(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Measurement</h2>
              <button
                className="modal-close"
                onClick={() => setShowAddMeasurement(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMeasurement} className="measurement-form">
              {measurementError && (
                <div className="measurement-error">{measurementError}</div>
              )}

              <div className="form-group">
                <label className="form-label">Current Weight (lbs)</label>
                <input
                  type="number"
                  /*avoid negative input and a max input of 999*/
                  min={0}
                  max={999}
                  className="form-input"
                  placeholder="Enter your current weight"
                  value={newMeasurement.weight_lbs}
                  onChange={(e) => setNewMeasurement({
                    ...newMeasurement,
                    weight_lbs: e.target.value
                  })}
                  disabled={addingMeasurement}
                  step="0.1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-input"
                  placeholder="Any notes about your progress..."
                  value={newMeasurement.notes}
                  onChange={(e) => setNewMeasurement({
                    ...newMeasurement,
                    notes: e.target.value
                  })}
                  disabled={addingMeasurement}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddMeasurement(false)}
                  disabled={addingMeasurement}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={addingMeasurement}
                >
                  {addingMeasurement ? 'Adding...' : 'Add Measurement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="profile-content">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || '👤'}
          </div>
          <div className="profile-info">
            <h1>{user?.name || 'User'}</h1>
            <p>{user?.email}</p>
          </div>
          <button
            className="add-measurement-btn"
            onClick={() => setShowAddMeasurement(true)}
          >
            ➕ Add Measurement
          </button>
        </div>

        {/* Profile Grid */}
        <div className="profile-grid">
          {/* Statistics Card */}
          <div className="profile-card">
            <div className="card-header">
              <span className="card-icon">📊</span>
              <h2 className="card-title">Your Statistics</h2>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.currentWeight}</div>
                <div className="stat-label">Current Weight (lbs)</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.targetWeight}</div>
                <div className="stat-label">Target Weight (lbs)</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.weightToGo}</div>
                <div className="stat-label">To Go (lbs)</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.bmi}</div>
                <div className="stat-label">BMI</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.height}</div>
                <div className="stat-label">Height</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.age}</div>
                <div className="stat-label">Age</div>
              </div>

              {/* TDEE Stat */}
              {tdeeError ? (
                <div className="stat-item">
                  <div className="stat-value">N/A</div>
                  <div className="stat-label">TDEE (Error)</div>
                </div>
              ) : !tdeeData ? (
                <div className="stat-item">
                  <div className="stat-value">...</div>
                  <div className="stat-label">Calculating TDEE</div>
                </div>
              ) : (
                <div className="stat-item">
                  <div className="stat-value">{Math.round(tdeeData.tdee).toLocaleString()}</div>
                  <div className="stat-label">TDEE (Calories / Day)</div>
                </div>
              )}
            </div>
          </div>

          {/* AI Insight Card */}
          <div className="profile-card">
            <div className="card-header">
              <span className="card-icon">🤖</span>
              <h2 className="card-title">AI Insights</h2>
            </div>
            <div className="ai-insight-box">
              <div className="ai-insight-header">
                <span>✨</span>
                <span>Your Progress Analysis</span>
              </div>
              <div className="ai-insight-content">
                {aiInsight || 'Track your measurements to get personalized AI insights about your progress!'}
              </div>
            </div>
          </div>
        </div>

        {/* Weight Progress Chart */}
        <div className="profile-card">
          <div className="card-header">
            <span className="card-icon">📈</span>
            <h2 className="card-title">Weight Progress Over Time</h2>
          </div>
          {chartData.length > 0 ? (
            <div className="progress-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b6b6b"
                    style={{ fontSize: '12px', fill: '#b0b0b0' }}
                  />
                  <YAxis
                    stroke="#6b6b6b"
                    style={{ fontSize: '12px', fill: '#b0b0b0' }}
                    label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft', fill: '#b0b0b0' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(26, 26, 26, 0.95)',
                      border: '1px solid rgba(0, 255, 136, 0.2)',
                      borderRadius: '12px',
                      padding: '10px',
                      color: '#ffffff'
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#b0b0b0' }} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#00ff88"
                    strokeWidth={3}
                    dot={{ fill: '#00ff88', r: 5 }}
                    activeDot={{ r: 7, fill: '#ffd700' }}
                    name="Weight (lbs)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="no-data-message">
              <div className="no-data-icon">📊</div>
              <p>No measurement data yet. Start tracking to see your progress!</p>
              <button
                className="btn-primary"
                onClick={() => setShowAddMeasurement(true)}
                style={{ marginTop: '1rem' }}
              >
                Add Your First Measurement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
