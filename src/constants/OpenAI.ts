import Constants from 'expo-constants';

const extra =
	Constants.expoConfig?.extra ||
	(Constants.manifest2 as any)?.extra ||
	(Constants.manifest as any)?.extra ||
	{};

export const OPENAI_API_KEY = extra.openaiApiKey || '';
export const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
export const OPENAI_IMAGE_API_URL = 'https://api.openai.com/v1/images/generations';
export const DEEPAI_API_KEY = extra.deepaiApiKey || '';
export const DEEPAI_IMAGE_API_URL = 'https://api.deepai.org/api/text2img';
