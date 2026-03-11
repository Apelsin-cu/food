import fs from 'fs';
import path from 'path';

const readEnvFile = () => {
  const envPath = path.resolve(process.cwd(), '.env');
  const envValues = {};

  if (!fs.existsSync(envPath)) {
    return envValues;
  }

  const raw = fs.readFileSync(envPath, 'utf8');
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['\"]|['\"]$/g, '');
    envValues[key] = value;
  }

  return envValues;
};

const envFromFile = readEnvFile();
const spoonacularApiKey = process.env.SPOONACULAR_API_KEY || envFromFile.SPOONACULAR_API_KEY || '';
const openaiApiKey = process.env.OPENAI_API_KEY || envFromFile.OPENAI_API_KEY || '';
const deepaiApiKey = process.env.DEEPAI_API_KEY || envFromFile.DEEPAI_API_KEY || '';

export default {
  expo: {
    name: "FlavorFinder",
    slug: "food",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "food",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#E6E0F8"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.flavorfinder.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#E6E0F8"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    extra: {
      eas: {
        projectId: "23446a48-64a0-4f3c-ad72-f17caad6c827"
      },
      spoonacularApiKey,
      openaiApiKey,
      deepaiApiKey
    }
  }
};
