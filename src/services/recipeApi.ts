import axios from 'axios';
import { API_KEY, BASE_URL } from '../constants/Api';
import { Recipe } from '../types/recipe';

export interface RecipeStepVisual {
  text: string;
  imageUrl?: string;
}

const INGREDIENT_TRANSLATIONS: Record<string, string> = {
  картофель: 'potato',
  лук: 'onion',
  чеснок: 'garlic',
  морковь: 'carrot',
  помидор: 'tomato',
  томат: 'tomato',
  огурец: 'cucumber',
  курица: 'chicken',
  говядина: 'beef',
  свинина: 'pork',
  рыба: 'fish',
  яйца: 'eggs',
  яйцо: 'egg',
  молоко: 'milk',
  сыр: 'cheese',
  масло: 'butter',
  рис: 'rice',
  макароны: 'pasta',
  гречка: 'buckwheat',
  хлеб: 'bread',
  капуста: 'cabbage',
  перец: 'pepper',
  грибы: 'mushrooms',
};

const normalizeIngredient = (value: string): string => {
  const normalized = value.trim().toLowerCase();
  return INGREDIENT_TRANSLATIONS[normalized] || normalized;
};

const resolveRecipeImage = (recipe: any): string => {
  if (typeof recipe.image === 'string' && recipe.image.startsWith('http')) {
    return recipe.image;
  }

  if (recipe.id) {
    return `https://spoonacular.com/recipeImages/${recipe.id}-636x393.jpg`;
  }

  return '';
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  params: {
    apiKey: API_KEY,
  },
});

const mapRecipe = (recipe: any): Recipe => ({
  id: recipe.id,
  name: recipe.title,
  imageUrl: resolveRecipeImage(recipe),
  cookingTime: recipe.readyInMinutes || 30,
  servings: recipe.servings || 2,
  ingredients: recipe.extendedIngredients?.map((ing: any) => ing.original) || [],
  instructions: recipe.analyzedInstructions?.[0]?.steps.map((step: any) => step.step) || [],
  isVegan: Boolean(recipe.vegan),
  isGlutenFree: Boolean(recipe.glutenFree),
  isVegetarian: Boolean(recipe.vegetarian),
  isDairyFree: Boolean(recipe.dairyFree),
});

export const findRecipesByIngredients = async (ingredients: string[]): Promise<Recipe[]> => {
  try {
    if (!API_KEY) {
      throw new Error('Spoonacular API key is not configured');
    }

    const normalizedIngredients = ingredients
      .map(normalizeIngredient)
      .filter(Boolean);

    if (normalizedIngredients.length === 0) {
      return [];
    }

    const response = await apiClient.get('/recipes/findByIngredients', {
      params: {
        ingredients: normalizedIngredients.join(','),
        number: 12,
        ranking: 2,
        ignorePantry: true,
      },
    });

    if (response.data && response.data.length > 0) {
      const recipeIds = response.data.map((recipe: any) => recipe.id);
      return getRecipeInformationBulk(recipeIds);
    }
    return [];
  } catch (error) {
    console.error('Error finding recipes by ingredients:', error);
    throw error;
  }
};

export const getRecipeInformationBulk = async (ids: number[]): Promise<Recipe[]> => {
  try {
    if (ids.length === 0) {
      return [];
    }

    const response = await apiClient.get('/recipes/informationBulk', {
      params: {
        ids: ids.join(','),
        includeNutrition: false,
      },
    });
    return response.data.map(mapRecipe).filter((recipe: Recipe) => Boolean(recipe.name) && Boolean(recipe.imageUrl));
  } catch (error) {
    console.error('Error getting recipe information:', error);
    throw error;
  }
};

/**
 * Поиск рецептов по названию.
 * @param query - Название рецепта для поиска.
 * @returns Массив найденных рецептов.
 */
export const searchRecipesByName = async (query: string): Promise<Recipe[]> => {
  try {
    if (!API_KEY) {
      throw new Error('Spoonacular API key is not configured');
    }

    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return [];
    }

    const response = await apiClient.get('/recipes/complexSearch', {
      params: {
        query: cleanQuery,
        number: 10,
        addRecipeInformation: true,
        fillIngredients: true,
      },
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results.map(mapRecipe).filter((recipe: Recipe) => Boolean(recipe.name) && Boolean(recipe.imageUrl));
    }
    return [];
  } catch (error) {
    console.error('Error searching recipes by name:', error);
    throw error;
  }
};

export const getRecommendedRecipes = async (): Promise<Recipe[]> => {
  try {
    if (!API_KEY) {
      throw new Error('Spoonacular API key is not configured');
    }

    const response = await apiClient.get('/recipes/random', {
      params: {
        number: 10,
      },
    });

    return (response.data?.recipes || [])
      .map(mapRecipe)
      .filter((recipe: Recipe) => Boolean(recipe.name) && Boolean(recipe.imageUrl));
  } catch (error) {
    console.error('Error loading recommendations:', error);
    throw error;
  }
};

export const getRecipeStepVisuals = async (recipeId: number): Promise<RecipeStepVisual[]> => {
  try {
    if (!API_KEY) {
      throw new Error('Spoonacular API key is not configured');
    }

    const response = await apiClient.get(`/recipes/${recipeId}/analyzedInstructions`);
    const steps = response.data?.[0]?.steps || [];

    return steps.map((step: any) => {
      const equipmentImage = step?.equipment?.[0]?.image
        ? `https://spoonacular.com/cdn/equipment_500x500/${step.equipment[0].image}`
        : undefined;
      const ingredientImage = step?.ingredients?.[0]?.image
        ? `https://spoonacular.com/cdn/ingredients_500x500/${step.ingredients[0].image}`
        : undefined;

      return {
        text: step.step,
        imageUrl: equipmentImage || ingredientImage,
      };
    });
  } catch (error) {
    console.error('Error loading recipe step visuals:', error);
    return [];
  }
};
