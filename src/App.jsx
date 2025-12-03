import { useState, useEffect } from 'react';
import apiService from './services/api';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import DashboardPage from './components/DashboardPage';
import ProfilePage from './components/ProfilePage';
import StatsPage from './components/StatsPage';
import WorkoutLogger from './components/WorkoutLogger';
import NutritionLogger from './components/NutritionLogger';
import ExerciseLibrary from './components/ExerciseLibrary';
import AICoachPage from './components/AICoachPage';
import MacroRecommendations from './components/MacroRecommendations';  // ✅ NEW
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);  // ✅ NEW
  const [tdeeData, setTdeeData] = useState(null);  // ✅ NEW

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await apiService.getCurrentUser();
          setUser(userData);
          setCurrentPage('dashboard');
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // ✅ NEW: Load profile and TDEE data when user logs in
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  // ✅ NEW: Load profile and calculate TDEE
  const loadProfileData = async () => {
    try {
      const profileData = await apiService.getProfile();
      setProfile(profileData);

      // Get latest measurement for weight
      const measurements = await apiService.getMeasurements(1);
      const weight = measurements?.[0]?.weight_kg || profileData.current_weight_kg;

      // Calculate TDEE
      if (profileData.age && profileData.sex && profileData.height_cm && weight) {
        const tdee = await apiService.calculateTDEE({
          age: profileData.age,
          sex: profileData.sex,
          height_cm: profileData.height_cm,
          weight_kg: weight,
          activity_level: profileData.activity_level
        });
        setTdeeData(tdee);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
    setProfile(null);  // ✅ Clear profile on logout
    setTdeeData(null);  // ✅ Clear TDEE on logout
    setCurrentPage('home');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleWorkoutSuccess = () => {
    setCurrentPage('dashboard');
  };

  const handleNutritionSuccess = () => {
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="App">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          color: 'var(--text-primary)'
        }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Navigation
        user={user}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        currentPage={currentPage}
      />

      {/* Home / Landing Page */}
      {currentPage === 'home' && (
        <LandingPage
          onNavigate={handleNavigate}
          isLoggedIn={!!user}
        />
      )}

      {/* Login Page */}
      {currentPage === 'login' && (
        <LoginPage
          onSuccess={handleLoginSuccess}
          onBack={() => handleNavigate('home')}
          onNavigateToSignup={() => handleNavigate('signup')}
        />
      )}

      {/* Signup Page */}
      {currentPage === 'signup' && (
        <SignupPage
          onSuccess={handleSignupSuccess}
          onBack={() => handleNavigate('home')}
          onNavigateToLogin={() => handleNavigate('login')}
        />
      )}

      {/* Dashboard */}
      {currentPage === 'dashboard' && user && (
        <DashboardPage
          user={user}
          onBack={() => handleNavigate('home')}
          onNavigate={handleNavigate}
        />
      )}

      {/* Profile / Stats Page */}
      {currentPage === 'profile' && user && (
        <ProfilePage
          user={user}
          onBack={() => handleNavigate('dashboard')}
        />
      )}

      {/* Stats Page */}
      {currentPage === 'stats' && user && (
        <StatsPage
          onBack={() => handleNavigate('dashboard')}
        />
      )}

      {/* Workout Logger */}
      {currentPage === 'workout-log' && user && (
        <WorkoutLogger
          onBack={() => handleNavigate('dashboard')}
          onSuccess={handleWorkoutSuccess}
        />
      )}

      {/* Nutrition Logger */}
      {currentPage === 'nutrition-log' && user && (
        <NutritionLogger
          onBack={() => handleNavigate('dashboard')}
          onSuccess={handleNutritionSuccess}
        />
      )}

      {/* Exercise Library */}
      {currentPage === 'exercises' && user && (
        <ExerciseLibrary
          onBack={() => handleNavigate('dashboard')}
        />
      )}

      {/* AI Coach */}
      {currentPage === 'coach' && user && (
        <AICoachPage
          onBack={() => handleNavigate('dashboard')}
        />
      )}

      {/* ✅ NEW: Macro Recommendations Page */}
      {currentPage === 'macros' && user && (
        <MacroRecommendations
          onBack={() => handleNavigate('dashboard')}
          profile={profile}
          tdeeData={tdeeData}
        />
      )}

      {/* Redirect to login if trying to access protected page */}
      {!user && currentPage !== 'home' && currentPage !== 'login' && currentPage !== 'signup' && (
        <>
          {handleNavigate('login')}
        </>
      )}
    </div>
  );
}

export default App;