import { useState } from 'react';
import apiService from '../services/api';
import './Auth.css';

function SignupPage({ onSuccess, onBack, onNavigateToLogin }) {
  const [step, setStep] = useState(1); 
  const [formData, setFormData] = useState({
    // Account info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Profile stats (using imperial)
    age: '',
    sex: '',
    height_feet: '',
    height_inches: '',
    current_weight_lbs: '',
    target_weight_lbs: '',
    activity_level: '',
    fitness_goal: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Conversion functions
  const feetInchesToCm = (feet, inches) => {
    const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
    return totalInches * 2.54;
  };

  const lbsToKg = (lbs) => {
    return parseFloat(lbs) * 0.453592;
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.age || !formData.sex || !formData.height_feet || !formData.height_inches ||
        !formData.current_weight_lbs || !formData.target_weight_lbs ||
        !formData.activity_level || !formData.fitness_goal) {
      setError('Please fill in all fields');
      return false;
    }

    const age = parseInt(formData.age);
    if (age < 13 || age > 120) {
      setError('Age must be between 13 and 120');
      return false;
    }

    const feet = parseFloat(formData.height_feet);
    const inches = parseFloat(formData.height_inches);
    if (feet < 2 || feet > 9 || inches < 0 || inches >= 12) {
      setError('Please enter a valid height');
      return false;
    }

    const currentWeight = parseFloat(formData.current_weight_lbs);
    const targetWeight = parseFloat(formData.target_weight_lbs);
    if (currentWeight <= 0 || targetWeight <= 0) {
      setError('Please enter valid weights');
      return false;
    }

    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError('');

    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      // Step 1: Register user
      await apiService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      // Step 2: Login
      await apiService.login(formData.email, formData.password);

      // Step 3: Create profile with stats (convert to metric)
      await apiService.createProfile({
        age: parseInt(formData.age),
        sex: formData.sex,
        height_cm: feetInchesToCm(formData.height_feet, formData.height_inches),
        current_weight_kg: lbsToKg(formData.current_weight_lbs),
        target_weight_kg: lbsToKg(formData.target_weight_lbs),
        activity_level: formData.activity_level,
        fitness_goal: formData.fitness_goal
      });

      // Step 4: Get user data and complete signup
      const userData = await apiService.getCurrentUser();
      onSuccess(userData);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button className="back-button" onClick={step === 1 ? onBack : handleBack}>
        ← {step === 1 ? 'Back to Home' : 'Previous Step'}
      </button>

      <div className="auth-card">
        {/* Progress Indicator */}
        <div className="signup-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <div className="progress-circle">1</div>
            <span>Account</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="progress-circle">2</div>
            <span>Profile</span>
          </div>
        </div>

        {/* Step 1: Account Information */}
        {step === 1 && (
          <>
            <div className="auth-header">
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Let&apos;s start with your basic information</p>
            </div>

            <form className="auth-form" onSubmit={handleNext}>
              {error && <div className="auth-error">{error}</div>}

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="auth-button">
                Next: Profile Stats →
              </button>
            </form>
          </>
        )}

        {/* Step 2: Profile Stats */}
        {step === 2 && (
          <>
            <div className="auth-header">
              <h1 className="auth-title">Your Fitness Profile</h1>
              <p className="auth-subtitle">Tell us about your current stats and goals</p>
            </div>

            <form className="auth-form profile-form" onSubmit={handleSubmit}>
              {error && <div className="auth-error">{error}</div>}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    name="age"
                    className="form-input"
                    placeholder="25"
                    value={formData.age}
                    onChange={handleChange}
                    disabled={loading}
                    min="13"
                    max="120"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sex</label>
                  <select
                    name="sex"
                    className="form-input"
                    value={formData.sex}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Height</label>
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="number"
                      name="height_feet"
                      className="form-input"
                      placeholder="Feet"
                      value={formData.height_feet}
                      onChange={handleChange}
                      disabled={loading}
                      min="2"
                      max="9"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="number"
                      name="height_inches"
                      className="form-input"
                      placeholder="Inches"
                      value={formData.height_inches}
                      onChange={handleChange}
                      disabled={loading}
                      min="0"
                      max="11"
                      step="0.1"
                    />
                  </div>
                </div>
                <small className="form-hint">Example: 5 feet 9 inches</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Current Weight (lbs)</label>
                  <input
                    type="number"
                    name="current_weight_lbs"
                    className="form-input"
                    placeholder="150"
                    value={formData.current_weight_lbs}
                    onChange={handleChange}
                    disabled={loading}
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Weight (lbs)</label>
                  <input
                    type="number"
                    name="target_weight_lbs"
                    className="form-input"
                    placeholder="140"
                    value={formData.target_weight_lbs}
                    onChange={handleChange}
                    disabled={loading}
                    step="0.1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Activity Level</label>
                <select
                  name="activity_level"
                  className="form-input"
                  value={formData.activity_level}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select your activity level...</option>
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="light">Light (exercise 1-3 days/week)</option>
                  <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                  <option value="active">Active (exercise 6-7 days/week)</option>
                  <option value="very_active">Very Active (intense exercise daily)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fitness Goal</label>
                <select
                  name="fitness_goal"
                  className="form-input"
                  value={formData.fitness_goal}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select your primary goal...</option>
                  <option value="lose_weight">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain_muscle">Gain Muscle</option>
                  <option value="improve_fitness">Improve Overall Fitness</option>
                </select>
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Creating Your Profile...' : 'Complete Sign Up ✓'}
              </button>
            </form>
          </>
        )}

        <div className="auth-footer">
          Already have an account?{' '}
          <span className="auth-link" onClick={onNavigateToLogin}>
            Login here
          </span>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
