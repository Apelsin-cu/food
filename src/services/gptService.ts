import { Recipe } from '../types/recipe';
import { apiClient, ensureApiConfigured } from './http';
import {
  DetailedRussianRecipe,
  generateLocalDetailedRecipe,
  isLocalRecipe,
} from './localRecipeService';

interface DetailedRecipeResponse {
  recipe: DetailedRussianRecipe;
}

interface TranslatedTitlesResponse {
  titles: string[];
}

interface TipsResponse {
  tips: string;
}

const MIN_DETAILED_STEPS = 5;
const MIN_DETAILED_STEP_LENGTH = 55;

const DICTIONARY: Record<string, string> = {
  chicken: 'курица',
  beef: 'говядина',
  pork: 'свинина',
  fish: 'рыба',
  shrimp: 'креветки',
  salmon: 'лосось',
  tuna: 'тунец',
  garlic: 'чеснок',
  onion: 'лук',
  tomato: 'помидор',
  tomatoes: 'помидоры',
  potato: 'картофель',
  potatoes: 'картофель',
  carrot: 'морковь',
  carrots: 'морковь',
  mushroom: 'грибы',
  mushrooms: 'грибы',
  cheese: 'сыр',
  milk: 'молоко',
  cream: 'сливки',
  pasta: 'паста',
  noodles: 'лапша',
  soup: 'суп',
  salad: 'салат',
  stew: 'рагу',
  rice: 'рис',
  egg: 'яйцо',
  eggs: 'яйца',
  bread: 'хлеб',
  butter: 'сливочное масло',
  sauce: 'соус',
  creamy: 'сливочный',
  spicy: 'острый',
  roasted: 'запеченный',
  grilled: 'на гриле',
  fried: 'жареный',
  baked: 'запеченный',
  boiled: 'вареный',
  recipe: 'рецепт',
  dish: 'блюдо',
  with: 'с',
  and: 'и',
};

const isDetailedRecipe = (value: unknown): value is DetailedRussianRecipe => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const recipe = value as DetailedRussianRecipe;
  return (
    typeof recipe.title === 'string' &&
    Array.isArray(recipe.ingredients) &&
    Array.isArray(recipe.steps)
  );
};

const hasDetailedSteps = (steps: string[]): boolean => {
  if (steps.length < MIN_DETAILED_STEPS) {
    return false;
  }

  const averageLength =
    steps.reduce((sum, step) => sum + step.trim().length, 0) / Math.max(steps.length, 1);

  return averageLength >= MIN_DETAILED_STEP_LENGTH;
};

export const fallbackTranslateTextToRussian = (text: string): string => {
  const translated = text
    .split(/\s+/)
    .map((raw) => {
      const clean = raw.toLowerCase().replace(/[^a-z]/g, '');
      return DICTIONARY[clean] || raw;
    })
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return translated || text;
};

export const generateRecipeFromIngredients = async (
  ingredients: string[]
): Promise<DetailedRussianRecipe | null> => {
  try {
    ensureApiConfigured();
    const response = await apiClient.post<DetailedRecipeResponse>('/ai/generate-recipe', {
      ingredients,
    });

    return isDetailedRecipe(response.data?.recipe)
      ? response.data.recipe
      : generateLocalDetailedRecipe(ingredients);
  } catch (error) {
    console.error('Error generating recipe from ingredients:', error);
    return generateLocalDetailedRecipe(ingredients);
  }
};

export const getRecipeTipsFromGPT = async (
  recipeName: string,
  ingredients: string[]
): Promise<string> => {
  try {
    ensureApiConfigured();
    const response = await apiClient.post<TipsResponse>('/ai/recipe-tips', {
      recipeName,
      ingredients,
    });

    return response.data?.tips || '';
  } catch (error) {
    console.error('Error fetching GPT tips:', error);
    return 'Совет: готовьте на среднем огне и пробуйте блюдо в процессе, чтобы вовремя скорректировать соль и специи.';
  }
};

export const translateRecipeTitlesToRussian = async (titles: string[]): Promise<string[]> => {
  if (titles.length === 0) {
    return [];
  }

  if (titles.every((title) => /[А-Яа-яЁё]/.test(title))) {
    return titles;
  }

  try {
    ensureApiConfigured();
    const response = await apiClient.post<TranslatedTitlesResponse>('/ai/translate-titles', {
      titles,
    });

    if (!Array.isArray(response.data?.titles)) {
      return titles.map(fallbackTranslateTextToRussian);
    }

    return response.data.titles.map((item, index) =>
      String(item || fallbackTranslateTextToRussian(titles[index] || ''))
    );
  } catch (error) {
    console.error('Error translating recipe titles:', error);
    return titles.map(fallbackTranslateTextToRussian);
  }
};

export const getDetailedRecipeInRussian = async (
  recipe: Recipe
): Promise<DetailedRussianRecipe | null> => {
  if (isLocalRecipe(recipe)) {
    return {
      title: recipe.name,
      ingredients: recipe.ingredients,
      steps: recipe.instructions,
    };
  }

  try {
    ensureApiConfigured();
    const response = await apiClient.post<DetailedRecipeResponse>('/ai/localize-recipe', {
      recipe,
    });

    if (isDetailedRecipe(response.data?.recipe)) {
      return response.data.recipe;
    }
  } catch (error) {
    console.error('Error generating detailed russian recipe:', error);
  }

  const ingredients =
    recipe.ingredients.length > 0 ? recipe.ingredients : recipe.name.split(',').map((item) => item.trim());
  const localDetailed = generateLocalDetailedRecipe(ingredients);
  const translatedInstructions = recipe.instructions.map((step) => fallbackTranslateTextToRussian(step));
  const fallbackSteps = hasDetailedSteps(translatedInstructions)
    ? translatedInstructions
    : localDetailed.steps;

  return {
    title: fallbackTranslateTextToRussian(recipe.name),
    ingredients: recipe.ingredients.map((item) => fallbackTranslateTextToRussian(item)),
    steps: fallbackSteps,
  };
};
