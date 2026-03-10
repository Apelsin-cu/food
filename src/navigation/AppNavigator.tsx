import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import FavoritesScreen from '../screens/FavoritesScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import RefrigeratorScreen from '../screens/RefrigeratorScreen';
import { Recipe } from '../types/recipe';

const RecipesScreen = require('../screens/RecipesScreen').default;

export type RootStackParamList = {
  Main: undefined;
  RecipeDetail: { recipe: Recipe };
};

export type RootTabParamList = {
  Refrigerator: undefined;
  Recipes: { ingredients: string[] };
  Favorites: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const MainTabs = () => {
  const { colors } = useContext(ThemeContext);
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarIcon: () => null,
        headerStyle: {
          backgroundColor: colors.tabBar,
        },
        headerTitleStyle: {
          color: colors.primary,
        },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
        }
      }}
    >
      <Tab.Screen name="Refrigerator" component={RefrigeratorScreen} options={{ title: 'Мой холодильник' }} />
      <Tab.Screen name="Recipes" component={RecipesScreen} options={{ title: 'Рецепты' }} initialParams={{ ingredients: [] }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Избранное' }} />
    </Tab.Navigator>
  );
}

const AppNavigator = () => {
  const { colors, theme } = useContext(ThemeContext);
  const baseTheme = theme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.tabBar,
          },
          headerTitleStyle: {
            color: colors.primary,
          },
          headerTintColor: colors.primary,
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Детали рецепта' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
