import { useState, useMemo } from 'react';
import { exerciseLibrary, exerciseCategories, equipmentTypes, difficultyLevels } from '../data/exerciseLibrary';
import './ExerciseLibrary.css';

function ExerciseLibrary({ onBack, onSelectExercise }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Filter and search exercises
  const filteredExercises = useMemo(() => {
    return exerciseLibrary.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscleGroups.some(mg => mg.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || exercise.category === categoryFilter;
      const matchesEquipment = equipmentFilter === 'all' || exercise.equipment === equipmentFilter;
      const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;

      return matchesSearch && matchesCategory && matchesEquipment && matchesDifficulty;
    });
  }, [searchTerm, categoryFilter, equipmentFilter, difficultyFilter]);

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
  };

  const handleUseExercise = () => {
    if (selectedExercise && onSelectExercise) {
      onSelectExercise(selectedExercise);
    }
  };

  return (
    <div className="exercise-library-page">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="library-container">
        {/* Header */}
        <div className="library-header">
          <h1>💪 Exercise Library</h1>
          <p>{exerciseLibrary.length} exercises to choose from</p>
        </div>

        {/* Search and Filters */}
        <div className="library-controls">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search exercises or muscle groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filters">
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {exerciseCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value)}
            >
              {equipmentTypes.map(eq => (
                <option key={eq.value} value={eq.value}>{eq.label}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              {difficultyLevels.map(diff => (
                <option key={diff.value} value={diff.value}>{diff.label}</option>
              ))}
            </select>
          </div>

          <div className="results-count">
            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="library-content">
          <div className="exercises-grid">
            {filteredExercises.map(exercise => (
              <div
                key={exercise.id}
                className={`exercise-card ${selectedExercise?.id === exercise.id ? 'selected' : ''}`}
                onClick={() => handleExerciseClick(exercise)}
              >
                <h3 className="exercise-name">{exercise.name}</h3>
                <div className="exercise-meta">
                  <span className={`difficulty-badge ${exercise.difficulty}`}>
                    {exercise.difficulty}
                  </span>
                  <span className="equipment-badge">{exercise.equipment}</span>
                </div>
                <div className="muscle-groups">
                  {exercise.muscleGroups.map((mg, i) => (
                    <span key={i} className="muscle-tag">{mg}</span>
                  ))}
                </div>
              </div>
            ))}

            {filteredExercises.length === 0 && (
              <div className="no-exercises">
                <p>No exercises found matching your filters.</p>
                <button onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setEquipmentFilter('all');
                  setDifficultyFilter('all');
                }}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Exercise Detail Panel */}
          {selectedExercise && (
            <div className="exercise-detail">
              <h2>{selectedExercise.name}</h2>

              <div className="detail-badges">
                <span className={`difficulty-badge ${selectedExercise.difficulty}`}>
                  {selectedExercise.difficulty}
                </span>
                <span className="category-badge">{selectedExercise.category}</span>
                <span className="equipment-badge">{selectedExercise.equipment}</span>
              </div>

              <div className="detail-section">
                <h4>Target Muscles</h4>
                <div className="muscle-groups">
                  {selectedExercise.muscleGroups.map((mg, i) => (
                    <span key={i} className="muscle-tag">{mg}</span>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4>How to Perform</h4>
                <p>{selectedExercise.description}</p>
              </div>

              {onSelectExercise && (
                <button className="use-exercise-btn" onClick={handleUseExercise}>
                  Use This Exercise
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExerciseLibrary;
