/**
 * Tests for AICoachPage component
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AICoachPage from '../AICoachPage';
import apiService from '../../services/api';

// Mock the API service
vi.mock('../../services/api', () => ({
  default: {
    chatWithCoach: vi.fn(),
    suggestWorkout: vi.fn(),
    createWorkout: vi.fn(),
  }
}));

describe('AICoachPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render AI coach page with initial message', () => {
      render(<AICoachPage onBack={vi.fn()} />);

      expect(screen.getByRole('heading', { name: /ai fitness coach/i })).toBeInTheDocument();
      expect(screen.getByText(/I can create personalized workouts/i)).toBeInTheDocument();
      expect(screen.getByText(/online/i)).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(<AICoachPage onBack={vi.fn()} />);

      expect(screen.getByText('← Back')).toBeInTheDocument();
    });

    it('should call back function when back button is clicked', () => {
      const mockOnBack = vi.fn();
      render(<AICoachPage onBack={mockOnBack} />);

      const backButton = screen.getByText('← Back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should render feature banner', () => {
      render(<AICoachPage onBack={vi.fn()} />);

      expect(screen.getByText(/ai workout generator/i)).toBeInTheDocument();
      expect(screen.getByText(/ask me to create a workout/i)).toBeInTheDocument();
    });

    it('should render message input form', () => {
      render(<AICoachPage onBack={vi.fn()} />);

      expect(screen.getByPlaceholderText(/ask me anything about fitness/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /➤/i })).toBeInTheDocument();
    });
  });

  describe('Quick Questions', () => {
    it('should render all quick question buttons', () => {
      render(<AICoachPage onBack={vi.fn()} />);

      expect(screen.getByText(/generate workout/i)).toBeInTheDocument();
      expect(screen.getByText(/meal suggestions/i)).toBeInTheDocument();
      expect(screen.getByText(/check progress/i)).toBeInTheDocument();
      expect(screen.getByText(/nutrition tips/i)).toBeInTheDocument();
      expect(screen.getByText(/exercise guide/i)).toBeInTheDocument();
    });

    it('should populate input when quick question is clicked', () => {
      render(<AICoachPage onBack={vi.fn()} />);

      const workoutButton = screen.getByText(/generate workout/i);
      fireEvent.click(workoutButton);

      const input = screen.getByPlaceholderText(/ask me anything about fitness/i);
      expect(input.value).toContain('workout plan');
    });
  });

  describe('Chat Functionality', () => {
    it('should send message when form is submitted', async () => {
      const mockResponse = {
        response: 'Great question! Here is some advice...',
        timestamp: new Date().toISOString()
      };
      apiService.chatWithCoach.mockResolvedValue(mockResponse);

      render(<AICoachPage onBack={vi.fn()} />);

      const input = screen.getByPlaceholderText(/ask me anything about fitness/i);
      const submitButton = screen.getByRole('button', { name: /➤/i });

      fireEvent.change(input, { target: { value: 'What should I eat?' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.chatWithCoach).toHaveBeenCalled();
      });
    });

    it('should not send empty message', async () => {
      render(<AICoachPage onBack={vi.fn()} />);

      const submitButton = screen.getByRole('button', { name: /➤/i });
      fireEvent.click(submitButton);

      // Should not call API with empty message
      expect(apiService.chatWithCoach).not.toHaveBeenCalled();
    });

    it('should display user message in chat', async () => {
      const mockResponse = {
        response: 'Here is a response',
        timestamp: new Date().toISOString()
      };
      apiService.chatWithCoach.mockResolvedValue(mockResponse);

      render(<AICoachPage onBack={vi.fn()} />);

      const input = screen.getByPlaceholderText(/ask me anything about fitness/i);
      const submitButton = screen.getByRole('button', { name: /➤/i });

      fireEvent.change(input, { target: { value: 'Hello coach' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Hello coach')).toBeInTheDocument();
      });
    });

    it('should display assistant response in chat', async () => {
      const mockResponse = {
        response: 'Here is some fitness advice',
        timestamp: new Date().toISOString()
      };
      apiService.chatWithCoach.mockResolvedValue(mockResponse);

      render(<AICoachPage onBack={vi.fn()} />);

      const input = screen.getByPlaceholderText(/ask me anything about fitness/i);
      const submitButton = screen.getByRole('button', { name: /➤/i });

      fireEvent.change(input, { target: { value: 'How do I build muscle?' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Here is some fitness advice')).toBeInTheDocument();
      });
    });

    it('should show loading indicator while waiting for response', async () => {
      apiService.chatWithCoach.mockImplementation(() => new Promise(() => {}));

      render(<AICoachPage onBack={vi.fn()} />);

      const input = screen.getByPlaceholderText(/ask me anything about fitness/i);
      const submitButton = screen.getByRole('button', { name: /➤/i });

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(submitButton);

      // Should show loading/typing indicator
      await waitFor(() => {
        expect(screen.getByText(/⏳/i)).toBeInTheDocument();
      });
    });

    it('should display error message on API failure', async () => {
      apiService.chatWithCoach.mockRejectedValue(new Error('API Error'));

      render(<AICoachPage onBack={vi.fn()} />);

      const input = screen.getByPlaceholderText(/ask me anything about fitness/i);
      const submitButton = screen.getByRole('button', { name: /➤/i });

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/sorry, i'm having trouble connecting/i)).toBeInTheDocument();
      });
    });
  });

  describe('Workout Generation', () => {
    const mockWorkoutResponse = {
      success: true,
      message: 'Here is a great workout for you!',
      workout: {
        workout_name: 'Upper Body Blast',
        description: 'A great upper body workout',
        exercises: [
          {
            exercise_name: 'Bench Press',
            exercise_type: 'strength',
            sets: 3,
            reps: 10,
            weight_kg: 80
          },
          {
            exercise_name: 'Pull-ups',
            exercise_type: 'strength',
            sets: 3,
            reps: 8
          }
        ],
        notes: 'Focus on proper form'
      }
    };

    it('should detect workout request and call suggestWorkout', async () => {
      apiService.suggestWorkout.mockResolvedValue(mockWorkoutResponse);

      render(<AICoachPage onBack={vi.fn()} />);

      const input = screen.getByPlaceholderText(/ask me anything about fitness/i);
      const submitButton = screen.getByRole('button', { name: /➤/i });

      fireEvent.change(input, { target: { value: 'Create a workout for me' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.suggestWorkout).toHaveBeenCalledWith('Create a workout for me');
      });
    });

    it('should display suggested workout card', async () => {
      apiService.suggestWorkout.mockResolvedValue(mockWorkoutResponse);

      render(<AICoachPage onBack={vi.fn()} />);

      const input = screen.getByPlaceholderText(/ask me anything about fitness/i);
      const submitButton = screen.getByRole('button', { name: /➤/i });

      fireEvent.change(input, { target: { value: 'Create a workout plan' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Upper Body Blast')).toBeInTheDocument();
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
        expect(screen.getByText('Pull-ups')).toBeInTheDocument();
      });
    });

    it('should save workout when save button is clicked', async () => {
      apiService.suggestWorkout.mockResolvedValue(mockWorkoutResponse);
      apiService.createWorkout.mockResolvedValue({ id: 'w1' });

      render(<AICoachPage onBack={vi.fn()} />);

      const input = screen.getByPlaceholderText(/ask me anything about fitness/i);
      const submitButton = screen.getByRole('button', { name: /➤/i });

      fireEvent.change(input, { target: { value: 'Create a workout' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/save to workout log/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/save to workout log/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(apiService.createWorkout).toHaveBeenCalledWith(mockWorkoutResponse.workout);
      });
    });

    it('should display success message after saving workout', async () => {
      apiService.suggestWorkout.mockResolvedValue(mockWorkoutResponse);
      apiService.createWorkout.mockResolvedValue({ id: 'w1' });

      render(<AICoachPage onBack={vi.fn()} />);

      const input = screen.getByPlaceholderText(/ask me anything about fitness/i);
      const submitButton = screen.getByRole('button', { name: /➤/i });

      fireEvent.change(input, { target: { value: 'Create a workout' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/save to workout log/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/save to workout log/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/i've saved/i)).toBeInTheDocument();
      });
    });

    it('should display error message if workout save fails', async () => {
      apiService.suggestWorkout.mockResolvedValue(mockWorkoutResponse);
      apiService.createWorkout.mockRejectedValue(new Error('Save failed'));

      render(<AICoachPage onBack={vi.fn()} />);

      const input = screen.getByPlaceholderText(/ask me anything about fitness/i);
      const submitButton = screen.getByRole('button', { name: /➤/i });

      fireEvent.change(input, { target: { value: 'Create a workout' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/save to workout log/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByText(/save to workout log/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/sorry, i had trouble saving/i)).toBeInTheDocument();
      });
    });

    it('should close workout card when close button is clicked', async () => {
      apiService.suggestWorkout.mockResolvedValue(mockWorkoutResponse);

      render(<AICoachPage onBack={vi.fn()} />);

      const input = screen.getByPlaceholderText(/ask me anything about fitness/i);
      const submitButton = screen.getByRole('button', { name: /➤/i });

      fireEvent.change(input, { target: { value: 'Create a workout' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Upper Body Blast')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Upper Body Blast')).not.toBeInTheDocument();
      });
    });

    it('should fallback to regular chat if workout generation fails', async () => {
      apiService.suggestWorkout.mockResolvedValue({ success: false });
      const mockChatResponse = {
        response: 'Here is some advice',
        timestamp: new Date().toISOString()
      };
      apiService.chatWithCoach.mockResolvedValue(mockChatResponse);

      render(<AICoachPage onBack={vi.fn()} />);

      const input = screen.getByPlaceholderText(/ask me anything about fitness/i);
      const submitButton = screen.getByRole('button', { name: /➤/i });

      fireEvent.change(input, { target: { value: 'Create a workout' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.chatWithCoach).toHaveBeenCalled();
      });
    });
  });

  describe('Input Handling', () => {
    it('should clear input after sending message', async () => {
      const mockResponse = {
        response: 'Response',
        timestamp: new Date().toISOString()
      };
      apiService.chatWithCoach.mockResolvedValue(mockResponse);

      render(<AICoachPage onBack={vi.fn()} />);

      const input = screen.getByPlaceholderText(/ask me anything about fitness/i);
      const submitButton = screen.getByRole('button', { name: /➤/i });

      fireEvent.change(input, { target: { value: 'Test message' } });
      expect(input.value).toBe('Test message');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should disable input while loading', async () => {
      apiService.chatWithCoach.mockImplementation(() => new Promise(() => {}));

      render(<AICoachPage onBack={vi.fn()} />);

      const input = screen.getByPlaceholderText(/ask me anything about fitness/i);
      const submitButton = screen.getByRole('button', { name: /➤/i });

      fireEvent.change(input, { target: { value: 'Test' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(input).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
    });
  });
});

