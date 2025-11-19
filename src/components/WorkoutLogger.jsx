import { useState } from 'react';
import apiService from '../services/api';
import './WorkoutLogger.css';

function WorkoutLogger({ onBack, onSuccess }) {
  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState([
    { exercise_name: '', exercise_type: 'strength', sets: '', reps: '', weight_kg: '', notes: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const exerciseTypes = [
    { value: 'strength', label: '💪 Strength', icon: '🏋️' },
    { value: 'cardio', label: '🏃 Cardio', icon: '❤️' },
    { value: 'flexibility', label: '🧘 Flexibility', icon: '🤸' },
    { value: 'sports', label: '⚽ Sports', icon: '🏀' }
  ];

  const addExercise = () => {
    setExercises([
      ...exercises,
      { exercise_name: '', exercise_type: 'strength', sets: '', reps: '', weight_kg: '', notes: '' }
    ]);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const lbsToKg = (lbs) => parseFloat(lbs) / 2.20462;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!workoutName.trim()) {
      setError('Please enter a workout name');
      return;
    }

    if (exercises.length === 0 || !exercises[0].exercise_name.trim()) {
      setError('Please add at least one exercise');
      return;
    }

    setLoading(true);

    try {
      // Convert exercises to proper format
      const formattedExercises = exercises
        .filter(ex => ex.exercise_name.trim())
        .map(ex => ({
          exercise_name: ex.exercise_name,
          exercise_type: ex.exercise_type,
          sets: ex.sets ? parseInt(ex.sets) : null,
          reps: ex.reps ? parseInt(ex.reps) : null,
          weight_kg: ex.weight_kg ? lbsToKg(ex.weight_kg) : null,
          notes: ex.notes || null
        }));

      const workoutData = {
        workout_name: workoutName,
        exercises: formattedExercises,
        duration_minutes: duration ? parseInt(duration) : null,
        notes: notes || null,
        workout_date: new Date().toISOString()
      };

      await apiService.createWorkout(workoutData);

      // Reset form
      setWorkoutName('');
      setDuration('');
      setNotes('');
      setExercises([{ exercise_name: '', exercise_type: 'strength', sets: '', reps: '', weight_kg: '', notes: '' }]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to log workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workout-logger-page">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="logger-container">
        <div className="logger-header">
          <h1>🏋️ Log Workout</h1>
          <p>Track your training session</p>
        </div>

        <form className="logger-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          {/* Workout Info */}
          <div className="form-section">
            <h3 className="section-title">Workout Details</h3>

            <div className="form-group">
              <label className="form-label">Workout Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Upper Body Strength"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="60"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={loading}
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-input"
                placeholder="How did it go? Any PRs?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                rows="3"
              ></textarea>
            </div>
          </div>

          {/* Exercises */}
          <div className="form-section">
            <div className="section-title-row">
              <h3 className="section-title">Exercises</h3>
              <button
                type="button"
                className="add-exercise-btn"
                onClick={addExercise}
                disabled={loading}
              >
                + Add Exercise
              </button>
            </div>

            {exercises.map((exercise, index) => (
              <div key={index} className="exercise-card">
                <div className="exercise-header">
                  <span className="exercise-number">#{index + 1}</span>
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeExercise(index)}
                      disabled={loading}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Exercise Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Bench Press"
                    value={exercise.exercise_name}
                    onChange={(e) => updateExercise(index, 'exercise_name', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-input"
                    value={exercise.exercise_type}
                    onChange={(e) => updateExercise(index, 'exercise_type', e.target.value)}
                    disabled={loading}
                  >
                    {exerciseTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {exercise.exercise_type === 'strength' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Sets</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="3"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                        disabled={loading}
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Reps</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="10"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                        disabled={loading}
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Weight (lbs)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="135"
                        value={exercise.weight_kg}
                        onChange={(e) => updateExercise(index, 'weight_kg', e.target.value)}
                        disabled={loading}
                        min="0"
                        step="0.5"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onBack} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : '✓ Log Workout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WorkoutLogger;
