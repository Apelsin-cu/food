// API ключ хранится в .env файле для безопасности
const API_KEY = process.env.SPOONACULAR_API_KEY || '';
const BASE_URL = 'https://api.spoonacular.com';

export { API_KEY, BASE_URL };
