import { useState, useEffect } from 'react'
import './App.css'
import Navigation from './components/Navigation'
import SignupPage from './components/SignupPage'
import LoginPage from './components/LoginPage'
import StatsPage from './components/StatsPage'
import AICoachPage from './components/AICoachPage'
import DashboardPage from './components/DashboardPage'
import WorkoutLogger from './components/WorkoutLogger'
import NutritionLogger from './components/NutritionLogger'
import ExerciseLibrary from './components/ExerciseLibrary'
import MacroRecommendationsPage from './components/MacroRecommendations'  // ✅ NEW
import FoodCalendar from './components/FoodCalendar'  // ✅ NEW
import apiService from './services/api'


function App() {
  const [currentPage, setCurrentPage] = useState('home') // home, signup, login, profile, dashboard, workout-log, nutrition-log, coach, settings
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)  // ✅ NEW
  const [tdeeData, setTdeeData] = useState(null)  // ✅ NEW


  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          const userData = await apiService.getCurrentUser()
          setUser(userData)

          // ✅ NEW: Load profile and TDEE data
          if (userData) {
            try {
              const profileData = await apiService.getProfile()
              setProfile(profileData)

              if (profileData) {
                const tdee = await apiService.calculateTDEE({
                  age: profileData.age,
                  sex: profileData.sex,
                  height_cm: profileData.height_cm,
                  weight_kg: profileData.current_weight_kg,
                  activity_level: profileData.activity_level,
                })
                setTdeeData(tdee)
              }
            } catch (err) {
              console.warn('Failed to load profile/tdee:', err)
            }
          }
        } catch (err) {
          console.error('Auth check failed:', err)
          apiService.logout()
        }
    }
      setLoading(false)
    }
    checkAuth()
  }, [])
  const handleNavigation = (page) => {
    setCurrentPage(page)
  }


  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setCurrentPage('dashboard')
  }


  const handleSignupSuccess = (userData) => {
    setUser(userData)
    setCurrentPage('dashboard')
  }


  const handleLogSuccess = () => {
    setCurrentPage('dashboard')
  }


  const handleLogout = () => {
    apiService.logout()
    setUser(null)
    setCurrentPage('home')
  }


  const handleBackToHome = () => {
    setCurrentPage('home')
  }


  // Show loading state
  if (loading) {
    return (
      <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    )
  }


  // Render different pages based on currentPage state
  if (currentPage === 'signup') {
    return <SignupPage onSuccess={handleSignupSuccess} onBack={handleBackToHome} onNavigateToLogin={() => setCurrentPage('login')} />
  }


  if (currentPage === 'login') {
    return <LoginPage onSuccess={handleLoginSuccess} onBack={handleBackToHome} onNavigateToSignup={() => setCurrentPage('signup')} />
  }


  if (currentPage === 'dashboard') {
    return <DashboardPage user={user} onBack={handleBackToHome} onNavigate={handleNavigation} />
  }


  if (currentPage === 'profile') {
    return <StatsPage user={user} onBack={handleBackToHome} />
  }


  if (currentPage === 'coach') {
    return <AICoachPage user={user} onBack={handleBackToHome} />
  }


  if (currentPage === 'workout-log') {
    return <WorkoutLogger user={user} onBack={() => setCurrentPage('dashboard')} onSuccess={handleLogSuccess} />
  }


  if (currentPage === 'nutrition-log') {
    return <NutritionLogger user={user} onBack={() => setCurrentPage('dashboard')} onSuccess={handleLogSuccess} />
  }


  if (currentPage === 'exercises') {
    return <ExerciseLibrary user={user} onBack={() => setCurrentPage('dashboard')} />
  }

  // ✅ NEW: Macros page route
  if (currentPage === 'macros') {
    return <MacroRecommendationsPage
      onBack={() => setCurrentPage('dashboard')}
      profile={profile}
      tdeeData={tdeeData}
    />
  }

  // ✅ NEW: Food Calendar page route
  if (currentPage === 'food-calendar') {
    return <FoodCalendar
      onBack={() => setCurrentPage('dashboard')}
    />
  }


  // Home page (default)
  return (
    <div className="App">
      <Navigation
        user={user}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        currentPage={currentPage}
      />


      <header className="app-header">
        <h1>Transform Your Fitness.<br />Unlock Your Potential.</h1>
        <p className="tagline">
          Elite AI-powered coaching that adapts to your goals, tracks your progress, and pushes you beyond your limits.
        </p>
        {!user && (
          <div style={{ marginTop: '20px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleNavigation('signup')}
              className="primary"
            >
              Get Started
            </button>
            <button
              onClick={() => handleNavigation('coach')}
              className="secondary"
            >
              Explore AI Coach
            </button>
          </div>
        )}
      </header>


      <main className="main-content">
        <section className="welcome-section">
          <h2>Performance-Driven Training</h2>
          <p>
            Track every rep, measure every metric, and dominate every workout with intelligent analytics
            and personalized coaching that evolves with you.
          </p>
          {user && (
            <div style={{ marginTop: '30px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleNavigation('dashboard')}
                className="primary"
              >
                View Dashboard
              </button>
              <button
                onClick={() => handleNavigation('coach')}
                className="secondary"
              >
                AI Coach
              </button>
            </div>
          )}
        </section>
      </main>


      <footer className="app-footer">
        <p>&copy; 2025 BroncoFit. All rights reserved.</p>
      </footer>
    </div>
  )
}


export default App
