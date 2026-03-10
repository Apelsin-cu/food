import Constants from 'expo-constants';

const extra =
	Constants.expoConfig?.extra ||
	(Constants.manifest2 as any)?.extra ||
	(Constants.manifest as any)?.extra ||
	{};

export const OPENAI_API_KEY = extra.openaiApiKey || '';
export const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
