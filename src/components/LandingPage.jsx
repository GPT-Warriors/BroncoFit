import './LandingPage.css';

function LandingPage({ onNavigate, isLoggedIn }) {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="app-header">
        <img src="/broncofit_logo_new.png" alt="BroncoFit Logo" className="app-logo" />
        <h1>BRONCOFIT</h1>
        <p className="tagline">
          Your complete fitness companion. Track workouts, monitor nutrition, and achieve your goals with AI-powered insights.
        </p>
        <div>
          {isLoggedIn ? (
            <button className="primary" onClick={() => onNavigate('dashboard')}>
              Go to Dashboard
            </button>
          ) : (
            <>
              <button className="primary" onClick={() => onNavigate('signup')}>
                Get Started Free
              </button>
              <button className="secondary" onClick={() => onNavigate('login')} style={{ marginLeft: '1rem' }}>
                Login
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <section className="welcome-section">
          <h2>Welcome to BroncoFit</h2>
          <p>
            Transform your fitness journey with our comprehensive tracking system.
            Log workouts, monitor your nutrition, and get personalized AI coaching
            to help you reach your goals faster.
          </p>
          <p>
            Whether you&apos;re building muscle, losing weight, or maintaining your fitness,
            BroncoFit provides the tools and insights you need to succeed.
          </p>

          {!isLoggedIn && (
            <div style={{ marginTop: '2rem' }}>
              <button className="primary" onClick={() => onNavigate('signup')}>
                Create Your Free Account
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; 2024 BroncoFit. Built with 💪 for fitness enthusiasts.</p>
      </footer>
    </div>
  );
}

export default LandingPage;