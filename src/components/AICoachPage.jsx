import { useState, useRef, useEffect } from 'react'
import apiService from '../services/api'
import './AICoachPage.css'

function AICoachPage({ onBack }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I&apos;m your AI fitness coach. I can create personalized workouts that you can save directly to your workout log! Just ask me for a workout suggestion, or ask about fitness, nutrition, and training advice.',
      timestamp: new Date().toISOString()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedWorkout, setSuggestedWorkout] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      // Check if the message is asking for a workout suggestion
      const workoutKeywords = ['workout', 'exercise', 'training', 'routine', 'plan', 'session']
      const isWorkoutRequest = workoutKeywords.some(keyword =>
        messageText.toLowerCase().includes(keyword)
      )

      if (isWorkoutRequest) {
        // Get structured workout suggestion
        const result = await apiService.suggestWorkout(messageText)

        if (result.success && result.workout) {
          setSuggestedWorkout(result.workout)
          const assistantMessage = {
            role: 'assistant',
            content: result.message,
            timestamp: new Date().toISOString(),
            hasWorkout: true
          }
          setMessages(prev => [...prev, assistantMessage])
        } else {
          // Fallback to regular chat if workout generation failed
          const response = await apiService.chatWithCoach(messageText, messages)
          const assistantMessage = {
            role: 'assistant',
            content: response.response,
            timestamp: response.timestamp
          }
          setMessages(prev => [...prev, assistantMessage])
        }
      } else {
        // Regular chat response
        const response = await apiService.chatWithCoach(messageText, messages)
        const assistantMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: response.timestamp
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error chatting with coach:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveWorkout = async () => {
    if (!suggestedWorkout) return

    try {
      setIsLoading(true)
      await apiService.createWorkout(suggestedWorkout)

      const successMessage = {
        role: 'assistant',
        content: `Great! I've saved "${suggestedWorkout.workout_name}" to your workout log. You can view it on your dashboard!`,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, successMessage])
      setSuggestedWorkout(null)
    } catch (error) {
      console.error('Error saving workout:', error)
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I had trouble saving that workout. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="ai-coach-page">
      <div className="coach-header">
        <button onClick={onBack} className="back-button">← Back</button>
        <h1>AI Fitness Coach</h1>
        <div className="coach-status">
          <span className="status-indicator"></span>
          Online
        </div>
      </div>

      <div className="chat-container">
        {/* Feature Highlight Banner */}
        <div className="feature-banner">
          <div className="banner-icon">✨</div>
          <div className="banner-content">
            <h3>AI Workout Generator</h3>
            <p>Ask me to create a workout and I&apos;ll generate a complete routine you can save directly to your log!</p>
          </div>
        </div>

        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-content">
                <div className="message-avatar">
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-bubble">
                  <p>{message.content}</p>
                  <span className="message-time">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant-message">
              <div className="message-content">
                <div className="message-avatar">🤖</div>
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Workout Card */}
        {suggestedWorkout && (
          <div className="suggested-workout-card">
            <div className="workout-card-header">
              <h3>{suggestedWorkout.workout_name}</h3>
              <button
                className="close-workout-btn"
                onClick={() => setSuggestedWorkout(null)}
                disabled={isLoading}
              >
                ✕
              </button>
            </div>
            {suggestedWorkout.description && (
              <p className="workout-description">{suggestedWorkout.description}</p>
            )}
            <div className="workout-exercises">
              <h4>Exercises ({suggestedWorkout.exercises?.length || 0})</h4>
              <div className="exercises-list">
                {suggestedWorkout.exercises?.map((exercise, idx) => (
                  <div key={idx} className="exercise-item">
                    <div className="exercise-header">
                      <span className="exercise-number">{idx + 1}</span>
                      <span className="exercise-name">{exercise.exercise_name}</span>
                      <span className={`exercise-type-badge ${exercise.exercise_type}`}>
                        {exercise.exercise_type}
                      </span>
                    </div>
                    <div className="exercise-details">
                      {exercise.sets && exercise.reps && (
                        <span className="exercise-stat">
                          {exercise.sets} sets × {exercise.reps} reps
                        </span>
                      )}
                      {exercise.duration_minutes && (
                        <span className="exercise-stat">
                          {exercise.duration_minutes} minutes
                        </span>
                      )}
                    </div>
                    {exercise.notes && (
                      <p className="exercise-notes">{exercise.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {suggestedWorkout.notes && (
              <div className="workout-notes">
                <strong>Tips:</strong> {suggestedWorkout.notes}
              </div>
            )}
            <div className="workout-card-actions">
              <button
                className="save-workout-btn"
                onClick={handleSaveWorkout}
                disabled={isLoading}
              >
                {isLoading ? '⏳ Saving...' : '💾 Save to Workout Log'}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="message-input-form">
          <div className="quick-questions">
            <button
              type="button"
              onClick={() => setInputMessage('Create a workout plan based on my goals and fitness level')}
              className="quick-question-btn featured-btn"
            >
              ⚡ Generate Workout (Save to Log)
            </button>
            <button
              type="button"
              onClick={() => setInputMessage('What should I eat today to meet my macros?')}
              className="quick-question-btn"
            >
              🍽️ Meal suggestions
            </button>
            <button
              type="button"
              onClick={() => setInputMessage('How am I progressing towards my fitness goal?')}
              className="quick-question-btn"
            >
              📊 Check progress
            </button>
            <button
              type="button"
              onClick={() => setInputMessage('Give me nutrition tips for my fitness goal')}
              className="quick-question-btn"
            >
              🥗 Nutrition tips
            </button>
            <button
              type="button"
              onClick={() => setInputMessage('What exercises should I do today?')}
              className="quick-question-btn"
            >
              🏋️ Exercise guide
            </button>
          </div>
          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about fitness..."
              disabled={isLoading}
              className="message-input"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AICoachPage
