import axios from 'axios';
import { OPENAI_API_KEY, OPENAI_API_URL } from '../constants/OpenAI';
import { Recipe } from '../types/recipe';

interface GPTRecipeSuggestion {
  recipeName: string;
  description: string;
}

/**
 * Запрашивает у GPT идеи рецептов на основе предоставленных ингредиентов.
 * @param ingredients - Массив ингредиентов, которые есть у пользователя.
 * @returns Массив предложенных названий рецептов.
 */
export const getRecipeSuggestionsFromGPT = async (ingredients: string[]): Promise<string[]> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = `У меня есть следующие ингредиенты: ${ingredients.join(', ')}.

Предложи 5 названий блюд, которые можно приготовить из этих ингредиентов. 
Ответь ТОЛЬКО в формате JSON массива строк с названиями блюд на английском языке.
Пример ответа: ["Pasta Carbonara", "Chicken Stir Fry", "Vegetable Soup"]

Ответ:`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful culinary assistant. You suggest recipes based on available ingredients. Always respond with a JSON array of recipe names in English.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (content) {
      const cleaned = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item)).filter(Boolean);
      }
    }
    return [];
  } catch (error) {
    console.error('Error fetching GPT suggestions:', error);
    return [];
  }
};

/**
 * Получает детальные рекомендации от GPT для конкретного рецепта.
 * @param recipeName - Название рецепта.
 * @param ingredients - Доступные ингредиенты.
 * @returns Рекомендации по приготовлению.
 */
export const getRecipeTipsFromGPT = async (recipeName: string, ingredients: string[]): Promise<string> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = `Я хочу приготовить "${recipeName}" из следующих ингредиентов: ${ingredients.join(', ')}.

Дай краткие советы по приготовлению этого блюда (2-3 предложения).`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful culinary assistant. Provide brief cooking tips in Russian.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0]?.message?.content;
    return content || '';
  } catch (error) {
    console.error('Error fetching GPT tips:', error);
    return '';
  }
};

export interface DetailedRussianRecipe {
  title: string;
  ingredients: string[];
  steps: string[];
}

const parseJsonContent = (raw: string) => {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  return JSON.parse(cleaned);
};

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
  tomato: 'томат',
  tomatoes: 'томаты',
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
  recipe: 'рецепт',
  dish: 'блюдо',
  creamy: 'сливочный',
  spicy: 'острый',
  roasted: 'запеченный',
  grilled: 'на гриле',
  fried: 'жареный',
  baked: 'запеченный',
  boil: 'варить',
  boiled: 'вареный',
  bake: 'запекать',
  fry: 'жарить',
  saute: 'обжарить',
  cook: 'готовить',
  cooked: 'приготовленный',
  in: 'в',
  for: 'для',
  of: '',
  with: 'с',
  and: 'и',
};

export const fallbackTranslateTextToRussian = (text: string): string => {
  const words = text.split(/\s+/).map((raw) => {
    const clean = raw.toLowerCase().replace(/[^a-z]/g, '');
    const translated = DICTIONARY[clean];
    if (translated === '') {
      return '';
    }
    return translated || raw;
  });

  return words.filter(Boolean).join(' ').replace(/\s{2,}/g, ' ').trim();
};

const fallbackTranslateTitle = (title: string): string => {
  const translated = fallbackTranslateTextToRussian(title);
  if (!translated) {
    return title;
  }

  const result = translated;
  return result || title;
};

export const translateRecipeTitlesToRussian = async (titles: string[]): Promise<string[]> => {
  try {
    if (!OPENAI_API_KEY || titles.length === 0) {
      return titles.map(fallbackTranslateTitle);
    }

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Переводи названия блюд на русский кулинарный язык. Верни только JSON-массив строк, в том же порядке.',
          },
          {
            role: 'user',
            content: `Переведи названия: ${JSON.stringify(titles)}`,
          },
        ],
        max_tokens: 400,
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    if (!content) {
      return titles.map(fallbackTranslateTitle);
    }

    const parsed = parseJsonContent(content);
    if (!Array.isArray(parsed)) {
      return titles.map(fallbackTranslateTitle);
    }

    return parsed.map((item, index) => String(item || fallbackTranslateTitle(titles[index] || '')));
  } catch (error) {
    console.error('Error translating recipe titles:', error);
    return titles.map(fallbackTranslateTitle);
  }
};

export const getDetailedRecipeInRussian = async (recipe: Recipe): Promise<DetailedRussianRecipe | null> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = `Данные рецепта:\nНазвание: ${recipe.name}\nИнгредиенты: ${recipe.ingredients.join(', ')}\nИнструкция: ${recipe.instructions.join(' | ')}\n\nСделай полностью русский вариант. Нужны подробные пошаговые инструкции (минимум 6 шагов, каждый шаг 2-3 предложения).\nОтвет строго JSON формата:\n{\"title\":\"...\",\"ingredients\":[\"...\"],\"steps\":[\"...\"]}`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты кулинарный редактор. Пишешь только на русском, понятно и подробно.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 900,
        temperature: 0.4,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    if (!content) {
      return null;
    }

    const parsed = parseJsonContent(content);
    if (!parsed || !Array.isArray(parsed.ingredients) || !Array.isArray(parsed.steps)) {
      return null;
    }

    return {
      title: String(parsed.title || recipe.name),
      ingredients: parsed.ingredients.map((item: unknown) => String(item)),
      steps: parsed.steps.map((item: unknown) => String(item)),
    };
  } catch (error) {
    console.error('Error generating detailed russian recipe:', error);
    return null;
  }
};
