/**
 * BroncoFit API Service
 * Handles all communication with the FastAPI backend
 *
 * To use mock API instead (for testing without backend):
 * import apiService from './services/mockApi'
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    const response = await this.request('/api/auth/register', {
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

    const response = await fetch(`${this.baseURL}/api/auth/login`, {
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
    return await this.request('/api/auth/me');
  }

  // ==================== Profile ====================
  async getProfile() {
    return await this.request('/api/profile');
  }

  async createProfile(profileData) {
    return await this.request('/api/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async updateProfile(profileData) {
    return await this.request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async deleteProfile() {
    return await this.request('/api/profile', {
      method: 'DELETE',
    });
  }

  // ==================== Calculations ====================
  async calculateTDEE(data) {
    return await this.request('/api/calculations/tdee', {
      method: 'POST',
      body: JSON.stringify(data),
      includeAuth: false, // TDEE calculation doesn't require auth
    });
  }

  async calculateBMI(heightCm, weightKg) {
    return await this.request('/api/calculations/bmi', {
      method: 'POST',
      body: JSON.stringify({ height_cm: heightCm, weight_kg: weightKg }),
      includeAuth: false,
    });
  }

  // ==================== Measurements ====================
  async getMeasurements(limit = 30, skip = 0) {
    return await this.request(`/api/measurements?limit=${limit}&skip=${skip}`);
  }

  async addMeasurement(measurementData) {
    return await this.request('/api/measurements', {
      method: 'POST',
      body: JSON.stringify(measurementData),
    });
  }

  async updateMeasurement(measurementId, measurementData) {
    return await this.request(`/api/measurements/${measurementId}`, {
      method: 'PUT',
      body: JSON.stringify(measurementData),
    });
  }

  async deleteMeasurement(measurementId) {
    return await this.request(`/api/measurements/${measurementId}`, {
      method: 'DELETE',
    });
  }

  async getLatestMeasurement() {
    return await this.request('/api/measurements/latest');
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
