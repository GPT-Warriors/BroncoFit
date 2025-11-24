/**
 * Tests for WorkoutLogger component
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkoutLogger from '../WorkoutLogger';
import apiService from '../../services/api';

// Mock the API service
vi.mock('../../services/api', () => ({
  default: {
    createWorkout: vi.fn(),
  }
}));

describe('WorkoutLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render workout logger form', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      expect(screen.getByRole('heading', { name: /log workout/i })).toBeInTheDocument();
      expect(screen.getByText(/track your training session/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/upper body strength/i)).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      expect(screen.getByText('← Back')).toBeInTheDocument();
    });

    it('should call back function when back button is clicked', () => {
      const mockOnBack = vi.fn();
      render(<WorkoutLogger onBack={mockOnBack} onSuccess={vi.fn()} />);

      const backButton = screen.getByText('← Back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should render exercise input by default', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      expect(screen.getByPlaceholderText(/bench press/i)).toBeInTheDocument();
      expect(screen.getByText(/exercise name/i)).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('should render all workout detail fields', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      expect(screen.getByPlaceholderText(/upper body strength/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^60$/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/how did it go/i)).toBeInTheDocument();
    });

    it('should render exercise type selector', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const typeSelects = screen.getAllByRole('combobox');
      expect(typeSelects.length).toBeGreaterThan(0);
      expect(typeSelects[0].value).toBe('strength');
    });

    it('should update workout name when input changes', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/upper body strength/i);
      fireEvent.change(nameInput, { target: { value: 'Leg Day' } });

      expect(nameInput.value).toBe('Leg Day');
    });

    it('should update duration when input changes', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const durationInput = screen.getByPlaceholderText(/^60$/i);
      fireEvent.change(durationInput, { target: { value: '45' } });

      expect(durationInput.value).toBe('45');
    });

    it('should update notes when input changes', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const notesInput = screen.getByPlaceholderText(/how did it go/i);
      fireEvent.change(notesInput, { target: { value: 'Great workout!' } });

      expect(notesInput.value).toBe('Great workout!');
    });
  });

  describe('Exercise Management', () => {
    it('should add new exercise when add button is clicked', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const addButton = screen.getByText(/add exercise/i);
      fireEvent.click(addButton);

      const exerciseInputs = screen.getAllByPlaceholderText(/bench press/i);
      expect(exerciseInputs.length).toBe(2);
    });

    it('should remove exercise when remove button is clicked', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const addButton = screen.getByText(/add exercise/i);
      fireEvent.click(addButton);

      const removeButtons = screen.getAllByText('✕');
      expect(removeButtons.length).toBeGreaterThan(0);

      fireEvent.click(removeButtons[0]);

      const exerciseInputs = screen.getAllByPlaceholderText(/bench press/i);
      expect(exerciseInputs.length).toBe(1);
    });

    it('should not show remove button when only one exercise', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const removeButtons = screen.queryAllByText('✕');
      // Remove button should not be present for single exercise
      expect(removeButtons.filter(btn => btn.closest('.exercise-card')).length).toBe(0);
    });

    it('should update exercise name when input changes', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const exerciseInput = screen.getByPlaceholderText(/bench press/i);
      fireEvent.change(exerciseInput, { target: { value: 'Squats' } });

      expect(exerciseInput.value).toBe('Squats');
    });

    it('should update exercise type when selector changes', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const typeSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(typeSelect, { target: { value: 'cardio' } });

      expect(typeSelect.value).toBe('cardio');
    });

    it('should show strength-specific fields for strength exercises', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      expect(screen.getByPlaceholderText(/^3$/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^10$/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^135$/i)).toBeInTheDocument();
    });

    it('should update sets when input changes', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const setsInput = screen.getByPlaceholderText(/^3$/i);
      fireEvent.change(setsInput, { target: { value: '4' } });

      expect(setsInput.value).toBe('4');
    });

    it('should update reps when input changes', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const repsInputs = screen.getAllByPlaceholderText(/^10$/i);
      const repsInput = repsInputs[0];
      fireEvent.change(repsInput, { target: { value: '12' } });

      expect(repsInput.value).toBe('12');
    });

    it('should update weight when input changes', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const weightInput = screen.getByPlaceholderText(/^135$/i);
      fireEvent.change(weightInput, { target: { value: '135' } });

      expect(weightInput.value).toBe('135');
    });
  });

  describe('Form Validation', () => {
    it('should show error when workout name is empty', async () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const submitButton = screen.getByRole('button', { name: /log workout/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a workout name/i)).toBeInTheDocument();
      });
    });

    it('should show error when no exercises are added', async () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/upper body strength/i);
      fireEvent.change(nameInput, { target: { value: 'Test Workout' } });

      const exerciseInput = screen.getByPlaceholderText(/bench press/i);
      fireEvent.change(exerciseInput, { target: { value: '' } });

      const submitButton = screen.getByRole('button', { name: /log workout/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please add at least one exercise/i)).toBeInTheDocument();
      });
    });

    it('should not submit if workout name is missing', async () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const exerciseInput = screen.getByPlaceholderText(/bench press/i);
      fireEvent.change(exerciseInput, { target: { value: 'Bench Press' } });

      const submitButton = screen.getByRole('button', { name: /log workout/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.createWorkout).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      apiService.createWorkout.mockResolvedValue({ id: 'w1' });

      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/upper body strength/i);
      fireEvent.change(nameInput, { target: { value: 'Upper Body' } });

      const durationInput = screen.getByPlaceholderText(/^60$/i);
      fireEvent.change(durationInput, { target: { value: '60' } });

      const exerciseInput = screen.getByPlaceholderText(/bench press/i);
      fireEvent.change(exerciseInput, { target: { value: 'Bench Press' } });

      const setsInput = screen.getByPlaceholderText(/^3$/i);
      fireEvent.change(setsInput, { target: { value: '3' } });

      const repsInputs = screen.getAllByPlaceholderText(/^10$/i);
      const repsInput = repsInputs[0];
      fireEvent.change(repsInput, { target: { value: '10' } });

      const weightInput = screen.getByPlaceholderText(/^135$/i);
      fireEvent.change(weightInput, { target: { value: '135' } });

      const submitButton = screen.getByRole('button', { name: /log workout/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.createWorkout).toHaveBeenCalled();
      });

      const callArgs = apiService.createWorkout.mock.calls[0][0];
      expect(callArgs.workout_name).toBe('Upper Body');
      expect(callArgs.duration_minutes).toBe(60);
      expect(callArgs.exercises[0].exercise_name).toBe('Bench Press');
      expect(callArgs.exercises[0].sets).toBe(3);
      expect(callArgs.exercises[0].reps).toBe(10);
    });

    it('should convert weight from lbs to kg', async () => {
      apiService.createWorkout.mockResolvedValue({ id: 'w1' });

      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/upper body strength/i);
      fireEvent.change(nameInput, { target: { value: 'Test' } });

      const exerciseInput = screen.getByPlaceholderText(/bench press/i);
      fireEvent.change(exerciseInput, { target: { value: 'Bench Press' } });

      const weightInput = screen.getByPlaceholderText(/^135$/i);
      fireEvent.change(weightInput, { target: { value: '135' } }); // 135 lbs ≈ 61.2 kg

      const submitButton = screen.getByRole('button', { name: /log workout/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.createWorkout).toHaveBeenCalled();
      });

      const callArgs = apiService.createWorkout.mock.calls[0][0];
      expect(callArgs.exercises[0].weight_kg).toBeCloseTo(61.2, 1);
    });

    it('should call onSuccess after successful submission', async () => {
      const mockOnSuccess = vi.fn();
      apiService.createWorkout.mockResolvedValue({ id: 'w1' });

      render(<WorkoutLogger onBack={vi.fn()} onSuccess={mockOnSuccess} />);

      const nameInput = screen.getByPlaceholderText(/upper body strength/i);
      fireEvent.change(nameInput, { target: { value: 'Test Workout' } });

      const exerciseInput = screen.getByPlaceholderText(/bench press/i);
      fireEvent.change(exerciseInput, { target: { value: 'Bench Press' } });

      const submitButton = screen.getByRole('button', { name: /log workout/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should reset form after successful submission', async () => {
      apiService.createWorkout.mockResolvedValue({ id: 'w1' });

      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/upper body strength/i);
      fireEvent.change(nameInput, { target: { value: 'Test Workout' } });

      const exerciseInput = screen.getByPlaceholderText(/bench press/i);
      fireEvent.change(exerciseInput, { target: { value: 'Bench Press' } });

      const submitButton = screen.getByRole('button', { name: /log workout/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(nameInput.value).toBe('');
        expect(exerciseInput.value).toBe('');
      });
    });

    it('should display error message on submission failure', async () => {
      apiService.createWorkout.mockRejectedValue(new Error('Failed to create workout'));

      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/upper body strength/i);
      fireEvent.change(nameInput, { target: { value: 'Test Workout' } });

      const exerciseInput = screen.getByPlaceholderText(/bench press/i);
      fireEvent.change(exerciseInput, { target: { value: 'Bench Press' } });

      const submitButton = screen.getByRole('button', { name: /log workout/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to create workout/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      apiService.createWorkout.mockImplementation(() => new Promise(() => {}));

      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/upper body strength/i);
      fireEvent.change(nameInput, { target: { value: 'Test Workout' } });

      const exerciseInput = screen.getByPlaceholderText(/bench press/i);
      fireEvent.change(exerciseInput, { target: { value: 'Bench Press' } });

      const submitButton = screen.getByRole('button', { name: /log workout/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/saving/i)).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Exercise Types', () => {
    it('should render all exercise type options', () => {
      render(<WorkoutLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const typeSelects = screen.getAllByRole('combobox');
      expect(typeSelects.length).toBeGreaterThan(0);
      const typeSelect = typeSelects[0];
      const options = Array.from(typeSelect.options).map(opt => opt.value);

      expect(options).toContain('strength');
      expect(options).toContain('cardio');
      expect(options).toContain('flexibility');
      expect(options).toContain('sports');
    });
  });

  describe('Cancel Button', () => {
    it('should call onBack when cancel button is clicked', () => {
      const mockOnBack = vi.fn();
      render(<WorkoutLogger onBack={mockOnBack} onSuccess={vi.fn()} />);

      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });
});

