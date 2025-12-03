/**
 * Tests for DashboardPage component
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../DashboardPage';
import apiService from '../../services/api';

// Mock the API service
vi.mock('../../services/api', () => ({
  default: {
    getProfile: vi.fn(),
    getTodaysNutritionSummary: vi.fn(),
    getLatestMeasurement: vi.fn(),
    getLatestWorkout: vi.fn(),
    calculateTDEE: vi.fn(),
  },
}));

describe('DashboardPage', () => {
  const mockUser = {
    id: '123',
    email: 'test@broncofit.com',
    name: 'Test User',
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
    updated_at: new Date().toISOString(),
  };

  const mockTDEE = {
    bmr: 1850,
    maintenance_calories: 2400,
    weight_loss_calories: 1900,
    weight_gain_calories: 2900,
  };

  const mockNutrition = {
    total_calories: 1800,
    total_protein_g: 120,
    total_carbs_g: 200,
    total_fat_g: 60,
    meals_logged: 3,
  };

  const mockMeasurement = {
    id: '1',
    user_id: '123',
    weight_kg: 80.8,
    measurement_date: new Date().toISOString(),
  };

  const mockWorkout = {
    id: 'w1',
    user_id: '123',
    workout_name: 'Upper Body Strength',
    workout_date: new Date().toISOString(),
    duration_minutes: 60,
    exercises: [{ exercise_name: 'Bench Press', sets: 3, reps: 10 }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      apiService.getProfile.mockImplementation(() => new Promise(() => {}));
      apiService.getTodaysNutritionSummary.mockImplementation(() => new Promise(() => {}));
      apiService.getLatestMeasurement.mockImplementation(() => new Promise(() => {}));

      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      expect(screen.getByText(/loading your dashboard/i)).toBeInTheDocument();
    });

    it('should render dashboard after loading', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getTodaysNutritionSummary.mockResolvedValue(mockNutrition);
      apiService.getLatestMeasurement.mockResolvedValue(mockMeasurement);
      apiService.getLatestWorkout.mockResolvedValue(mockWorkout);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      expect(screen.getByText(/let's crush your fitness goals today/i)).toBeInTheDocument();
    });

    it('should call back function when back button is clicked', async () => {
      const mockOnBack = vi.fn();
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getTodaysNutritionSummary.mockResolvedValue(mockNutrition);
      apiService.getLatestMeasurement.mockResolvedValue(mockMeasurement);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<DashboardPage user={mockUser} onBack={mockOnBack} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const backButton = screen.getByText('← Back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('Stats Cards', () => {
    beforeEach(() => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getTodaysNutritionSummary.mockResolvedValue(mockNutrition);
      apiService.getLatestMeasurement.mockResolvedValue(mockMeasurement);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);
    });

    it('should display current weight card', async () => {
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/current weight/i)).toBeInTheDocument();

      // Weight number and unit are separate spans now
      expect(screen.getByText('178.1')).toBeInTheDocument();
      // At least one "lbs" unit should exist on the page
      expect(screen.getAllByText('lbs')[0]).toBeInTheDocument();

      // Target text remains combined
      expect(screen.getByText(/target: 165\.3 lbs/i)).toBeInTheDocument();
    });

    it('should display calories card with progress', async () => {
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/today's calories/i)).toBeInTheDocument();
      expect(screen.getByText(/1800/i)).toBeInTheDocument();
      expect(screen.getByText(/goal: 2400 kcal/i)).toBeInTheDocument();
    });

    it('should display macros card', async () => {
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/macros today/i)).toBeInTheDocument();
      expect(screen.getByText(/120g/i)).toBeInTheDocument();
      expect(screen.getByText(/200g/i)).toBeInTheDocument();
      expect(screen.getByText(/60g/i)).toBeInTheDocument();
    });

    it('should display latest workout card when workout exists', async () => {
      apiService.getLatestWorkout.mockResolvedValue(mockWorkout);

      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/latest workout/i)).toBeInTheDocument();
      expect(screen.getByText('Upper Body Strength')).toBeInTheDocument();
      expect(screen.getByText(/60 min/i)).toBeInTheDocument();
    });

    it('should display no workout message when no workouts', async () => {
      apiService.getLatestWorkout.mockRejectedValue(new Error('No workouts'));

      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/no workouts logged yet/i)).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    beforeEach(() => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getTodaysNutritionSummary.mockResolvedValue(mockNutrition);
      apiService.getLatestMeasurement.mockResolvedValue(mockMeasurement);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);
    });

    it('should render all quick action buttons', async () => {
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /log workout/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log meal/i })).toBeInTheDocument();
      expect(screen.getByText(/exercises/i)).toBeInTheDocument();
      expect(screen.getByText(/ai coach/i)).toBeInTheDocument();
    });

    it('should navigate to workout log when clicked', async () => {
      const mockOnNavigate = vi.fn();
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /log workout/i }));
      expect(mockOnNavigate).toHaveBeenCalledWith('workout-log');
    });

    it('should navigate to nutrition log when clicked', async () => {
      const mockOnNavigate = vi.fn();
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /log meal/i }));
      expect(mockOnNavigate).toHaveBeenCalledWith('nutrition-log');
    });

    it('should navigate to exercises when clicked', async () => {
      const mockOnNavigate = vi.fn();
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/exercises/i));
      expect(mockOnNavigate).toHaveBeenCalledWith('exercises');
    });

    it('should navigate to AI coach when clicked', async () => {
      const mockOnNavigate = vi.fn();
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/ai coach/i));
      expect(mockOnNavigate).toHaveBeenCalledWith('coach');
    });
  });

  describe('Recent Activity', () => {
    beforeEach(() => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getTodaysNutritionSummary.mockResolvedValue(mockNutrition);
      apiService.getLatestMeasurement.mockResolvedValue(mockMeasurement);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);
    });

    it('should display recent activity section', async () => {
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
      expect(screen.getByText(/view all/i)).toBeInTheDocument();
    });

    it('should display meal activity when meals logged', async () => {
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);
      await waitFor(() => {
        expect(screen.getByText(/logged 3 meal/i)).toBeInTheDocument();
      });
    });

    it('should display workout activity when workout exists', async () => {
      apiService.getLatestWorkout.mockResolvedValue(mockWorkout);
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);
      await waitFor(() => {
        expect(screen.getByText(/completed upper body strength/i)).toBeInTheDocument();
      });
    });

    it('should display measurement activity when measurement exists', async () => {
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);
      await waitFor(() => {
        expect(screen.getByText(/updated weight to 178\.1 lbs/i)).toBeInTheDocument();
      });
    });

    it('should show no activity message when no activity', async () => {
      apiService.getTodaysNutritionSummary.mockResolvedValue({ meals_logged: 0 });
      apiService.getLatestWorkout.mockRejectedValue(new Error('No workouts'));
      apiService.getLatestMeasurement.mockRejectedValue(new Error('No measurements'));

      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/no recent activity/i)).toBeInTheDocument();
    });

    it('should navigate to profile when view all is clicked', async () => {
      const mockOnNavigate = vi.fn();
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={mockOnNavigate} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/view all/i));
      expect(mockOnNavigate).toHaveBeenCalledWith('profile');
    });
  });

  describe('API Integration', () => {
    it('should call all required APIs on mount', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getTodaysNutritionSummary.mockResolvedValue(mockNutrition);
      apiService.getLatestMeasurement.mockResolvedValue(mockMeasurement);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(apiService.getProfile).toHaveBeenCalled();
        expect(apiService.getTodaysNutritionSummary).toHaveBeenCalled();
        expect(apiService.getLatestMeasurement).toHaveBeenCalled();
        expect(apiService.calculateTDEE).toHaveBeenCalled();
      });
    });

    it('should handle API errors gracefully', async () => {
      apiService.getProfile.mockRejectedValue(new Error('API Error'));
      apiService.getTodaysNutritionSummary.mockRejectedValue(new Error('API Error'));
      apiService.getLatestMeasurement.mockRejectedValue(new Error('API Error'));

      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });

    it('should handle missing data gracefully', async () => {
      apiService.getProfile.mockResolvedValue(null);
      apiService.getTodaysNutritionSummary.mockResolvedValue(null);
      apiService.getLatestMeasurement.mockResolvedValue(null);
      apiService.getLatestWorkout.mockRejectedValue(new Error('No workouts'));

      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const placeholders = screen.getAllByText(/---/i);
      expect(placeholders.length).toBeGreaterThan(0);
    });
  });

  describe('Data Display', () => {
    it('should convert weight from kg to lbs correctly', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getTodaysNutritionSummary.mockResolvedValue(mockNutrition);
      apiService.getLatestMeasurement.mockResolvedValue(mockMeasurement);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Weight number and unit rendered separately
      expect(screen.getByText('178.1')).toBeInTheDocument();
      expect(screen.getAllByText('lbs')[0]).toBeInTheDocument();
    });

    it('should display user name correctly', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getTodaysNutritionSummary.mockResolvedValue(mockNutrition);
      apiService.getLatestMeasurement.mockResolvedValue(mockMeasurement);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/welcome back, test/i)).toBeInTheDocument();
    });

    it('should use profile weight when no measurement exists', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getTodaysNutritionSummary.mockResolvedValue(mockNutrition);
      apiService.getLatestMeasurement.mockRejectedValue(new Error('No measurements'));
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText('178.1')).toBeInTheDocument();
    });
  });
});
