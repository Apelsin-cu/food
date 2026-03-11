import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import FavoritesScreen from '../screens/FavoritesScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import RefrigeratorScreen from '../screens/RefrigeratorScreen';
import { Recipe } from '../types/recipe';

const HomeScreen = require('../screens/HomeScreen').default;
const RecipesScreen = require('../screens/RecipesScreen').default;

export type RootStackParamList = {
  Main: undefined;
  Recipes: {
    ingredients?: string[];
    initialQuery?: string;
  } | undefined;
  RecipeDetail: { recipe: Recipe };
};

export type RootTabParamList = {
  Home: undefined;
  Refrigerator: undefined;
  Favorites: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const MainTabs = () => {
  const { colors } = useContext(ThemeContext);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'ellipse-outline';

          if (route.name === 'Home') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'Refrigerator') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerStyle: {
          backgroundColor: colors.tabBar,
        },
        headerTitleStyle: {
          color: colors.primary,
        },
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          marginHorizontal: 12,
          marginBottom: 10,
          borderRadius: 16,
          height: 58,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOpacity: 0.12,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 8,
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Рекомендации' }} />
      <Tab.Screen name="Refrigerator" component={RefrigeratorScreen} options={{ title: 'Мой холодильник' }} />
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
        <Stack.Screen name="Recipes" component={RecipesScreen} options={{ title: 'Рецепты' }} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Детали рецепта' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
