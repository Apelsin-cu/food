import axios from 'axios';
import { API_KEY, BASE_URL } from '../constants/Api';
import { Recipe } from '../types/recipe';

const apiClient = axios.create({
  baseURL: BASE_URL,
  params: {
    apiKey: API_KEY,
  },
});

export const findRecipesByIngredients = async (ingredients: string[]): Promise<Recipe[]> => {
  try {
    const response = await apiClient.get('/recipes/findByIngredients', {
      params: {
        ingredients: ingredients.join(','),
        number: 10, // Let's fetch 10 recipes for now
        ranking: 1, // Maximize used ingredients
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
    }));
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
    const response = await apiClient.get('/recipes/complexSearch', {
      params: {
        query: query,
        number: 5,
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
      }));
    }
    return [];
  } catch (error) {
    console.error('Error searching recipes by name:', error);
    throw error;
  }
};
