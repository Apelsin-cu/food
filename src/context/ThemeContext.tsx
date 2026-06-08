import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { AppColors, lightColors, darkColors } from '../constants/Colors';

type Theme = 'light' | 'dark';
const THEME_STORAGE_KEY = '@FoodApp:theme';

interface ThemeContextData {
  theme: Theme;
  colors: AppColors;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemTheme || 'light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setTheme(storedTheme);
          return;
        }

        setTheme(systemTheme || 'light');
      } catch (error) {
        console.error('Failed to load theme.', error);
      }
    };

    loadTheme();
  }, [systemTheme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const nextTheme = prevTheme === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme).catch((error) => {
        console.error('Failed to save theme.', error);
      });
      return nextTheme;
    });
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
