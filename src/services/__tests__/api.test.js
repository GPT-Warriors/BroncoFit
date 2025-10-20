/**
 * Tests for API service
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import apiService from '../api';

// Mock fetch globally
global.fetch = vi.fn();

describe('ApiService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Health Check', () => {
    it('should perform health check successfully', async () => {
      const mockResponse = { status: 'healthy', service: 'BroncoFit API' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiService.healthCheck();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.any(Object)
      );
    });
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      };

      const mockResponse = {
        id: '123',
        email: userData.email,
        name: userData.name,
        created_at: new Date().toISOString()
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const result = await apiService.register(userData);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(userData),
        })
      );
    });

    it('should login successfully and store token', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse = {
        access_token: 'test_token_123',
        token_type: 'bearer'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiService.login(credentials.email, credentials.password);

      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('token')).toBe('test_token_123');
      expect(apiService.token).toBe('test_token_123');
    });

    it('should handle login failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Invalid credentials' }),
      });

      await expect(apiService.login('wrong@email.com', 'wrongpass'))
        .rejects.toThrow();
    });

    it('should logout and clear token', async () => {
      localStorage.setItem('token', 'test_token');
      apiService.token = 'test_token';

      await apiService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(apiService.token).toBeNull();
    });
  });

  describe('Profile Management', () => {
    beforeEach(() => {
      // Set up authenticated state
      localStorage.setItem('token', 'test_token');
      apiService.token = 'test_token';
    });

    it('should get user profile', async () => {
      const mockProfile = {
        user_id: '123',
        age: 25,
        sex: 'male',
        height_cm: 180,
        current_weight_kg: 80,
        activity_level: 'moderate',
        fitness_goal: 'lose_weight'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockProfile,
      });

      const result = await apiService.getProfile();

      expect(result).toEqual(mockProfile);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/profile'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test_token'
          })
        })
      );
    });

    it('should create a new profile', async () => {
      const profileData = {
        age: 25,
        sex: 'male',
        height_cm: 180,
        current_weight_kg: 80,
        target_weight_kg: 75,
        activity_level: 'moderate',
        fitness_goal: 'lose_weight'
      };

      const mockResponse = {
        ...profileData,
        user_id: '123',
        updated_at: new Date().toISOString()
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const result = await apiService.createProfile(profileData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiService.healthCheck()).rejects.toThrow();
    });

    it('should handle 404 errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Not found' }),
      });

      await expect(apiService.getProfile()).rejects.toThrow();
    });
  });
});
