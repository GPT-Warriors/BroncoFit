/**
 * Tests for SignupPage component
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupPage from '../SignupPage';
import apiService from '../../services/api';

// Mock the API service
vi.mock('../../services/api', () => ({
  default: {
    register: vi.fn(),
    login: vi.fn(),
    createProfile: vi.fn(),
    getCurrentUser: vi.fn(),
  }
}));

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Component Rendering', () => {
    it('should render signup page with step 1', () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      expect(screen.getByText(/create account/i)).toBeInTheDocument();
      expect(screen.getByText(/let's start with your basic information/i)).toBeInTheDocument();
    });

    it('should render progress indicator', () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      const progress = screen.getByTestId('signup-progress');
      expect(within(progress).getByText(/account/i)).toBeInTheDocument();
      expect(within(progress).getByText(/profile/i)).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      expect(screen.getByText(/back to home/i)).toBeInTheDocument();
    });

    it('should call onBack when back button is clicked on step 1', () => {
      const mockOnBack = vi.fn();
      render(<SignupPage onSuccess={vi.fn()} onBack={mockOnBack} onNavigateToLogin={vi.fn()} />);

      const backButton = screen.getByText(/back to home/i);
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should render login link', () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/login here/i)).toBeInTheDocument();
    });

    it('should call onNavigateToLogin when login link is clicked', () => {
      const mockOnNavigateToLogin = vi.fn();
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={mockOnNavigateToLogin} />);

      const loginLink = screen.getByText(/login here/i);
      fireEvent.click(loginLink);

      expect(mockOnNavigateToLogin).toHaveBeenCalled();
    });
  });

  describe('Step 1: Account Information', () => {
    it('should render all step 1 form fields', () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('should update name when input changes', () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      expect(nameInput.value).toBe('Test User');
    });

    it('should update email when input changes', () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      const emailInput = screen.getByPlaceholderText(/john@example.com/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password when input changes', () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput.value).toBe('password123');
    });

    it('should update confirm password when input changes', () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      expect(confirmPasswordInput.value).toBe('password123');
    });
  });

  describe('Step 1 Validation', () => {
    it('should show error when name is missing', async () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      const emailInput = screen.getByPlaceholderText(/john@example.com/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      const nextButton = screen.getByText(/next: profile stats/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
      });
    });

    it('should show error when email is missing', async () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      const nextButton = screen.getByText(/next: profile stats/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
      });
    });

    it('should show error when password is too short', async () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const emailInput = screen.getByPlaceholderText(/john@example.com/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      fireEvent.change(passwordInput, { target: { value: 'short' } });

      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });

      const nextButton = screen.getByText(/next: profile stats/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const emailInput = screen.getByPlaceholderText(/john@example.com/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });

      const nextButton = screen.getByText(/next: profile stats/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should proceed to step 2 when validation passes', async () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const emailInput = screen.getByPlaceholderText(/john@example.com/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      const nextButton = screen.getByText(/next: profile stats/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getAllByText(/your fitness profile/i)[0]).toBeInTheDocument();
      });
    });
  });

  describe('Step 2: Profile Stats', () => {
    beforeEach(async () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      // Complete step 1 to get to step 2
      const nameInput = screen.getByPlaceholderText(/john doe/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const emailInput = screen.getByPlaceholderText(/john@example.com/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      const nextButton = screen.getByText(/next: profile stats/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getAllByText(/your fitness profile/i)[0]).toBeInTheDocument();
      });
    });

    it('should render all step 2 form fields', () => {
      expect(screen.getByLabelText(/^age$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^sex$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^height$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/current weight/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/target weight/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/activity level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fitness goal/i)).toBeInTheDocument();
    });

    it('should render back button with correct text', () => {
      expect(screen.getByText(/previous step/i)).toBeInTheDocument();
    });

    it('should go back to step 1 when previous step is clicked', async () => {
      const backButton = screen.getByText(/previous step/i);
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText(/create account/i)).toBeInTheDocument();
      });
    });

    it('should update age when input changes', () => {
      const ageInput = screen.getByPlaceholderText(/^25$/i);
      fireEvent.change(ageInput, { target: { value: '30' } });

      expect(ageInput.value).toBe('30');
    });

    it('should update sex when selector changes', () => {
      const sexSelect = screen.getByLabelText(/^sex$/i);
      fireEvent.change(sexSelect, { target: { value: 'male' } });

      expect(sexSelect.value).toBe('male');
    });

    it('should update height feet when input changes', () => {
      const heightFeetInput = screen.getByPlaceholderText(/^feet$/i);
      fireEvent.change(heightFeetInput, { target: { value: '5' } });

      expect(heightFeetInput.value).toBe('5');
    });

    it('should update height inches when input changes', () => {
      const heightInchesInput = screen.getByPlaceholderText(/^inches$/i);
      fireEvent.change(heightInchesInput, { target: { value: '9' } });

      expect(heightInchesInput.value).toBe('9');
    });

    it('should update current weight when input changes', () => {
      const currentWeightInput = screen.getByPlaceholderText(/^150$/i);
      fireEvent.change(currentWeightInput, { target: { value: '175' } });

      expect(currentWeightInput.value).toBe('175');
    });

    it('should update target weight when input changes', () => {
      const targetWeightInput = screen.getByPlaceholderText(/^140$/i);
      fireEvent.change(targetWeightInput, { target: { value: '160' } });

      expect(targetWeightInput.value).toBe('160');
    });

    it('should update activity level when selector changes', () => {
      const activitySelect = screen.getByLabelText(/activity level/i);
      fireEvent.change(activitySelect, { target: { value: 'moderate' } });

      expect(activitySelect.value).toBe('moderate');
    });

    it('should update fitness goal when selector changes', () => {
      const fitnessGoalSelect = screen.getByLabelText(/fitness goal/i);
      fireEvent.change(fitnessGoalSelect, { target: { value: 'lose_weight' } });

      expect(fitnessGoalSelect.value).toBe('lose_weight');
    });
  });

  describe('Step 2 Validation', () => {
    beforeEach(async () => {
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      // Complete step 1
      const nameInput = screen.getByPlaceholderText(/john doe/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const emailInput = screen.getByPlaceholderText(/john@example.com/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      const nextButton = screen.getByText(/next: profile stats/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getAllByText(/your fitness profile/i)[0]).toBeInTheDocument();
      });
    });

    it('should show error when age is missing', async () => {
      const sexSelect = screen.getByLabelText(/^sex$/i);
      fireEvent.change(sexSelect, { target: { value: 'male' } });

      const heightFeetInput = screen.getByPlaceholderText(/^feet$/i);
      fireEvent.change(heightFeetInput, { target: { value: '5' } });

      const heightInchesInput = screen.getByPlaceholderText(/^inches$/i);
      fireEvent.change(heightInchesInput, { target: { value: '9' } });

      const currentWeightInput = screen.getByPlaceholderText(/^150$/i);
      fireEvent.change(currentWeightInput, { target: { value: '175' } });

      const targetWeightInput = screen.getByPlaceholderText(/^140$/i);
      fireEvent.change(targetWeightInput, { target: { value: '160' } });

      const activitySelect = screen.getByLabelText(/activity level/i);
      fireEvent.change(activitySelect, { target: { value: 'moderate' } });

      const fitnessGoalSelect = screen.getByLabelText(/fitness goal/i);
      fireEvent.change(fitnessGoalSelect, { target: { value: 'lose_weight' } });

      const submitButton = screen.getByText(/complete sign up/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
      });
    });

    it('should show error when age is too young', async () => {
      const ageInput = screen.getByPlaceholderText(/^25$/i);
      fireEvent.change(ageInput, { target: { value: '12' } });

      const sexSelect = screen.getByLabelText(/^sex$/i);
      fireEvent.change(sexSelect, { target: { value: 'male' } });

      const heightFeetInput = screen.getByPlaceholderText(/^feet$/i);
      fireEvent.change(heightFeetInput, { target: { value: '5' } });

      const heightInchesInput = screen.getByPlaceholderText(/^inches$/i);
      fireEvent.change(heightInchesInput, { target: { value: '9' } });

      const currentWeightInput = screen.getByPlaceholderText(/^150$/i);
      fireEvent.change(currentWeightInput, { target: { value: '175' } });

      const targetWeightInput = screen.getByPlaceholderText(/^140$/i);
      fireEvent.change(targetWeightInput, { target: { value: '160' } });

      const activitySelect = screen.getByLabelText(/activity level/i);
      fireEvent.change(activitySelect, { target: { value: 'moderate' } });

      const fitnessGoalSelect = screen.getByLabelText(/fitness goal/i);
      fireEvent.change(fitnessGoalSelect, { target: { value: 'lose_weight' } });

      const submitButton = screen.getByText(/complete sign up/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/age must be between 13 and 120/i)).toBeInTheDocument();
      });
    });

    it('should show error when height is invalid', async () => {
      const ageInput = screen.getByPlaceholderText(/^25$/i);
      fireEvent.change(ageInput, { target: { value: '30' } });

      const sexSelect = screen.getByLabelText(/^sex$/i);
      fireEvent.change(sexSelect, { target: { value: 'male' } });

      const heightFeetInput = screen.getByPlaceholderText(/^feet$/i);
      fireEvent.change(heightFeetInput, { target: { value: '12' } }); // Invalid

      const heightInchesInput = screen.getByPlaceholderText(/^inches$/i);
      fireEvent.change(heightInchesInput, { target: { value: '9' } });

      const currentWeightInput = screen.getByPlaceholderText(/^150$/i);
      fireEvent.change(currentWeightInput, { target: { value: '175' } });

      const targetWeightInput = screen.getByPlaceholderText(/^140$/i);
      fireEvent.change(targetWeightInput, { target: { value: '160' } });

      const activitySelect = screen.getByLabelText(/activity level/i);
      fireEvent.change(activitySelect, { target: { value: 'moderate' } });

      const fitnessGoalSelect = screen.getByLabelText(/fitness goal/i);
      fireEvent.change(fitnessGoalSelect, { target: { value: 'lose_weight' } });

      const submitButton = screen.getByText(/complete sign up/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid height/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      apiService.register.mockResolvedValue({});
      apiService.login.mockResolvedValue({ access_token: 'token' });
      apiService.createProfile.mockResolvedValue({});
      apiService.getCurrentUser.mockResolvedValue({ id: '1', email: 'test@example.com', name: 'Test User' });
    });

    it('should submit form with valid data', async () => {
      const mockOnSuccess = vi.fn();

      render(<SignupPage onSuccess={mockOnSuccess} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      // Complete step 1
      const nameInput = screen.getByPlaceholderText(/john doe/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const emailInput = screen.getByPlaceholderText(/john@example.com/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      const nextButton = screen.getByText(/next: profile stats/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/your fitness profile/i)).toBeInTheDocument();
      });

      // Fill step 2
      const ageInput = screen.getByPlaceholderText(/^25$/i);
      fireEvent.change(ageInput, { target: { value: '30' } });

      const sexSelect = screen.getByLabelText(/^sex$/i);
      fireEvent.change(sexSelect, { target: { value: 'male' } });

      const heightFeetInput = screen.getByPlaceholderText(/^feet$/i);
      fireEvent.change(heightFeetInput, { target: { value: '5' } });

      const heightInchesInput = screen.getByPlaceholderText(/^inches$/i);
      fireEvent.change(heightInchesInput, { target: { value: '10' } });

      const currentWeightInput = screen.getByPlaceholderText(/^150$/i);
      fireEvent.change(currentWeightInput, { target: { value: '175' } });

      const targetWeightInput = screen.getByPlaceholderText(/^140$/i);
      fireEvent.change(targetWeightInput, { target: { value: '160' } });

      const activitySelect = screen.getByLabelText(/activity level/i);
      fireEvent.change(activitySelect, { target: { value: 'moderate' } });

      const fitnessGoalSelect = screen.getByLabelText(/fitness goal/i);
      fireEvent.change(fitnessGoalSelect, { target: { value: 'lose_weight' } });

      const submitButton = screen.getByText(/complete sign up/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.register).toHaveBeenCalled();
        expect(apiService.login).toHaveBeenCalled();
        expect(apiService.createProfile).toHaveBeenCalled();
      });
    });

    it('should convert height from feet/inches to cm', async () => {
      // Complete step 1 again for this test
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const emailInput = screen.getByPlaceholderText(/john@example.com/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      const nextButton = screen.getByText(/next: profile stats/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getAllByText(/your fitness profile/i)[0]).toBeInTheDocument();
      });

      const heightFeetInput = screen.getByPlaceholderText(/^feet$/i);
      fireEvent.change(heightFeetInput, { target: { value: '5' } });

      const heightInchesInput = screen.getByPlaceholderText(/^inches$/i);
      fireEvent.change(heightInchesInput, { target: { value: '10' } });

      // Fill rest of form
      const ageInput = screen.getByPlaceholderText(/^25$/i);
      fireEvent.change(ageInput, { target: { value: '30' } });

      const sexSelect = screen.getByLabelText(/^sex$/i);
      fireEvent.change(sexSelect, { target: { value: 'male' } });

      const currentWeightInput = screen.getByPlaceholderText(/^150$/i);
      fireEvent.change(currentWeightInput, { target: { value: '175' } });

      const targetWeightInput = screen.getByPlaceholderText(/^140$/i);
      fireEvent.change(targetWeightInput, { target: { value: '160' } });

      const activitySelect = screen.getByLabelText(/activity level/i);
      fireEvent.change(activitySelect, { target: { value: 'moderate' } });

      const fitnessGoalSelect = screen.getByLabelText(/fitness goal/i);
      fireEvent.change(fitnessGoalSelect, { target: { value: 'lose_weight' } });

      const submitButton = screen.getByText(/complete sign up/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.createProfile).toHaveBeenCalled();
      });

      const callArgs = apiService.createProfile.mock.calls[0][0];
      // 5'10" = 70 inches = 177.8 cm
      expect(callArgs.height_cm).toBeCloseTo(177.8, 1);
    });

    it('should convert weight from lbs to kg', async () => {
      // Complete step 1 again
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const emailInput = screen.getByPlaceholderText(/john@example.com/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      const nextButton = screen.getByText(/next: profile stats/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getAllByText(/your fitness profile/i)[0]).toBeInTheDocument();
      });

      const currentWeightInput = screen.getByPlaceholderText(/^150$/i);
      fireEvent.change(currentWeightInput, { target: { value: '175' } });

      const targetWeightInput = screen.getByPlaceholderText(/^140$/i);
      fireEvent.change(targetWeightInput, { target: { value: '160' } });

      // Fill rest of form
      const ageInput = screen.getByPlaceholderText(/^25$/i);
      fireEvent.change(ageInput, { target: { value: '30' } });

      const sexSelect = screen.getByLabelText(/^sex$/i);
      fireEvent.change(sexSelect, { target: { value: 'male' } });

      const heightFeetInput = screen.getByPlaceholderText(/^feet$/i);
      fireEvent.change(heightFeetInput, { target: { value: '5' } });

      const heightInchesInput = screen.getByPlaceholderText(/^inches$/i);
      fireEvent.change(heightInchesInput, { target: { value: '10' } });

      const activitySelect = screen.getByLabelText(/activity level/i);
      fireEvent.change(activitySelect, { target: { value: 'moderate' } });

      const fitnessGoalSelect = screen.getByLabelText(/fitness goal/i);
      fireEvent.change(fitnessGoalSelect, { target: { value: 'lose_weight' } });

      const submitButton = screen.getByText(/complete sign up/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.createProfile).toHaveBeenCalled();
      });

      const callArgs = apiService.createProfile.mock.calls[0][0];
      // 175 lbs ≈ 79.4 kg
      expect(callArgs.current_weight_kg).toBeCloseTo(79.4, 1);
      // 160 lbs ≈ 72.6 kg
      expect(callArgs.target_weight_kg).toBeCloseTo(72.6, 1);
    });

    it('should call onSuccess after successful signup', async () => {
      const mockOnSuccess = vi.fn();

      // Complete step 1 again
      render(<SignupPage onSuccess={mockOnSuccess} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const emailInput = screen.getByPlaceholderText(/john@example.com/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      const nextButton = screen.getByText(/next: profile stats/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getAllByText(/your fitness profile/i)[0]).toBeInTheDocument();
      });

      // Fill step 2
      const ageInput = screen.getByPlaceholderText(/^25$/i);
      fireEvent.change(ageInput, { target: { value: '30' } });

      const sexSelect = screen.getByLabelText(/^sex$/i);
      fireEvent.change(sexSelect, { target: { value: 'male' } });

      const heightFeetInput = screen.getByPlaceholderText(/^feet$/i);
      fireEvent.change(heightFeetInput, { target: { value: '5' } });

      const heightInchesInput = screen.getByPlaceholderText(/^inches$/i);
      fireEvent.change(heightInchesInput, { target: { value: '10' } });

      const currentWeightInput = screen.getByPlaceholderText(/^150$/i);
      fireEvent.change(currentWeightInput, { target: { value: '175' } });

      const targetWeightInput = screen.getByPlaceholderText(/^140$/i);
      fireEvent.change(targetWeightInput, { target: { value: '160' } });

      const activitySelect = screen.getByLabelText(/activity level/i);
      fireEvent.change(activitySelect, { target: { value: 'moderate' } });

      const fitnessGoalSelect = screen.getByLabelText(/fitness goal/i);
      fireEvent.change(fitnessGoalSelect, { target: { value: 'lose_weight' } });

      const submitButton = screen.getByText(/complete sign up/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should display error message on submission failure', async () => {
      apiService.register.mockRejectedValue(new Error('Registration failed'));

      // Complete step 1 again
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const emailInput = screen.getByPlaceholderText(/john@example.com/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      const nextButton = screen.getByText(/next: profile stats/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getAllByText(/your fitness profile/i)[0]).toBeInTheDocument();
      });

      // Fill step 2
      const ageInput = screen.getByPlaceholderText(/^25$/i);
      fireEvent.change(ageInput, { target: { value: '30' } });

      const sexSelect = screen.getByLabelText(/^sex$/i);
      fireEvent.change(sexSelect, { target: { value: 'male' } });

      const heightFeetInput = screen.getByPlaceholderText(/^feet$/i);
      fireEvent.change(heightFeetInput, { target: { value: '5' } });

      const heightInchesInput = screen.getByPlaceholderText(/^inches$/i);
      fireEvent.change(heightInchesInput, { target: { value: '10' } });

      const currentWeightInput = screen.getByPlaceholderText(/^150$/i);
      fireEvent.change(currentWeightInput, { target: { value: '175' } });

      const targetWeightInput = screen.getByPlaceholderText(/^140$/i);
      fireEvent.change(targetWeightInput, { target: { value: '160' } });

      const activitySelect = screen.getByLabelText(/activity level/i);
      fireEvent.change(activitySelect, { target: { value: 'moderate' } });

      const fitnessGoalSelect = screen.getByLabelText(/fitness goal/i);
      fireEvent.change(fitnessGoalSelect, { target: { value: 'lose_weight' } });

      const submitButton = screen.getByText(/complete sign up/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      apiService.register.mockImplementation(() => new Promise(() => {}));

      // Complete step 1 again
      render(<SignupPage onSuccess={vi.fn()} onBack={vi.fn()} onNavigateToLogin={vi.fn()} />);

      const nameInput = screen.getByPlaceholderText(/john doe/i);
      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      const emailInput = screen.getByPlaceholderText(/john@example.com/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      const nextButton = screen.getByText(/next: profile stats/i);
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getAllByText(/your fitness profile/i)[0]).toBeInTheDocument();
      });

      // Fill step 2
      const ageInput = screen.getByPlaceholderText(/^25$/i);
      fireEvent.change(ageInput, { target: { value: '30' } });

      const sexSelect = screen.getByLabelText(/^sex$/i);
      fireEvent.change(sexSelect, { target: { value: 'male' } });

      const heightFeetInput = screen.getByPlaceholderText(/^feet$/i);
      fireEvent.change(heightFeetInput, { target: { value: '5' } });

      const heightInchesInput = screen.getByPlaceholderText(/^inches$/i);
      fireEvent.change(heightInchesInput, { target: { value: '10' } });

      const currentWeightInput = screen.getByPlaceholderText(/^150$/i);
      fireEvent.change(currentWeightInput, { target: { value: '175' } });

      const targetWeightInput = screen.getByPlaceholderText(/^140$/i);
      fireEvent.change(targetWeightInput, { target: { value: '160' } });

      const activitySelect = screen.getByLabelText(/activity level/i);
      fireEvent.change(activitySelect, { target: { value: 'moderate' } });

      const fitnessGoalSelect = screen.getByLabelText(/fitness goal/i);
      fireEvent.change(fitnessGoalSelect, { target: { value: 'lose_weight' } });

      const submitButton = screen.getByText(/complete sign up/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/creating your profile/i)).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });
  });
});

