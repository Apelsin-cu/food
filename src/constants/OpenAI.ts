import Constants from 'expo-constants';

// API ключ из app.json extra
export const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey || '';
export const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
