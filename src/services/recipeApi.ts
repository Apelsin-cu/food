import axios from 'axios';
import { API_KEY, BASE_URL } from '../constants/Api';
import { Recipe } from '../types/recipe';

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

const apiClient = axios.create({
  baseURL: BASE_URL,
  params: {
    apiKey: API_KEY,
  },
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
    return response.data.map((recipe: any) => ({
      id: recipe.id,
      name: recipe.title,
      imageUrl: recipe.image,
      cookingTime: recipe.readyInMinutes,
      servings: recipe.servings,
      ingredients: recipe.extendedIngredients.map((ing: any) => ing.original),
      instructions: recipe.analyzedInstructions?.[0]?.steps.map((step: any) => step.step) || [],
      isVegan: recipe.vegan,
      isGlutenFree: recipe.glutenFree,
      isVegetarian: recipe.vegetarian,
      isDairyFree: recipe.dairyFree,
    })).filter((recipe: Recipe) => Boolean(recipe.name) && Boolean(recipe.imageUrl));
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
      return response.data.results.map((recipe: any) => ({
        id: recipe.id,
        name: recipe.title,
        imageUrl: recipe.image,
        cookingTime: recipe.readyInMinutes || 30,
        servings: recipe.servings || 4,
        ingredients: recipe.extendedIngredients?.map((ing: any) => ing.original) || [],
        instructions: recipe.analyzedInstructions?.[0]?.steps.map((step: any) => step.step) || [],
        isVegan: recipe.vegan || false,
        isGlutenFree: recipe.glutenFree || false,
        isVegetarian: recipe.vegetarian || false,
        isDairyFree: recipe.dairyFree || false,
      })).filter((recipe: Recipe) => Boolean(recipe.name) && Boolean(recipe.imageUrl));
    }
    return [];
  } catch (error) {
    console.error('Error searching recipes by name:', error);
    throw error;
  }
};
