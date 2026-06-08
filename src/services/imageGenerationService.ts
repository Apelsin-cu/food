import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, ensureApiConfigured } from './http';

const CACHE_PREFIX = '@FoodApp:stepImage:v2:';
const SUCCESS_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const FAILURE_TTL_MS = 1000 * 30;

interface CacheEntry {
  url: string | null;
  createdAt: number;
}

interface StepImageResponse {
  imageUrl: string | null;
}

const HERO_CACHE_PREFIX = '@FoodApp:recipeImage:v2:';

const hashText = (value: string): string => {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
};

const buildCacheKey = (
  recipeId: number,
  stepText: string,
  recipeTitle: string,
  stepNumber: number
): string => {
  const fingerprint = hashText(`${recipeTitle}|${stepNumber}|${stepText}`);
  return `${CACHE_PREFIX}${recipeId}:${stepNumber}:${fingerprint}`;
};

const buildHeroCacheKey = (recipeId: number, recipeTitle: string): string => {
  const fingerprint = hashText(recipeTitle);
  return `${HERO_CACHE_PREFIX}${recipeId}:${fingerprint}`;
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

  try {
    ensureApiConfigured();
    const response = await apiClient.post<StepImageResponse>('/ai/step-image', {
      recipeId,
      stepText,
      recipeTitle,
      stepNumber,
    });

    const imageUrl = response.data?.imageUrl || null;
    await writeCache(cacheKey, imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Step image generation failed:', error);
    await writeCache(cacheKey, null);
    return null;
  }
};

export const getRecipeImageWithCache = async (
  recipeId: number,
  recipeTitle: string,
  ingredients: string[]
): Promise<string | null> => {
  const cacheKey = buildHeroCacheKey(recipeId, recipeTitle);
  const cached = await readCache(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  try {
    ensureApiConfigured();
    const response = await apiClient.post<StepImageResponse>('/ai/recipe-image', {
      recipeId,
      recipeTitle,
      ingredients,
    });

    const imageUrl = response.data?.imageUrl || null;
    await writeCache(cacheKey, imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Recipe image generation failed:', error);
    await writeCache(cacheKey, null);
    return null;
  }
};
