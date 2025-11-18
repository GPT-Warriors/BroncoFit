/**
 * BroncoFit API Service
 * Handles all communication with the FastAPI backend
 *
 * To use mock API instead (for testing without backend):
 * import apiService from './services/mockApi'
 */

const API_BASE_URL = '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  // Helper method to get headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Helper method for API calls
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(options.includeAuth !== false),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ==================== Health Check ====================
  async healthCheck() {
    return await this.request('/health', { includeAuth: false });
  }

  // ==================== Authentication ====================
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      includeAuth: false,
    });
    return response;
  }

  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 spec uses 'username'
    formData.append('password', password);

    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    this.token = data.access_token;
    localStorage.setItem('token', data.access_token);
    return data;
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  // ==================== Profile ====================
  async getProfile() {
    return await this.request('/profile');
  }

  async createProfile(profileData) {
    return await this.request('/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async updateProfile(profileData) {
    return await this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async deleteProfile() {
    return await this.request('/profile', {
      method: 'DELETE',
    });
  }

  // ==================== Calculations ====================
  async calculateTDEE(data) {
    return await this.request('/calculations/tdee', {
      method: 'POST',
      body: JSON.stringify(data),
      includeAuth: false, // TDEE calculation doesn't require auth
    });
  }

  async calculateBMI(heightCm, weightKg) {
    return await this.request('/calculations/bmi', {
      method: 'POST',
      body: JSON.stringify({ height_cm: heightCm, weight_kg: weightKg }),
      includeAuth: false,
    });
  }

  // ==================== Measurements ====================
  async getMeasurements(limit = 30, skip = 0) {
    return await this.request(`/measurements?limit=${limit}&skip=${skip}`);
  }

  async addMeasurement(measurementData) {
    return await this.request('/measurements', {
      method: 'POST',
      body: JSON.stringify(measurementData),
    });
  }

  async updateMeasurement(measurementId, measurementData) {
    return await this.request(`/measurements/${measurementId}`, {
      method: 'PUT',
      body: JSON.stringify(measurementData),
    });
  }

  async deleteMeasurement(measurementId) {
    return await this.request(`/measurements/${measurementId}`, {
      method: 'DELETE',
    });
  }

  async getLatestMeasurement() {
    return await this.request('/measurements/latest');
  }

  // ==================== AI Coach ====================
  async chatWithCoach(message, conversationHistory = []) {
    return await this.request('/ai-coach/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory
      }),
    });
  }

  async generateWorkoutPlan(planRequest) {
    return await this.request('/ai-coach/generate-workout-plan', {
      method: 'POST',
      body: JSON.stringify(planRequest),
    });
  }

  async suggestWorkout(message) {
    return await this.request('/ai-coach/suggest-workout', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // ==================== Workouts ====================
  async getWorkouts(limit = 30, skip = 0) {
    return await this.request(`/workouts?limit=${limit}&skip=${skip}`);
  }

  async createWorkout(workoutData) {
    return await this.request('/workouts', {
      method: 'POST',
      body: JSON.stringify(workoutData),
    });
  }

  async getLatestWorkout() {
    return await this.request('/workouts/latest');
  }

  async updateWorkout(workoutId, workoutData) {
    return await this.request(`/workouts/${workoutId}`, {
      method: 'PUT',
      body: JSON.stringify(workoutData),
    });
  }

  async deleteWorkout(workoutId) {
    return await this.request(`/workouts/${workoutId}`, {
      method: 'DELETE',
    });
  }

  // ==================== Nutrition ====================
  async getMeals(limit = 30, skip = 0) {
    return await this.request(`/nutrition?limit=${limit}&skip=${skip}`);
  }

  async getTodaysMeals() {
    return await this.request('/nutrition/today');
  }

  async getTodaysNutritionSummary() {
    return await this.request('/nutrition/summary/today');
  }

  async createMeal(mealData) {
    return await this.request('/nutrition', {
      method: 'POST',
      body: JSON.stringify(mealData),
    });
  }

  async updateMeal(mealId, mealData) {
    return await this.request(`/nutrition/${mealId}`, {
      method: 'PUT',
      body: JSON.stringify(mealData),
    });
  }

  async deleteMeal(mealId) {
    return await this.request(`/nutrition/${mealId}`, {
      method: 'DELETE',
    });
  }

  // ==================== Helper Methods ====================
  isAuthenticated() {
    return !!this.token;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
