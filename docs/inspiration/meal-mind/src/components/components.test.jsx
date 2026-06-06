import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WizardStep1 from './WizardStep1_Activity';
import GroceryList from './GroceryList';
import MealCard from './MealCard';
import BudgetPanel from './BudgetPanel';

describe('React Components', () => {
  describe('WizardStep1_Activity', () => {
    it('renders activity cards and handles selection click', () => {
      const mockOnChange = vi.fn();
      const mockData = { activityLevel: '', dayDescription: '' };
      render(<WizardStep1 data={mockData} onChange={mockOnChange} />);

      expect(screen.getByText(/About Your Day/)).toBeInTheDocument();
      
      const sedentaryCard = screen.getByText('Sedentary').closest('[role="radio"]');
      expect(sedentaryCard).toBeInTheDocument();
      
      fireEvent.click(sedentaryCard);
      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ activityLevel: 'sedentary' }));
    });

    it('handles keyboard navigation on activity cards', () => {
      const mockOnChange = vi.fn();
      const mockData = { activityLevel: '', dayDescription: '' };
      render(<WizardStep1 data={mockData} onChange={mockOnChange} />);

      const lightCard = screen.getByText('Light').closest('[role="radio"]');
      fireEvent.keyDown(lightCard, { key: 'Enter', code: 'Enter' });
      expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ activityLevel: 'light' }));
    });
  });

  describe('GroceryList', () => {
    it('renders categorized grocery items and handles check toggle', () => {
      const mockGroceryList = {
        Vegetables: [
          { name: 'Tomato', quantity: '500g', estimatedPrice: 30 }
        ]
      };
      
      render(<GroceryList groceryList={mockGroceryList} />);
      
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
      expect(screen.getByText('Tomato')).toBeInTheDocument();
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
      
      fireEvent.click(checkbox);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('MealCard', () => {
    it('renders meal information and toggles expand on click', () => {
      const dummyMeal = {
        name: 'Masala Dosa',
        prepTime: '20 mins',
        calories: 300,
        ingredients: ['rice batter', 'potatoes'],
        recipe: '1. Prepare batter. 2. Make dosa.',
        macros: { protein: 6, carbs: 45, fat: 10 }
      };

      render(<MealCard mealType="breakfast" meal={dummyMeal} substitutions={[]} />);

      expect(screen.getByText('Masala Dosa')).toBeInTheDocument();
      expect(screen.getByText('300 kcal')).toBeInTheDocument();

      const toggleBtn = screen.getByRole('button', { name: /Recipe & Substitutions/i });
      expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(toggleBtn);
      expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('1. Prepare batter. 2. Make dosa.')).toBeInTheDocument();
    });
  });

  describe('BudgetPanel', () => {
    it('renders budget estimates and feasibility status', () => {
      const mockBudget = {
        breakfast: 50,
        lunch: 100,
        dinner: 150,
        snacks: 30,
        total: 330,
        feasibility: 'within',
        savingsTips: ['Buy in bulk']
      };

      render(<BudgetPanel budget={mockBudget} userBudget={500} />);

      expect(screen.getByText('₹330')).toBeInTheDocument();
      expect(screen.getByText('✅ Within Budget')).toBeInTheDocument();
      expect(screen.getByText('Buy in bulk')).toBeInTheDocument();
    });
  });
});
