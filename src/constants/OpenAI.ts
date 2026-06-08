import { API_BASE_URL } from './AppConfig';

export const OPENAI_API_URL = API_BASE_URL ? `${API_BASE_URL}/ai/chat` : '';
export const OPENAI_IMAGE_API_URL = API_BASE_URL ? `${API_BASE_URL}/ai/images` : '';
export const DEEPAI_IMAGE_API_URL = API_BASE_URL ? `${API_BASE_URL}/ai/images/deepai` : '';
