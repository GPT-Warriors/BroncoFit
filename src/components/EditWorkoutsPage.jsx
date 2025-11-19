import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditWorkoutsPage.css';

const EditWorkoutsPage = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:8000/api/workouts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }

      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setError('Failed to load workouts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (workoutId) => {
    navigate(`/edit-workout/${workoutId}`);
  };

  const handleDelete = async (workoutId) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:8000/api/workouts/${workoutId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete workout');
      }

      // Remove the workout from the list
      setWorkouts(workouts.filter(w => w.id !== workoutId));
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="edit-workouts-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading workouts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-workouts-page">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchWorkouts}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-workouts-page">
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Edit Logged Workouts</h1>
      </div>

      <div className="workouts-list">
        {workouts.length === 0 ? (
          <div className="no-workouts">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            <p>No workouts logged yet</p>
            <button
              className="add-workout-btn"
              onClick={() => navigate('/add-workout')}
            >
              Add Your First Workout
            </button>
          </div>
        ) : (
          workouts.map((workout) => (
            <div key={workout.id} className="workout-card">
              <div className="workout-info">
                <h3>{workout.name || 'Workout'}</h3>
                <p className="workout-date">
                  {new Date(workout.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="workout-details">
                  {workout.details || 'No details provided'}
                </p>
                {workout.duration && (
                  <p className="workout-duration">
                    Duration: {workout.duration} minutes
                  </p>
                )}
              </div>
              <div className="workout-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(workout.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(workout.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EditWorkoutsPage;