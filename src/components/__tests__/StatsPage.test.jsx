/**
 * Tests for StatsPage component
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatsPage from '../StatsPage';
import apiService from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    getProfile: vi.fn(),
    getMeasurements: vi.fn(),
    getWorkouts: vi.fn(),
    getMeals: vi.fn(),
    calculateTDEE: vi.fn(),
    addMeasurement: vi.fn(),
    updateProfile: vi.fn(),
  }
}));

describe('StatsPage', () => {
  const mockUser = {
    id: '123',
    email: 'test@broncofit.com',
    name: 'Test User'
  };

  const mockProfile = {
    id: '1',
    user_id: '123',
    age: 28,
    sex: 'male',
    height_cm: 178,
    current_weight_kg: 80.8,
    target_weight_kg: 75.0,
    activity_level: 'moderate',
    fitness_goal: 'lose_weight',
    updated_at: new Date().toISOString()
  };

  const mockTDEE = {
    bmr: 1850,
    maintenance_calories: 2400,
    weight_loss_calories: 1900,
    weight_gain_calories: 2900
  };

  const mockMeasurements = [
    {
      id: '3',
      user_id: '123',
      weight_kg: 80.8,
      measurement_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      user_id: '123',
      weight_kg: 81.5,
      measurement_date: new Date(Date.now() - 7 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 7 * 86400000).toISOString()
    },
    {
      id: '1',
      user_id: '123',
      weight_kg: 82.0,
      measurement_date: new Date(Date.now() - 14 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 14 * 86400000).toISOString()
    }
  ];

  const mockWorkouts = [
    {
      id: 'w1',
      user_id: '123',
      workout_name: 'Upper Body Strength',
      workout_date: new Date().toISOString(),
      duration_minutes: 60,
      exercises: [
        {
          exercise_name: 'Bench Press',
          exercise_type: 'strength',
          sets: 3,
          reps: 10,
          weight_kg: 80,
          notes: 'Good form'
        }
      ],
      notes: 'Great workout'
    }
  ];

  const mockMeals = [
    {
      id: 'm1',
      user_id: '123',
      meal_type: 'breakfast',
      meal_date: new Date().toISOString(),
      total_calories: 500,
      total_protein_g: 30,
      total_carbs_g: 50,
      total_fat_g: 15
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      apiService.getProfile.mockImplementation(() => new Promise(() => {}));
      render(<StatsPage user={mockUser} onBack={vi.fn()} />);
      expect(screen.getByText(/loading your stats/i)).toBeInTheDocument();
    });

    it('should render stats page after loading', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/your stats/i)).toBeInTheDocument();
    });
  });

  describe('Profile Summary', () => {
    it('should display profile summary with dual TDEE values (Maintenance and Target)', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      const { container } = render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const summaryCard = container.querySelector('.profile-summary-card');
      expect(summaryCard).toBeInTheDocument();

      expect(screen.getByText(/height/i)).toBeInTheDocument();
      expect(screen.getByText(/current weight/i)).toBeInTheDocument();

      expect(screen.getByText(/maintenance \(tdee\)/i)).toBeInTheDocument();
      expect(screen.getByText(/2400 cal/i)).toBeInTheDocument();

      expect(screen.getByText(/target \(cut\)/i)).toBeInTheDocument();
      expect(screen.getByText(/1900 cal/i)).toBeInTheDocument();
    });
  });

  describe('Interactions (Modals)', () => {
    beforeEach(() => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);
    });

    it('should open weight modal and submit new weight', async () => {
      apiService.addMeasurement.mockResolvedValue({ id: 'new', weight_kg: 85 });

      render(<StatsPage user={mockUser} onBack={vi.fn()} />);
      await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

      const logButton = screen.getByText(/\+ log weight/i);
      fireEvent.click(logButton);

      expect(screen.getByText(/log current weight/i)).toBeInTheDocument();

      const input = screen.getByPlaceholderText(/e.g. 165.5/i);
      fireEvent.change(input, { target: { value: '180' } });

      const saveButton = screen.getByText(/save/i);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(apiService.addMeasurement).toHaveBeenCalledWith(
          expect.objectContaining({
            weight_kg: expect.closeTo(81.64, 1),
            notes: 'Manual entry from Stats'
          })
        );
      });
    });

    it('should open profile modal and update goals', async () => {
      apiService.updateProfile.mockResolvedValue({ ...mockProfile, fitness_goal: 'gain_muscle' });

      render(<StatsPage user={mockUser} onBack={vi.fn()} />);
      await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

      const editButton = screen.getByTitle(/edit goals & activity/i);
      fireEvent.click(editButton);

      expect(screen.getByText(/edit goals & activity/i)).toBeInTheDocument();

      const goalSelect = screen.getByLabelText(/fitness goal/i);
      fireEvent.change(goalSelect, { target: { value: 'gain_muscle' } });

      const updateButton = screen.getByText(/update profile/i);
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(apiService.updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            fitness_goal: 'gain_muscle'
          })
        );
      });
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);
    });

    it('should render all four tab buttons', async () => {
      render(<StatsPage user={mockUser} onBack={vi.fn()} />);
      await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());
      expect(screen.getByText(/⚖️ weight/i)).toBeInTheDocument();
      expect(screen.getByText(/💪 workouts/i)).toBeInTheDocument();
    });

    it('should switch tabs correctly', async () => {
      render(<StatsPage user={mockUser} onBack={vi.fn()} />);
      await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

      const workoutsTab = screen.getByText(/💪 workouts/i);
      fireEvent.click(workoutsTab);
      expect(screen.getByText(/recent workouts/i)).toBeInTheDocument();
    });
  });
});
