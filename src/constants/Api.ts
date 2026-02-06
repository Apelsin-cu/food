import Constants from 'expo-constants';

// API ключ из app.json extra
const API_KEY = Constants.expoConfig?.extra?.spoonacularApiKey || '';
const BASE_URL = 'https://api.spoonacular.com';

export { API_KEY, BASE_URL };
