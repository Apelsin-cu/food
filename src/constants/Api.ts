import Constants from 'expo-constants';

const extra =
	Constants.expoConfig?.extra ||
	(Constants.manifest2 as any)?.extra ||
	(Constants.manifest as any)?.extra ||
	{};

const API_KEY = extra.spoonacularApiKey || '';
const BASE_URL = 'https://api.spoonacular.com';

export { API_KEY, BASE_URL };
