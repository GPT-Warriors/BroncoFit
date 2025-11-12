import { useState, useEffect } from 'react'
import './App.css'
import HamburgerMenu from './components/HamburgerMenu'
import SignupPage from './components/SignupPage'
import LoginPage from './components/LoginPage'
import ProfilePage from './components/ProfilePage'
import apiService from './services/api'


/*http://localhost:3000/?debug=profile */
/*Added mock data below and usestate to access debug for profile, use the above url to access*/ 
/*Theres also a usestate for this in profilepage.jsx */

// 🧪 DESIGN PREVIEW DATA
const MOCK_USER = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
};

const MOCK_PROFILE = {
  user_id: '123',
  age: 25,
  sex: 'male',
  height_cm: 180,
  current_weight_kg: 80,
  target_weight_kg: 75,
  activity_level: 'moderate',
  fitness_goal: 'lose_weight',
  updated_at: new Date().toISOString(),
};

const MOCK_MEASUREMENTS = [
  {
    id: '1',
    weight_kg: 80,
    measurement_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Starting weight',
  },
  {
    id: '2',
    weight_kg: 79.5,
    measurement_date: new Date().toISOString(),
    notes: 'Week 1',
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState('home') // home, signup, login, profile, dashboard, settings
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          const userData = await apiService.getCurrentUser()
          setUser(userData)
        } catch (err) {
          console.error('Auth check failed:', err)
          apiService.logout()
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])
  useEffect(() => {
  if (import.meta.env.DEV) {
    const params = new URLSearchParams(window.location.search);
    const debugPage = params.get("debug");

    if (debugPage === "profile") {
      console.log("🧪 Debugging ProfilePage with mock data");

      // Jump straight to ProfilePage
      setCurrentPage("profile");

      // Fake logged-in user
      setUser(MOCK_USER);

      // Store mocks in localStorage so ProfilePage can read them
      localStorage.setItem("mock_profile", JSON.stringify(MOCK_PROFILE));
      localStorage.setItem("mock_measurements", JSON.stringify(MOCK_MEASUREMENTS));
    }
  }
}, []);

  const handleNavigation = (page) => {
    setCurrentPage(page)
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setCurrentPage('profile')
  }

  const handleSignupSuccess = (userData) => {
    setUser(userData)
    setCurrentPage('profile')
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
    return <SignupPage onSuccess={handleSignupSuccess} onBack={handleBackToHome} />
  }

  if (currentPage === 'login') {
    return <LoginPage onSuccess={handleLoginSuccess} onBack={handleBackToHome} />
  }

  if (currentPage === 'profile') {
    return <ProfilePage user={user} onBack={handleBackToHome} />
  }

  // Home page (default)
  return (
    <div className="App">
      <HamburgerMenu
        user={user}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
      />

      <header className="app-header">
        <img src="/broncofit_logo.png" alt="BroncoFit Logo" className="app-logo" />
        <h1>BroncoFit</h1>
        <p className="tagline">
          Revolutionary fitness tracking with intelligent AI coaching
        </p>
      </header>

      <main className="main-content">
        <section className="welcome-section">
          <h2>Welcome to Your Fitness Journey!</h2>
          <p>
            Our AI coach adapts to your progress, lifestyle, and goals to
            provide real-time guidance and motivation for your personalized
            workout plans and weight loss journey.
          </p>
          {!user && (
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => handleNavigation('signup')}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Get Started
              </button>
              <button
                onClick={() => handleNavigation('login')}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Login
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
