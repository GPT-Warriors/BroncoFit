/**
 * Tests for NutritionLogger component
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NutritionLogger from '../NutritionLogger';
import apiService from '../../services/api';

// Mock the API service
vi.mock('../../services/api', () => ({
  default: {
    createMeal: vi.fn(),
  }
}));

describe('NutritionLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render nutrition logger form', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      expect(screen.getByRole('heading', { name: /log meal/i })).toBeInTheDocument();
      expect(screen.getByText(/track your nutrition/i)).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      expect(screen.getByText('← Back')).toBeInTheDocument();
    });

    it('should call back function when back button is clicked', () => {
      const mockOnBack = vi.fn();
      render(<NutritionLogger onBack={mockOnBack} onSuccess={vi.fn()} />);

      const backButton = screen.getByText('← Back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should render food input by default', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      expect(screen.getByPlaceholderText(/chicken breast/i)).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('should render meal type selector', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const selects = screen.getAllByRole('combobox');
      const mealTypeSelect = selects[0];
      expect(mealTypeSelect).toBeInTheDocument();
      expect(mealTypeSelect.value).toBe('breakfast');
    });

    it('should render all meal type options', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const selects = screen.getAllByRole('combobox');
      const mealTypeSelect = selects[0];
      const options = Array.from(mealTypeSelect.options).map(opt => opt.value);

      expect(options).toContain('breakfast');
      expect(options).toContain('lunch');
      expect(options).toContain('dinner');
      expect(options).toContain('snack');
    });

    it('should update meal type when selector changes', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const selects = screen.getAllByRole('combobox');
      const mealTypeSelect = selects[0];
      fireEvent.change(mealTypeSelect, { target: { value: 'lunch' } });

      expect(mealTypeSelect.value).toBe('lunch');
    });

    it('should render notes field', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      expect(screen.getByPlaceholderText(/meal notes/i)).toBeInTheDocument();
    });

    it('should update notes when input changes', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const notesInput = screen.getByPlaceholderText(/meal notes/i);
      fireEvent.change(notesInput, { target: { value: 'Great meal!' } });

      expect(notesInput.value).toBe('Great meal!');
    });
  });

  describe('Food Management', () => {
    it('should render food name input', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      expect(screen.getByPlaceholderText(/chicken breast/i)).toBeInTheDocument();
    });

    it('should render calories input', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      expect(screen.getByPlaceholderText(/^250$/i)).toBeInTheDocument();
    });

    it('should render macro inputs', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      expect(screen.getByPlaceholderText(/^30$/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^10$/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^5$/i)).toBeInTheDocument();
    });

    it('should render serving size input', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      expect(screen.getByPlaceholderText(/^100g$/i)).toBeInTheDocument();
    });

    it('should add new food when add button is clicked', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const addButton = screen.getByText(/add food/i);
      fireEvent.click(addButton);

      const foodInputs = screen.getAllByPlaceholderText(/chicken breast/i);
      expect(foodInputs.length).toBe(2);
    });

    it('should remove food when remove button is clicked', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const addButton = screen.getByText(/add food/i);
      fireEvent.click(addButton);

      const removeButtons = screen.getAllByText('✕');
      expect(removeButtons.length).toBeGreaterThan(0);

      fireEvent.click(removeButtons[0]);

      const foodInputs = screen.getAllByPlaceholderText(/chicken breast/i);
      expect(foodInputs.length).toBe(1);
    });

    it('should not show remove button when only one food', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const removeButtons = screen.queryAllByText('✕');
      // Remove button should not be present for single food
      expect(removeButtons.filter(btn => btn.closest('.meal-card')).length).toBe(0);
    });

    it('should update food name when input changes', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const foodInput = screen.getByPlaceholderText(/chicken breast/i);
      fireEvent.change(foodInput, { target: { value: 'Salmon' } });

      expect(foodInput.value).toBe('Salmon');
    });

    it('should update calories when input changes', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const caloriesInput = screen.getByPlaceholderText(/^250$/i);
      fireEvent.change(caloriesInput, { target: { value: '300' } });

      expect(caloriesInput.value).toBe('300');
    });

    it('should update protein when input changes', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const proteinInputs = screen.getAllByPlaceholderText(/^30$/i);
      const proteinInput = proteinInputs[0];
      fireEvent.change(proteinInput, { target: { value: '30' } });

      expect(proteinInput.value).toBe('30');
    });

    it('should update carbs when input changes', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const carbsInputs = screen.getAllByPlaceholderText(/^10$/i);
      const carbsInput = carbsInputs[0];
      fireEvent.change(carbsInput, { target: { value: '40' } });

      expect(carbsInput.value).toBe('40');
    });

    it('should update fat when input changes', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const fatInput = screen.getByPlaceholderText(/^5$/i);
      fireEvent.change(fatInput, { target: { value: '15' } });

      expect(fatInput.value).toBe('15');
    });

    it('should update serving size when input changes', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const servingInput = screen.getByPlaceholderText(/^100g$/i);
      fireEvent.change(servingInput, { target: { value: '200g' } });

      expect(servingInput.value).toBe('200g');
    });
  });

  describe('Totals Summary', () => {
    it('should display totals summary when calories are entered', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const foodInput = screen.getByPlaceholderText(/chicken breast/i);
      fireEvent.change(foodInput, { target: { value: 'Chicken' } });

      const caloriesInput = screen.getByPlaceholderText(/^250$/i);
      fireEvent.change(caloriesInput, { target: { value: '300' } });

      expect(screen.getByText(/meal totals/i)).toBeInTheDocument();
    });

    it('should calculate total calories correctly', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const foodInput = screen.getByPlaceholderText(/chicken breast/i);
      fireEvent.change(foodInput, { target: { value: 'Chicken' } });

      const caloriesInput = screen.getByPlaceholderText(/^250$/i);
      fireEvent.change(caloriesInput, { target: { value: '300' } });

      const addButton = screen.getByText(/add food/i);
      fireEvent.click(addButton);

      const foodInputs = screen.getAllByPlaceholderText(/chicken breast/i);
      fireEvent.change(foodInputs[1], { target: { value: 'Rice' } });

      const caloriesInputs = screen.getAllByPlaceholderText(/^250$/i);
      fireEvent.change(caloriesInputs[1], { target: { value: '200' } });

      expect(screen.getByText('500')).toBeInTheDocument();
    });

    it('should calculate total protein correctly', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const foodInput = screen.getByPlaceholderText(/chicken breast/i);
      fireEvent.change(foodInput, { target: { value: 'Chicken' } });

      const caloriesInput = screen.getByPlaceholderText(/^250$/i);
      fireEvent.change(caloriesInput, { target: { value: '300' } });

      const proteinInputs = screen.getAllByPlaceholderText(/^30$/i);
      const proteinInput = proteinInputs[0];
      fireEvent.change(proteinInput, { target: { value: '30' } });

      const addButton = screen.getByText(/add food/i);
      fireEvent.click(addButton);

      const allFoodInputs = screen.getAllByPlaceholderText(/chicken breast/i);
      fireEvent.change(allFoodInputs[1], { target: { value: 'Rice' } });

      const allCaloriesInputs = screen.getAllByPlaceholderText(/^250$/i);
      fireEvent.change(allCaloriesInputs[1], { target: { value: '200' } });

      const allProteinInputs = screen.getAllByPlaceholderText(/^30$/i);
      fireEvent.change(allProteinInputs[1], { target: { value: '20' } });

      expect(screen.getByText('50.0g')).toBeInTheDocument();
    });

    it('should not show totals when no calories entered', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      expect(screen.queryByText(/meal totals/i)).not.toBeInTheDocument();
    });

    it('should ignore incomplete food items in totals', () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      // Valid food item
      const foodInput = screen.getByPlaceholderText(/chicken breast/i);
      fireEvent.change(foodInput, { target: { value: 'Chicken' } });
      
      const caloriesInput = screen.getByPlaceholderText(/^250$/i);
      fireEvent.change(caloriesInput, { target: { value: '300' } });

      // Add second food item
      const addButton = screen.getByText(/add food/i);
      fireEvent.click(addButton);

      // Incomplete food item (has calories but no name)
      const caloriesInputs = screen.getAllByPlaceholderText(/^250$/i);
      fireEvent.change(caloriesInputs[1], { target: { value: '200' } });

      // Should only show 300, not 500
      expect(screen.getByText('300')).toBeInTheDocument();
      expect(screen.queryByText('500')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when no food items added', async () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const submitButton = screen.getByRole('button', { name: /log meal/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please add at least one food item/i)).toBeInTheDocument();
      });
    });

    it('should show error when food name is missing', async () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const caloriesInput = screen.getByPlaceholderText(/^250$/i);
      fireEvent.change(caloriesInput, { target: { value: '300' } });

      const submitButton = screen.getByRole('button', { name: /log meal/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please add at least one food item/i)).toBeInTheDocument();
      });
    });

    it('should show error when calories are missing', async () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const foodInput = screen.getByPlaceholderText(/chicken breast/i);
      fireEvent.change(foodInput, { target: { value: 'Chicken' } });

      const submitButton = screen.getByRole('button', { name: /log meal/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please add at least one food item/i)).toBeInTheDocument();
      });
    });

    it('should not submit if validation fails', async () => {
      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const submitButton = screen.getByRole('button', { name: /log meal/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.createMeal).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      apiService.createMeal.mockResolvedValue({ id: 'm1' });

      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const selects = screen.getAllByRole('combobox');
      const mealTypeSelect = selects[0];
      fireEvent.change(mealTypeSelect, { target: { value: 'lunch' } });

      const foodInput = screen.getByPlaceholderText(/chicken breast/i);
      fireEvent.change(foodInput, { target: { value: 'Chicken Breast' } });

      const caloriesInput = screen.getByPlaceholderText(/^250$/i);
      fireEvent.change(caloriesInput, { target: { value: '300' } });

      const proteinInputs = screen.getAllByPlaceholderText(/^30$/i);
      const proteinInput = proteinInputs[0];
      fireEvent.change(proteinInput, { target: { value: '30' } });

      const carbsInputs = screen.getAllByPlaceholderText(/^10$/i);
      const carbsInput = carbsInputs[0];
      fireEvent.change(carbsInput, { target: { value: '20' } });

      const fatInput = screen.getByPlaceholderText(/^5$/i);
      fireEvent.change(fatInput, { target: { value: '10' } });

      const servingInput = screen.getByPlaceholderText(/^100g$/i);
      fireEvent.change(servingInput, { target: { value: '200g' } });

      const submitButton = screen.getByRole('button', { name: /log meal/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.createMeal).toHaveBeenCalled();
      });

      const callArgs = apiService.createMeal.mock.calls[0][0];
      expect(callArgs.meal_type).toBe('lunch');
      expect(callArgs.foods[0].food_name).toBe('Chicken Breast');
      expect(callArgs.foods[0].calories).toBe(300);
      expect(callArgs.foods[0].protein_g).toBe(30);
      expect(callArgs.foods[0].carbs_g).toBe(20);
      expect(callArgs.foods[0].fat_g).toBe(10);
      expect(callArgs.foods[0].serving_size).toBe('200g');
    });

    it('should handle multiple food items', async () => {
      apiService.createMeal.mockResolvedValue({ id: 'm1' });

      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const foodInput = screen.getByPlaceholderText(/chicken breast/i);
      fireEvent.change(foodInput, { target: { value: 'Chicken' } });

      const caloriesInput = screen.getByPlaceholderText(/^250$/i);
      fireEvent.change(caloriesInput, { target: { value: '300' } });

      const addButton = screen.getByText(/add food/i);
      fireEvent.click(addButton);

      const foodInputs = screen.getAllByPlaceholderText(/chicken breast/i);
      fireEvent.change(foodInputs[1], { target: { value: 'Rice' } });

      const caloriesInputs = screen.getAllByLabelText(/calories/i);
      fireEvent.change(caloriesInputs[1], { target: { value: '200' } });

      const submitButton = screen.getByRole('button', { name: /log meal/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.createMeal).toHaveBeenCalled();
      });

      const callArgs = apiService.createMeal.mock.calls[0][0];
      expect(callArgs.foods.length).toBe(2);
      expect(callArgs.foods[0].food_name).toBe('Chicken');
      expect(callArgs.foods[1].food_name).toBe('Rice');
    });

    it('should filter out empty food items', async () => {
      apiService.createMeal.mockResolvedValue({ id: 'm1' });

      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const foodInput = screen.getByPlaceholderText(/chicken breast/i);
      fireEvent.change(foodInput, { target: { value: 'Chicken' } });

      const caloriesInput = screen.getByPlaceholderText(/^250$/i);
      fireEvent.change(caloriesInput, { target: { value: '300' } });

      const addButton = screen.getByText(/add food/i);
      fireEvent.click(addButton);

      // Don't fill in the second food item

      const submitButton = screen.getByRole('button', { name: /log meal/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.createMeal).toHaveBeenCalled();
      });

      const callArgs = apiService.createMeal.mock.calls[0][0];
      expect(callArgs.foods.length).toBe(1);
    });

    it('should call onSuccess after successful submission', async () => {
      const mockOnSuccess = vi.fn();
      apiService.createMeal.mockResolvedValue({ id: 'm1' });

      render(<NutritionLogger onBack={vi.fn()} onSuccess={mockOnSuccess} />);

      const foodInput = screen.getByPlaceholderText(/chicken breast/i);
      fireEvent.change(foodInput, { target: { value: 'Chicken' } });

      const caloriesInput = screen.getByPlaceholderText(/^250$/i);
      fireEvent.change(caloriesInput, { target: { value: '300' } });

      const submitButton = screen.getByRole('button', { name: /log meal/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should reset form after successful submission', async () => {
      apiService.createMeal.mockResolvedValue({ id: 'm1' });

      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const selects = screen.getAllByRole('combobox');
      const mealTypeSelect = selects[0];
      fireEvent.change(mealTypeSelect, { target: { value: 'lunch' } });

      const foodInput = screen.getByPlaceholderText(/chicken breast/i);
      fireEvent.change(foodInput, { target: { value: 'Chicken' } });

      const caloriesInput = screen.getByPlaceholderText(/^250$/i);
      fireEvent.change(caloriesInput, { target: { value: '300' } });

      const submitButton = screen.getByRole('button', { name: /log meal/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mealTypeSelect.value).toBe('breakfast');
        expect(foodInput.value).toBe('');
        expect(caloriesInput.value).toBe('');
      });
    });

    it('should display error message on submission failure', async () => {
      apiService.createMeal.mockRejectedValue(new Error('Failed to create meal'));

      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const foodInput = screen.getByPlaceholderText(/chicken breast/i);
      fireEvent.change(foodInput, { target: { value: 'Chicken' } });

      const caloriesInput = screen.getByPlaceholderText(/^250$/i);
      fireEvent.change(caloriesInput, { target: { value: '300' } });

      const submitButton = screen.getByRole('button', { name: /log meal/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to create meal/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      apiService.createMeal.mockImplementation(() => new Promise(() => {}));

      render(<NutritionLogger onBack={vi.fn()} onSuccess={vi.fn()} />);

      const foodInput = screen.getByPlaceholderText(/chicken breast/i);
      fireEvent.change(foodInput, { target: { value: 'Chicken' } });

      const caloriesInput = screen.getByPlaceholderText(/^250$/i);
      fireEvent.change(caloriesInput, { target: { value: '300' } });

      const submitButton = screen.getByRole('button', { name: /log meal/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/saving/i)).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Cancel Button', () => {
    it('should call onBack when cancel button is clicked', () => {
      const mockOnBack = vi.fn();
      render(<NutritionLogger onBack={mockOnBack} onSuccess={vi.fn()} />);

      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });
});
