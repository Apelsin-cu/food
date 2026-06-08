import axios from 'axios';
import { API_BASE_URL, API_CONFIGURATION_ERROR } from '../constants/AppConfig';

export class ApiConfigurationError extends Error {
  constructor(message = API_CONFIGURATION_ERROR) {
    super(message);
    this.name = 'ApiConfigurationError';
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 8000,
});

export const ensureApiConfigured = () => {
  if (!API_BASE_URL) {
    throw new ApiConfigurationError();
  }
};

const translateBackendError = (message: string): string => {
  if (message.includes('SPOONACULAR_API_KEY')) {
    return 'На backend не указан SPOONACULAR_API_KEY. Поиск по внешней базе недоступен, но локальные рецепты продолжат работать.';
  }

  if (message.includes('OPENAI_API_KEY')) {
    return 'На backend не указан OPENAI_API_KEY. ИИ-генерация недоступна, но локальная генерация рецептов продолжит работать.';
  }

  if (message.includes('Route not found')) {
    return 'Backend запущен, но нужный маршрут не найден. Проверьте, что используется сервер из этого проекта.';
  }

  return message;
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiConfigurationError) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Backend недоступен. Приложение переключилось на локальные рецепты.';
    }

    const apiMessage =
      typeof error.response.data?.error === 'string'
        ? error.response.data.error
        : typeof error.response.data?.message === 'string'
          ? error.response.data.message
          : '';

    if (apiMessage) {
      return translateBackendError(apiMessage);
    }
  }

  if (error instanceof Error && error.message) {
    return translateBackendError(error.message);
  }

  return fallback;
};
