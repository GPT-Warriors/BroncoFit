/**
 * Tests for ExerciseLibrary component
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExerciseLibrary from '../ExerciseLibrary';

describe('ExerciseLibrary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render exercise library page', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      expect(screen.getByText(/exercise library/i)).toBeInTheDocument();
      expect(screen.getByText(/exercises to choose from/i)).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      expect(screen.getByText('← Back')).toBeInTheDocument();
    });

    it('should call back function when back button is clicked', () => {
      const mockOnBack = vi.fn();
      render(<ExerciseLibrary onBack={mockOnBack} />);

      const backButton = screen.getByText('← Back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should render search input', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      expect(screen.getByPlaceholderText(/search exercises/i)).toBeInTheDocument();
    });

    it('should render filter selects', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      expect(screen.getByText(/all categories/i)).toBeInTheDocument();
      expect(screen.getByText(/all equipment/i)).toBeInTheDocument();
      expect(screen.getByText(/all levels/i)).toBeInTheDocument();
    });
  });

  describe('Exercise Display', () => {
    it('should display exercises', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      // Should display exercises from the library
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Squat')).toBeInTheDocument();
    });

    it('should display exercise cards with metadata', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      // Check for exercise names
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Deadlift')).toBeInTheDocument();
    });

    it('should show results count', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      // Should show count of filtered exercises
      expect(screen.getByText(/exercises found/i)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should filter exercises by search term', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const searchInput = screen.getByPlaceholderText(/search exercises/i);
      fireEvent.change(searchInput, { target: { value: 'bench' } });

      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      // Should filter out exercises that don't match
      expect(screen.queryByText('Deadlift')).not.toBeInTheDocument();
    });

    it('should filter by exercise name', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const searchInput = screen.getByPlaceholderText(/search exercises/i);
      fireEvent.change(searchInput, { target: { value: 'squat' } });

      expect(screen.getByText('Squat')).toBeInTheDocument();
      expect(screen.getByText('Front Squat')).toBeInTheDocument();
    });

    it('should filter by muscle groups', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const searchInput = screen.getByPlaceholderText(/search exercises/i);
      fireEvent.change(searchInput, { target: { value: 'chest' } });

      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Push-ups')).toBeInTheDocument();
    });

    it('should show no results when search matches nothing', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const searchInput = screen.getByPlaceholderText(/search exercises/i);
      fireEvent.change(searchInput, { target: { value: 'xyz123nonexistent' } });

      expect(screen.getByText(/no exercises found/i)).toBeInTheDocument();
      expect(screen.getByText(/clear filters/i)).toBeInTheDocument();
    });

    it('should clear search when clear filters is clicked', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const searchInput = screen.getByPlaceholderText(/search exercises/i);
      fireEvent.change(searchInput, { target: { value: 'bench' } });

      expect(screen.getByText('Bench Press')).toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: 'xyz123nonexistent' } });
      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      fireEvent.click(clearButton);

      expect(searchInput.value).toBe('');
      // Should show all exercises again
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Deadlift')).toBeInTheDocument();
    });
  });

  describe('Filter Functionality', () => {
    it('should filter by category', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const selects = screen.getAllByRole('combobox');
      const categorySelect = selects.find(select => 
        Array.from(select.options).some(opt => opt.textContent.includes('All Categories'))
      ) || selects[0];
      fireEvent.change(categorySelect, { target: { value: 'cardio' } });

      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('Cycling')).toBeInTheDocument();
      // Strength exercises should not appear
      expect(screen.queryByText('Bench Press')).not.toBeInTheDocument();
    });

    it('should filter by equipment', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const selects = screen.getAllByRole('combobox');
      const equipmentSelect = selects.find(select => 
        Array.from(select.options).some(opt => opt.textContent.includes('All Equipment'))
      ) || selects[1];
      fireEvent.change(equipmentSelect, { target: { value: 'bodyweight' } });

      expect(screen.getByText('Push-ups')).toBeInTheDocument();
      expect(screen.getByText('Pull-ups')).toBeInTheDocument();
      // Barbell exercises should not appear
      expect(screen.queryByText('Bench Press')).not.toBeInTheDocument();
    });

    it('should filter by difficulty', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const selects = screen.getAllByRole('combobox');
      const difficultySelect = selects.find(select => 
        Array.from(select.options).some(opt => opt.textContent.includes('All Levels'))
      ) || selects[2];
      fireEvent.change(difficultySelect, { target: { value: 'beginner' } });

      expect(screen.getByText('Push-ups')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
      // Advanced exercises should not appear
      expect(screen.queryByText('Clean and Jerk')).not.toBeInTheDocument();
    });

    it('should combine multiple filters', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const selects = screen.getAllByRole('combobox');
      const categorySelect = selects.find(select => 
        Array.from(select.options).some(opt => opt.textContent.includes('All Categories'))
      ) || selects[0];
      fireEvent.change(categorySelect, { target: { value: 'strength' } });

      const equipmentSelect = selects.find(select => 
        Array.from(select.options).some(opt => opt.textContent.includes('All Equipment'))
      ) || selects[1];
      fireEvent.change(equipmentSelect, { target: { value: 'barbell' } });

      const difficultySelect = selects.find(select => 
        Array.from(select.options).some(opt => opt.textContent.includes('All Levels'))
      ) || selects[2];
      fireEvent.change(difficultySelect, { target: { value: 'intermediate' } });

      // Should only show strength, barbell, intermediate exercises
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Squat')).toBeInTheDocument();
      // Advanced barbell exercises should not appear
      expect(screen.queryByText('Clean and Jerk')).not.toBeInTheDocument();
      // Bodyweight exercises should not appear
      expect(screen.queryByText('Push-ups')).not.toBeInTheDocument();
    });

    it('should reset filters when clear filters is clicked', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const selects = screen.getAllByRole('combobox');
      const categorySelect = selects.find(select => 
        Array.from(select.options).some(opt => opt.textContent.includes('All Categories'))
      ) || selects[0];
      fireEvent.change(categorySelect, { target: { value: 'cardio' } });

      const equipmentSelect = selects.find(select => 
        Array.from(select.options).some(opt => opt.textContent.includes('All Equipment'))
      ) || selects[1];
      fireEvent.change(equipmentSelect, { target: { value: 'bodyweight' } });

      const difficultySelect = selects.find(select => 
        Array.from(select.options).some(opt => opt.textContent.includes('All Levels'))
      ) || selects[2];
      fireEvent.change(difficultySelect, { target: { value: 'beginner' } });

      const searchInput = screen.getByPlaceholderText(/search exercises/i);
      fireEvent.change(searchInput, { target: { value: 'xyz123nonexistent' } });
      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      fireEvent.click(clearButton);

      // Filters should be reset to 'all'
      expect(categorySelect.value).toBe('all');
      expect(equipmentSelect.value).toBe('all');
      expect(difficultySelect.value).toBe('all');
    });
  });

  describe('Exercise Selection', () => {
    it('should select exercise when clicked', () => {
      const { container } = render(<ExerciseLibrary onBack={vi.fn()} />);

      const benchPressText = screen.getByText('Bench Press');
      const exerciseCard = benchPressText.closest('.exercise-card') || 
                          benchPressText.closest('div');
      fireEvent.click(exerciseCard);

      // Exercise detail panel should appear
      expect(screen.getByText(/target muscles/i)).toBeInTheDocument();
      expect(screen.getByText(/how to perform/i)).toBeInTheDocument();
    });

    it('should display exercise details when selected', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const benchPressText = screen.getByText('Bench Press');
      const exerciseCard = benchPressText.closest('.exercise-card') || 
                          benchPressText.closest('div');
      fireEvent.click(exerciseCard);

      // Should show exercise name in detail panel
      const detailHeaders = screen.getAllByText('Bench Press');
      expect(detailHeaders.length).toBeGreaterThan(1);
    });

    it('should display exercise description', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const benchPressText = screen.getByText('Bench Press');
      const exerciseCard = benchPressText.closest('.exercise-card') || 
                          benchPressText.closest('div');
      fireEvent.click(exerciseCard);

      // Should show description
      expect(screen.getByText(/lie on a bench/i)).toBeInTheDocument();
    });

    it('should display muscle groups', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const benchPressText = screen.getByText('Bench Press');
      const exerciseCard = benchPressText.closest('.exercise-card') || 
                          benchPressText.closest('div');
      fireEvent.click(exerciseCard);

      // Should show muscle groups
      expect(screen.getByText(/target muscles/i)).toBeInTheDocument();
    });

    it('should display difficulty and equipment badges', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const benchPressText = screen.getByText('Bench Press');
      const exerciseCard = benchPressText.closest('.exercise-card') || 
                          benchPressText.closest('div');
      fireEvent.click(exerciseCard);

      // Should show difficulty and equipment info
      const detailHeading = screen.getByRole('heading', { level: 2, name: /bench press/i });
      const detailPanel = detailHeading.closest('.exercise-detail') || detailHeading.parentElement;
      const detailBadges = detailPanel.querySelector('.detail-badges') || detailPanel;
      expect(within(detailBadges).getByText(/intermediate/i)).toBeInTheDocument();
      expect(within(detailBadges).getByText(/barbell/i)).toBeInTheDocument();
    });

    it('should highlight selected exercise card', () => {
      const { container } = render(<ExerciseLibrary onBack={vi.fn()} />);

      const benchPressText = screen.getByText('Bench Press');
      const exerciseCard = benchPressText.closest('.exercise-card') || 
                          benchPressText.closest('div');
      fireEvent.click(exerciseCard);

      // Selected card should have 'selected' class
      expect(exerciseCard).toHaveClass('selected');
    });

    it('should deselect when different exercise is clicked', () => {
      const { container } = render(<ExerciseLibrary onBack={vi.fn()} />);

      const benchPressText = screen.getByText('Bench Press');
      const benchPressCard = benchPressText.closest('.exercise-card') || 
                            benchPressText.closest('div');
      fireEvent.click(benchPressCard);

      expect(benchPressCard).toHaveClass('selected');

      const squatText = screen.getByText('Squat');
      const squatCard = squatText.closest('.exercise-card') || 
                       squatText.closest('div');
      fireEvent.click(squatCard);

      // Previous selection should be deselected
      expect(benchPressCard).not.toHaveClass('selected');
      expect(squatCard).toHaveClass('selected');
    });
  });

  describe('Use Exercise Functionality', () => {
    it('should render use exercise button when onSelectExercise is provided', () => {
      const mockOnSelectExercise = vi.fn();
      render(<ExerciseLibrary onBack={vi.fn()} onSelectExercise={mockOnSelectExercise} />);

      const benchPressText = screen.getByText('Bench Press');
      const exerciseCard = benchPressText.closest('.exercise-card') || 
                          benchPressText.closest('div');
      fireEvent.click(exerciseCard);

      expect(screen.getByText(/use this exercise/i)).toBeInTheDocument();
    });

    it('should not render use exercise button when onSelectExercise is not provided', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const benchPressText = screen.getByText('Bench Press');
      const exerciseCard = benchPressText.closest('.exercise-card') || 
                          benchPressText.closest('div');
      fireEvent.click(exerciseCard);

      expect(screen.queryByText(/use this exercise/i)).not.toBeInTheDocument();
    });

    it('should call onSelectExercise when use button is clicked', () => {
      const mockOnSelectExercise = vi.fn();
      render(<ExerciseLibrary onBack={vi.fn()} onSelectExercise={mockOnSelectExercise} />);

      const benchPressText = screen.getByText('Bench Press');
      const exerciseCard = benchPressText.closest('.exercise-card') || 
                          benchPressText.closest('div');
      fireEvent.click(exerciseCard);

      const useButton = screen.getByText(/use this exercise/i);
      fireEvent.click(useButton);

      expect(mockOnSelectExercise).toHaveBeenCalled();
    });

    it('should pass correct exercise data to onSelectExercise', () => {
      const mockOnSelectExercise = vi.fn();
      render(<ExerciseLibrary onBack={vi.fn()} onSelectExercise={mockOnSelectExercise} />);

      const benchPressText = screen.getByText('Bench Press');
      const exerciseCard = benchPressText.closest('.exercise-card') || 
                          benchPressText.closest('div');
      fireEvent.click(exerciseCard);

      const useButton = screen.getByText(/use this exercise/i);
      fireEvent.click(useButton);

      expect(mockOnSelectExercise).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Bench Press',
          category: 'strength'
        })
      );
    });
  });

  describe('Results Count', () => {
    it('should update results count when filters change', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const initialCount = screen.getByText(/exercises found/i).textContent;

      const categorySelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(categorySelect, { target: { value: 'cardio' } });

      const newCount = screen.getByText(/exercises found/i).textContent;
      expect(newCount).not.toBe(initialCount);
    });

    it('should show correct singular/plural form', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      const searchInput = screen.getByPlaceholderText(/search exercises/i);
      fireEvent.change(searchInput, { target: { value: 'xyz123nonexistent' } });

      expect(screen.getByText(/0 exercises found/i)).toBeInTheDocument();
    });
  });

  describe('Exercise Metadata Display', () => {
    it('should display difficulty badges on exercise cards', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      // Should show difficulty level on cards
      const benchCard = screen.getByText('Bench Press').closest('.exercise-card') ||
        screen.getByText('Bench Press').closest('div');
      const pushupCard = screen.getByText('Push-ups').closest('.exercise-card') ||
        screen.getByText('Push-ups').closest('div');
      expect(within(benchCard).getByText(/intermediate/i)).toBeInTheDocument();
      expect(within(pushupCard).getByText(/beginner/i)).toBeInTheDocument();
    });

    it('should display equipment badges on exercise cards', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      // Should show equipment info
      const benchCard = screen.getByText('Bench Press').closest('.exercise-card') ||
        screen.getByText('Bench Press').closest('div');
      const pushupCard = screen.getByText('Push-ups').closest('.exercise-card') ||
        screen.getByText('Push-ups').closest('div');
      expect(within(benchCard).getByText(/barbell/i)).toBeInTheDocument();
      expect(within(pushupCard).getByText(/bodyweight/i)).toBeInTheDocument();
    });

    it('should display muscle group tags on exercise cards', () => {
      render(<ExerciseLibrary onBack={vi.fn()} />);

      // Should show muscle groups
      const benchCard = screen.getByText('Bench Press').closest('.exercise-card') ||
        screen.getByText('Bench Press').closest('div');
      const squatCard = screen.getByText('Squat').closest('.exercise-card') ||
        screen.getByText('Squat').closest('div');
      expect(within(benchCard).getByText(/^chest$/i)).toBeInTheDocument();
      expect(within(squatCard).getByText(/quads/i)).toBeInTheDocument();
    });
  });
});

