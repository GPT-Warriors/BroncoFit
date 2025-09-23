import { useState } from 'react'
import './App.css'

function App() {
  const [userGoal, setUserGoal] = useState('')

  const handleGoalSubmit = (e) => {
    e.preventDefault()
    console.log('User goal:', userGoal)
    // Future: This will connect to MongoDB and Ollama for AI coaching
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>🏋️‍♂️ BroncoFit</h1>
        <p className="tagline">
          Revolutionary fitness tracking with intelligent AI coaching
        </p>
      </header>

      <main className="main-content">
        <section className="welcome-section">
          <h2>Welcome to Your Fitness Journey!</h2>
          <p>
            Our AI coach adapts to your progress, lifestyle, and goals to provide
            real-time guidance and motivation for your personalized workout plans
            and weight loss journey.
          </p>
        </section>

        <section className="goal-section">
          <h3>Set Your Fitness Goal</h3>
          <form onSubmit={handleGoalSubmit} className="goal-form">
            <textarea
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              placeholder="Tell us about your fitness goals... (e.g., lose 20 pounds, build muscle, train for a marathon)"
              rows={4}
              cols={50}
            />
            <button type="submit" disabled={!userGoal.trim()}>
              Get AI Coaching Plan
            </button>
          </form>
        </section>

        <section className="features-preview">
          <h3>Coming Soon</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>🤖 AI Coach</h4>
              <p>Powered by local Ollama service for personalized guidance</p>
            </div>
            <div className="feature-card">
              <h4>📊 Progress Tracking</h4>
              <p>MongoDB integration for comprehensive data storage</p>
            </div>
            <div className="feature-card">
              <h4>💪 Custom Workouts</h4>
              <p>Adaptive plans that evolve with your progress</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>BroncoFit - Your AI-Powered Fitness Companion</p>
      </footer>
    </div>
  )
}

export default App
