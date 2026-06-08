import Constants from 'expo-constants';
import { Platform } from 'react-native';

type ExtraConfig = {
  apiBaseUrl?: string;
};

const extra = (Constants.expoConfig?.extra || {}) as ExtraConfig;

type ExpoHostSource = {
  hostUri?: string;
  debuggerHost?: string;
};

const normalizeBaseUrl = (value?: string): string => {
  if (!value) {
    return '';
  }

  return value.trim().replace(/\/+$/, '');
};

const extractHost = (value?: string): string => {
  if (!value) {
    return '';
  }

  return value.split(',')[0]?.split(':')[0]?.trim() || '';
};

const getExpoHost = (): string => {
  const possibleSources: ExpoHostSource[] = [
    Constants.expoConfig ?? {},
    (Constants as typeof Constants & { expoGoConfig?: ExpoHostSource }).expoGoConfig ?? {},
    ((Constants as typeof Constants & { manifest2?: { extra?: { expoGo?: ExpoHostSource } } }).manifest2?.extra
      ?.expoGo ?? {}) as ExpoHostSource,
  ];

  for (const source of possibleSources) {
    const host = extractHost(source.hostUri) || extractHost(source.debuggerHost);
    if (host) {
      return host;
    }
  }

  return '';
};

const replaceLoopbackHost = (value: string): string => {
  if (!value || Platform.OS === 'web') {
    return value;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value);
  } catch {
    return value;
  }

  const hostname = parsedUrl.hostname;
  const isLoopback =
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';

  if (!isLoopback) {
    return value;
  }

  const host = getExpoHost();
  if (!host) {
    return value;
  }

  parsedUrl.hostname = host;
  return parsedUrl.toString().replace(/\/+$/, '');
};

const getDevApiFallback = (): string => {
  if (Platform.OS === 'web') {
    return '';
  }

  const host = getExpoHost();
  if (!host) {
    return '';
  }

  return `http://${host}:3001`;
};

const getNativeUsbApiFallback = (): string => {
  if (Platform.OS === 'web') {
    return '';
  }

  return 'http://127.0.0.1:3001';
};

const configuredBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  extra.apiBaseUrl ||
  getDevApiFallback() ||
  getNativeUsbApiFallback();

export const API_BASE_URL = normalizeBaseUrl(replaceLoopbackHost(configuredBaseUrl));

export const isApiConfigured = API_BASE_URL.length > 0;

export const API_CONFIGURATION_ERROR =
  'Сервис не настроен. Укажите EXPO_PUBLIC_API_BASE_URL и подключите backend API.';
