import { describe, it, expect, vi } from 'vitest';
import { generateMealPlan, escapeXml } from './geminiService';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    }),
  };
});

describe('geminiService', () => {
  describe('escapeXml', () => {
    it('should escape XML characters correctly', () => {
      expect(escapeXml('<script>alert("hello")</script>')).toBe('&lt;script&gt;alert(&quot;hello&quot;)&lt;/script&gt;');
      expect(escapeXml('Paneer & Roti')).toBe('Paneer &amp; Roti');
      expect(escapeXml(null)).toBe('');
    });
  });

  describe('generateMealPlan API Validation', () => {
    it('should fail if API key does not start with AIzaSy', async () => {
      const result = await generateMealPlan('invalid_key', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Gemini API keys should start with');
    });

    it('should call generateContent with correct arguments when API key is valid', async () => {
      const dummyMeal = {
        name: 'Idli',
        recipe: 'Steam them',
        prepTime: '10m',
        ingredients: ['rice', 'urad dal'],
        calories: 200,
        macros: { protein: 5, carbs: 40, fat: 1, fiber: 2 }
      };

      const dummyNutrition = {
        dailyCalories: 1500,
        dailyMacros: { protein: 50, carbs: 250, fat: 30, fiber: 20 },
        micros: {
          iron: { value: 1, unit: 'mg', rda: 10 },
          calcium: { value: 1, unit: 'mg', rda: 10 },
          vitaminC: { value: 1, unit: 'mg', rda: 10 },
          vitaminB12: { value: 1, unit: 'mcg', rda: 10 },
          vitaminD: { value: 1, unit: 'mcg', rda: 10 },
          zinc: { value: 1, unit: 'mg', rda: 10 }
        }
      };

      const dummyBudget = {
        breakfast: 10,
        lunch: 10,
        dinner: 10,
        snacks: 10,
        total: 40,
        feasibility: 'within',
        savingsTips: []
      };

      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          meals: { breakfast: dummyMeal, lunch: dummyMeal, dinner: dummyMeal, snacks: dummyMeal },
          groceryList: { Vegetables: [], 'Grains & Cereals': [], Dairy: [], 'Spices & Condiments': [], Proteins: [], Fruits: [], Others: [] },
          nutrition: dummyNutrition,
          budget: dummyBudget,
          substitutions: []
        }),
      });

      const inputs = {
        activityLevel: 'moderate',
        dayDescription: 'busy day',
        dietaryPreferences: ['vegetarian'],
        cuisine: 'Indian',
        allergies: 'peanuts',
        budget: 500,
        people: 1,
      };

      const result = await generateMealPlan('AIzaSy_valid_key', inputs);
      expect(result.success).toBe(true);
      expect(result.data.meals.breakfast.name).toBe('Idli');
      expect(mockGenerateContent).toHaveBeenCalled();
    });
  });
});
