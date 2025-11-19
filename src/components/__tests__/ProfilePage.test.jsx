/**
 * Tests for ProfilePage component
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from '../ProfilePage';
import apiService from '../../services/api';

// Mock the API service
vi.mock('../../services/api', () => ({
  default: {
    getProfile: vi.fn(),
    getMeasurements: vi.fn(),
    addMeasurement: vi.fn(),
  }
}));

describe('ProfilePage', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User'
  };

  const mockProfile = {
    user_id: '123',
    age: 25,
    sex: 'male',
    height_cm: 180,
    current_weight_kg: 80,
    target_weight_kg: 75,
    activity_level: 'moderate',
    fitness_goal: 'lose_weight',
    updated_at: new Date().toISOString()
  };

  const mockMeasurements = [
    {
      id: '1',
      weight_kg: 80,
      recorded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Starting weight'
    },
    {
      id: '2',
      weight_kg: 79.5,
      recorded_at: new Date().toISOString(),
      notes: 'Week 1'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    apiService.getProfile.mockImplementation(() => new Promise(() => {}));
    apiService.getMeasurements.mockImplementation(() => new Promise(() => {}));

    render(<ProfilePage user={mockUser} onBack={vi.fn()} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display profile data when loaded', async () => {
    apiService.getProfile.mockResolvedValue(mockProfile);
    apiService.getMeasurements.mockResolvedValue(mockMeasurements);

    render(<ProfilePage user={mockUser} onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check if statistics card is displayed
    expect(screen.getByText(/your statistics/i)).toBeInTheDocument();
    // Check if user name is displayed
    expect(screen.getByText(/test user/i)).toBeInTheDocument();
  });

  it('should handle profile not found', async () => {
    apiService.getProfile.mockRejectedValue(new Error('Profile not found'));
    apiService.getMeasurements.mockResolvedValue([]);

    render(<ProfilePage user={mockUser} onBack={vi.fn()} />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Should show save profile button (new inline form)
    expect(screen.getByRole('button', { name: /save profile/i })).toBeInTheDocument();
  });

  it('should call API to get measurements', async () => {
    apiService.getProfile.mockResolvedValue(mockProfile);
    apiService.getMeasurements.mockResolvedValue(mockMeasurements);

    render(<ProfilePage user={mockUser} onBack={vi.fn()} />);

    await waitFor(() => {
      expect(apiService.getMeasurements).toHaveBeenCalled();
    });
  });
});
