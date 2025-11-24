/**
 * Tests for StatsPage component
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatsPage from '../StatsPage';
import apiService from '../../services/api';

// Mock the API service
vi.mock('../../services/api', () => ({
  default: {
    getProfile: vi.fn(),
    getMeasurements: vi.fn(),
    getWorkouts: vi.fn(),
    getMeals: vi.fn(),
    calculateTDEE: vi.fn(),
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
        },
        {
          exercise_name: 'Pull-ups',
          exercise_type: 'strength',
          sets: 3,
          reps: 8,
          weight_kg: null
        }
      ],
      notes: 'Great workout'
    },
    {
      id: 'w2',
      user_id: '123',
      workout_name: 'Lower Body',
      workout_date: new Date(Date.now() - 2 * 86400000).toISOString(),
      duration_minutes: 45,
      exercises: [
        {
          exercise_name: 'Squats',
          exercise_type: 'strength',
          sets: 4,
          reps: 12,
          weight_kg: 100
        }
      ]
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
    },
    {
      id: 'm2',
      user_id: '123',
      meal_type: 'lunch',
      meal_date: new Date().toISOString(),
      total_calories: 700,
      total_protein_g: 40,
      total_carbs_g: 70,
      total_fat_g: 20
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      apiService.getProfile.mockImplementation(() => new Promise(() => {}));
      apiService.getMeasurements.mockImplementation(() => new Promise(() => {}));
      apiService.getWorkouts.mockImplementation(() => new Promise(() => {}));
      apiService.getMeals.mockImplementation(() => new Promise(() => {}));

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
      expect(screen.getByText(/track your progress and achievements/i)).toBeInTheDocument();
    });

    it('should call back function when back button is clicked', async () => {
      const mockOnBack = vi.fn();
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<StatsPage user={mockUser} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const backButton = screen.getByText('← Back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('Profile Summary', () => {
    it('should display profile summary with height, weight, target, and TDEE', async () => {
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
      expect(screen.getByText(/target weight/i)).toBeInTheDocument();
      expect(screen.getByText(/tdee/i)).toBeInTheDocument();
      expect(screen.getByText(/2400 cal/i)).toBeInTheDocument();
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

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/⚖️ weight/i)).toBeInTheDocument();
      expect(screen.getByText(/💪 workouts/i)).toBeInTheDocument();
      expect(screen.getByText(/🍽️ nutrition/i)).toBeInTheDocument();
      expect(screen.getByText(/🏆 prs/i)).toBeInTheDocument();
    });

    it('should show weight tab by default', async () => {
      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/weight progress/i)).toBeInTheDocument();
    });

    it('should switch to workouts tab when clicked', async () => {
      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const workoutsTab = screen.getByText(/💪 workouts/i);
      fireEvent.click(workoutsTab);

      expect(screen.getByText(/workout history/i)).toBeInTheDocument();
    });

    it('should switch to nutrition tab when clicked', async () => {
      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const nutritionTab = screen.getByText(/🍽️ nutrition/i);
      fireEvent.click(nutritionTab);

      expect(screen.getByText(/nutrition analytics/i)).toBeInTheDocument();
    });

    it('should switch to PRs tab when clicked', async () => {
      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const prsTab = screen.getByText(/🏆 prs/i);
      fireEvent.click(prsTab);

      expect(screen.getByText(/personal records/i)).toBeInTheDocument();
    });
  });

  describe('Weight Tab', () => {
    it('should display weight chart when measurements exist', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      const { container } = render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/weight progress/i)).toBeInTheDocument();
      expect(container.querySelector('.chart-container')).toBeInTheDocument();
    });

    it('should show no data message when no measurements', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue([]);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/no weight measurements yet/i)).toBeInTheDocument();
    });

    it('should display recent measurements list', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      const { container } = render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText(/recent measurements/i)).toBeInTheDocument();
      });

      const measurementItems = container.querySelectorAll('.measurement-item');
      expect(measurementItems.length).toBeGreaterThan(0);
    });
  });

  describe('Workouts Tab', () => {
    it('should display workout history', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const workoutsTab = screen.getByText(/💪 workouts/i);
      fireEvent.click(workoutsTab);

      expect(screen.getByText(/workout history/i)).toBeInTheDocument();
      expect(screen.getByText('Upper Body Strength')).toBeInTheDocument();
      expect(screen.getByText('Lower Body')).toBeInTheDocument();
    });

    it('should expand workout details when clicked', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      const { container } = render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const workoutsTab = screen.getByText(/💪 workouts/i);
      fireEvent.click(workoutsTab);

      const workoutHeader = container.querySelector('.workout-header-clickable');
      fireEvent.click(workoutHeader);

      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeInTheDocument();
      });
    });

    it('should show no data message when no workouts', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue([]);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const workoutsTab = screen.getByText(/💪 workouts/i);
      fireEvent.click(workoutsTab);

      expect(screen.getByText(/no workouts logged yet/i)).toBeInTheDocument();
    });
  });

  describe('Nutrition Tab', () => {
    it('should display nutrition analytics with charts', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const nutritionTab = screen.getByText(/🍽️ nutrition/i);
      fireEvent.click(nutritionTab);

      expect(screen.getByText(/nutrition analytics/i)).toBeInTheDocument();
      expect(screen.getByText(/daily calories/i)).toBeInTheDocument();
      expect(screen.getByText(/macronutrients breakdown/i)).toBeInTheDocument();
    });

    it('should show no data message when no meals', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue([]);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const nutritionTab = screen.getByText(/🍽️ nutrition/i);
      fireEvent.click(nutritionTab);

      expect(screen.getByText(/no nutrition data yet/i)).toBeInTheDocument();
    });
  });

  describe('PRs Tab', () => {
    it('should calculate and display personal records from workouts', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const prsTab = screen.getByText(/🏆 prs/i);
      fireEvent.click(prsTab);

      expect(screen.getByText(/personal records/i)).toBeInTheDocument();
      expect(screen.getByText('Squats')).toBeInTheDocument();
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
    });

    it('should show no data message when no PRs', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue([]);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const prsTab = screen.getByText(/🏆 prs/i);
      fireEvent.click(prsTab);

      expect(screen.getByText(/no personal records yet/i)).toBeInTheDocument();
    });

    it('should sort PRs by weight descending', async () => {
      const workoutsWithPRs = [
        {
          id: 'w1',
          workout_date: new Date().toISOString(),
          exercises: [
            { exercise_name: 'Bench Press', exercise_type: 'strength', weight_kg: 80, reps: 5 },
            { exercise_name: 'Squat', exercise_type: 'strength', weight_kg: 100, reps: 5 },
            { exercise_name: 'Deadlift', exercise_type: 'strength', weight_kg: 120, reps: 5 }
          ]
        }
      ];

      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(workoutsWithPRs);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      const { container } = render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const prsTab = screen.getByText(/🏆 prs/i);
      fireEvent.click(prsTab);

      const prCards = container.querySelectorAll('.pr-card');
      // Deadlift (120kg = 264.5 lbs) should be #1
      expect(prCards[0]).toHaveTextContent('#1');
      expect(prCards[0]).toHaveTextContent('Deadlift');
    });
  });

  describe('API Integration', () => {
    it('should call all required APIs on mount', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(apiService.getProfile).toHaveBeenCalled();
        expect(apiService.getMeasurements).toHaveBeenCalledWith(30);
        expect(apiService.getWorkouts).toHaveBeenCalledWith(20);
        expect(apiService.getMeals).toHaveBeenCalledWith(30);
        expect(apiService.calculateTDEE).toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', async () => {
      apiService.getProfile.mockRejectedValue(new Error('API Error'));
      apiService.getMeasurements.mockRejectedValue(new Error('API Error'));
      apiService.getWorkouts.mockRejectedValue(new Error('API Error'));
      apiService.getMeals.mockRejectedValue(new Error('API Error'));

      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Should render without crashing
      expect(screen.getByText(/your stats/i)).toBeInTheDocument();
    });
  });

  describe('Data Conversion', () => {
    it('should convert weight from kg to lbs correctly', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // 80.8 kg ≈ 178.1 lbs (appears in both summary and measurements list)
      const weights = screen.getAllByText(/178\.1 lbs/i);
      expect(weights.length).toBeGreaterThan(0);
    });

    it('should convert height from cm to feet and inches', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getMeasurements.mockResolvedValue(mockMeasurements);
      apiService.getWorkouts.mockResolvedValue(mockWorkouts);
      apiService.getMeals.mockResolvedValue(mockMeals);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<StatsPage user={mockUser} onBack={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // 178 cm ≈ 5'10"
      expect(screen.getByText(/5'10"/i)).toBeInTheDocument();
    });
  });
});
