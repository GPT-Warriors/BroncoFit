/**
 * Tests for LoginPage component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../LoginPage';
import apiService from '../../services/api';

// Mock the API service
vi.mock('../../services/api', () => ({
  default: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  }
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    render(<LoginPage onSuccess={vi.fn()} onBack={vi.fn()} />);

    expect(screen.getByPlaceholderText(/john@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    const mockOnSuccess = vi.fn();
    const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };

    apiService.login.mockResolvedValue({
      access_token: 'test_token',
      token_type: 'bearer'
    });
    apiService.getCurrentUser.mockResolvedValue(mockUser);

    render(<LoginPage onSuccess={mockOnSuccess} onBack={vi.fn()} />);

    const emailInput = screen.getByPlaceholderText(/john@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(apiService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should display error on failed login', async () => {
    apiService.login.mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginPage onSuccess={vi.fn()} onBack={vi.fn()} />);

    const emailInput = screen.getByPlaceholderText(/john@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('should switch to signup page', () => {
    const mockOnBack = vi.fn();

    render(<LoginPage onSuccess={vi.fn()} onBack={mockOnBack} />);

    const signupLink = screen.getByText(/sign up here/i);
    fireEvent.click(signupLink);

    expect(mockOnBack).toHaveBeenCalled();
  });
});
