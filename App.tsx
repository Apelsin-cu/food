import React from 'react';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <AppNavigator />
      </FavoritesProvider>
    </ThemeProvider>
  );
}
