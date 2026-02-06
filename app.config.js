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
      // API ключи из переменных окружения (EAS Secrets)
      spoonacularApiKey: process.env.SPOONACULAR_API_KEY || '',
      openaiApiKey: process.env.OPENAI_API_KEY || ''
    }
  }
};
