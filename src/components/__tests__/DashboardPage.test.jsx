/**
 * Tests for DashboardPage component
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../DashboardPage';
import apiService from '../../services/api';

// Mocks
vi.mock('../../services/api', () => ({
  default: {
    getProfile: vi.fn(),
    getTodaysNutritionSummary: vi.fn(),
    getMeasurements: vi.fn(),
    getLatestWorkout: vi.fn(), 
    getWorkouts: vi.fn(),
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
    fitness_goal: 'lose_weight', // Default for tests
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
      // Return promises that never resolve to test loading state
      apiService.getProfile.mockImplementation(() => new Promise(() => {}));
      apiService.getTodaysNutritionSummary.mockImplementation(() => new Promise(() => {}));
      
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      expect(screen.getByText(/loading your dashboard/i)).toBeInTheDocument();
    });

    it('should render dashboard after loading', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getTodaysNutritionSummary.mockResolvedValue(mockNutrition);
      apiService.getMeasurements.mockResolvedValue([mockMeasurement]); 
      apiService.getWorkouts.mockResolvedValue([mockWorkout]);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      expect(screen.getByText(/let's crush your fitness goals today/i)).toBeInTheDocument();
    });
  });

  describe('Stats Cards', () => {
    beforeEach(() => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getTodaysNutritionSummary.mockResolvedValue(mockNutrition);
      apiService.getMeasurements.mockResolvedValue([mockMeasurement]);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);
      apiService.getWorkouts.mockResolvedValue([]);
    });

    it('should display current weight card', async () => {
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/current weight/i)).toBeInTheDocument();
      expect(screen.getByText('178.1')).toBeInTheDocument();
      expect(screen.getAllByText('lbs')[0]).toBeInTheDocument();
    });

    it('should display calories card', async () => {
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/today's calories/i)).toBeInTheDocument();
      expect(screen.getByText(/1800/)).toBeInTheDocument();
      expect(screen.getByText(/remaining:\s*100 kcal/i)).toBeInTheDocument();
    });

    it('should display TDEE card showing Fat Loss Target when goal is lose_weight', async () => {
      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/daily target/i)).toBeInTheDocument();
      expect(screen.getByText(/1900/)).toBeInTheDocument(); 
      expect(screen.getByText(/goal: fat loss target/i)).toBeInTheDocument();
    });

    it('should display TDEE card showing Bulking Target when goal is gain_muscle', async () => {
      const bulkProfile = { ...mockProfile, fitness_goal: 'gain_muscle' };
      apiService.getProfile.mockResolvedValue(bulkProfile);

      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/daily target/i)).toBeInTheDocument();
      expect(screen.getByText(/2900/)).toBeInTheDocument();
      expect(screen.getByText(/goal: bulking target/i)).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('should call getMeasurements with limit 1', async () => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getTodaysNutritionSummary.mockResolvedValue(mockNutrition);
      apiService.getMeasurements.mockResolvedValue([mockMeasurement]);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);
      apiService.getWorkouts.mockResolvedValue([]);

      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(apiService.getMeasurements).toHaveBeenCalledWith(1);
      });
    });

    it('should use measured weight for TDEE calculation if available', async () => {
      const heavyMeasurement = { ...mockMeasurement, weight_kg: 100 }; 
      apiService.getMeasurements.mockResolvedValue([heavyMeasurement]);
      apiService.getProfile.mockResolvedValue(mockProfile); 
      apiService.getTodaysNutritionSummary.mockResolvedValue(mockNutrition);
      apiService.getWorkouts.mockResolvedValue([]);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);

      render(<DashboardPage user={mockUser} onBack={vi.fn()} onNavigate={vi.fn()} />);

      await waitFor(() => {
        expect(apiService.calculateTDEE).toHaveBeenCalledWith(expect.objectContaining({
          weight_kg: 100 
        }));
      });
    });
  });

  describe('Quick Actions', () => {
    beforeEach(() => {
      apiService.getProfile.mockResolvedValue(mockProfile);
      apiService.getTodaysNutritionSummary.mockResolvedValue(mockNutrition);
      apiService.getMeasurements.mockResolvedValue([mockMeasurement]);
      apiService.calculateTDEE.mockResolvedValue(mockTDEE);
      apiService.getWorkouts.mockResolvedValue([]);
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
  });
});