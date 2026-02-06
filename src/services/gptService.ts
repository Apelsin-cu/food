import axios from 'axios';
import { OPENAI_API_KEY, OPENAI_API_URL } from '../constants/OpenAI';

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
    const prompt = `У меня есть следующие ингредиенты: ${ingredients.join(', ')}.

Предложи 5 названий блюд, которые можно приготовить из этих ингредиентов. 
Ответь ТОЛЬКО в формате JSON массива строк с названиями блюд на английском языке.
Пример ответа: ["Pasta Carbonara", "Chicken Stir Fry", "Vegetable Soup"]

Ответ:`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
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
      // Парсим JSON из ответа GPT
      const parsed = JSON.parse(content.trim());
      if (Array.isArray(parsed)) {
        return parsed;
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
    const prompt = `Я хочу приготовить "${recipeName}" из следующих ингредиентов: ${ingredients.join(', ')}.

Дай краткие советы по приготовлению этого блюда (2-3 предложения).`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
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
