import { Recipe } from '../types/recipe';
import { apiClient, ensureApiConfigured } from './http';
import {
  findLocalRecipesByIngredients,
  isLocalRecipe,
  getLocalIngredientSuggestions,
  getLocalRecommendedRecipes,
  searchLocalRecipesByName,
} from './localRecipeService';

interface RecipesResponse {
  recipes: Recipe[];
}

interface StepVisualsResponse {
  visuals: {
    text: string;
    imageUrl?: string;
  }[];
}

const sanitizeRecipe = (recipe: Recipe): Recipe => ({
  ...recipe,
  ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
  instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
  imageUrl: typeof recipe.imageUrl === 'string' ? recipe.imageUrl : '',
});

export const findRecipesByIngredients = async (
  ingredients: string[],
  strictIngredients = false
): Promise<Recipe[]> => {
  const localRecipes = findLocalRecipesByIngredients(ingredients, strictIngredients);

  if (localRecipes.length > 0) {
    return localRecipes.map(sanitizeRecipe);
  }

  if (strictIngredients) {
    return [];
  }

  try {
    ensureApiConfigured();
    const response = await apiClient.get<RecipesResponse>('/recipes/by-ingredients', {
      params: {
        ingredients: ingredients.join(','),
      },
    });

    return Array.isArray(response.data?.recipes)
      ? response.data.recipes.map(sanitizeRecipe)
      : [];
  } catch (error) {
    console.error('Error finding recipes by ingredients:', error);
    return localRecipes;
  }
};

export const searchRecipesByName = async (query: string): Promise<Recipe[]> => {
  const localRecipes = searchLocalRecipesByName(query);

  if (localRecipes.length > 0) {
    return localRecipes.map(sanitizeRecipe);
  }

  try {
    ensureApiConfigured();
    const response = await apiClient.get<RecipesResponse>('/recipes/search', {
      params: { query },
    });

    return Array.isArray(response.data?.recipes)
      ? response.data.recipes.map(sanitizeRecipe)
      : [];
  } catch (error) {
    console.error('Error searching recipes by name:', error);
    return localRecipes;
  }
};

export const getRecommendedRecipes = async (): Promise<Recipe[]> => {
  return getLocalRecommendedRecipes();
};

export const getRecipeStepVisuals = async (recipeId: number) => {
  if (isLocalRecipe(recipeId)) {
    return [];
  }

  try {
    ensureApiConfigured();
    const response = await apiClient.get<StepVisualsResponse>(`/recipes/${recipeId}/step-visuals`);
    return Array.isArray(response.data?.visuals) ? response.data.visuals : [];
  } catch (error) {
    console.error('Error loading recipe step visuals:', error);
    return [];
  }
};

export const getLocalQuickProducts = () => getLocalIngredientSuggestions();
