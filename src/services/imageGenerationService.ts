import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
    DEEPAI_API_KEY,
    DEEPAI_IMAGE_API_URL,
    OPENAI_API_KEY,
    OPENAI_IMAGE_API_URL,
} from '../constants/OpenAI';

const CACHE_PREFIX = '@FoodApp:stepImage:';
const SUCCESS_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const FAILURE_TTL_MS = 1000 * 60 * 60 * 12;

interface CacheEntry {
  url: string | null;
  createdAt: number;
}

const buildPrompt = (stepText: string, recipeTitle: string, stepNumber: number): string => {
  return `Фотореалистичное изображение этапа ${stepNumber} приготовления блюда \"${recipeTitle}\". Кулинарный процесс крупным планом, натуральный свет, современная кухня, без текста на изображении. Этап: ${stepText}`;
};

const hashText = (value: string): string => {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
};

const buildCacheKey = (recipeId: number, stepText: string, recipeTitle: string, stepNumber: number): string => {
  const fingerprint = hashText(`${recipeTitle}|${stepNumber}|${stepText}`);
  return `${CACHE_PREFIX}${recipeId}:${stepNumber}:${fingerprint}`;
};

const readCache = async (cacheKey: string): Promise<string | null | undefined> => {
  try {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (!raw) {
      return undefined;
    }

    const entry = JSON.parse(raw) as CacheEntry;
    if (!entry || typeof entry.createdAt !== 'number') {
      await AsyncStorage.removeItem(cacheKey);
      return undefined;
    }

    const ttl = entry.url ? SUCCESS_TTL_MS : FAILURE_TTL_MS;
    const expired = Date.now() - entry.createdAt > ttl;
    if (expired) {
      await AsyncStorage.removeItem(cacheKey);
      return undefined;
    }

    return entry.url;
  } catch (error) {
    console.error('Failed to read image cache:', error);
    return undefined;
  }
};

const writeCache = async (cacheKey: string, url: string | null): Promise<void> => {
  try {
    const entry: CacheEntry = {
      url,
      createdAt: Date.now(),
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.error('Failed to write image cache:', error);
  }
};

const generateWithDeepAI = async (prompt: string): Promise<string | null> => {
  if (!DEEPAI_API_KEY) {
    return null;
  }

  try {
    const form = new FormData();
    form.append('text', prompt);

    const response = await axios.post(DEEPAI_IMAGE_API_URL, form, {
      headers: {
        'Api-Key': DEEPAI_API_KEY,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });

    const url = response.data?.output_url;
    return typeof url === 'string' && url.length > 0 ? url : null;
  } catch (error) {
    console.error('DeepAI image generation failed:', error);
    return null;
  }
};

const generateWithOpenAI = async (prompt: string): Promise<string | null> => {
  if (!OPENAI_API_KEY) {
    return null;
  }

  try {
    const response = await axios.post(
      OPENAI_IMAGE_API_URL,
      {
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024',
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    const first = response.data?.data?.[0];
    if (!first) {
      return null;
    }

    if (typeof first.url === 'string' && first.url.length > 0) {
      return first.url;
    }

    if (typeof first.b64_json === 'string' && first.b64_json.length > 0) {
      return `data:image/png;base64,${first.b64_json}`;
    }

    return null;
  } catch (error) {
    console.error('OpenAI image generation failed:', error);
    return null;
  }
};

export const getStepImageWithCache = async (
  recipeId: number,
  stepText: string,
  recipeTitle: string,
  stepNumber: number
): Promise<string | null> => {
  const cacheKey = buildCacheKey(recipeId, stepText, recipeTitle, stepNumber);
  const cached = await readCache(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const prompt = buildPrompt(stepText, recipeTitle, stepNumber);

  const deepAiImage = await generateWithDeepAI(prompt);
  if (deepAiImage) {
    await writeCache(cacheKey, deepAiImage);
    return deepAiImage;
  }

  const openAiImage = await generateWithOpenAI(prompt);
  await writeCache(cacheKey, openAiImage);
  return openAiImage;
};
