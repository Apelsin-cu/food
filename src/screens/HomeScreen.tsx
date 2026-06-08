import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { ThemeContext } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { translateRecipeTitlesToRussian } from '../services/gptService';
import { getRecommendedRecipes } from '../services/recipeApi';
import { Recipe } from '../types/recipe';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors, theme } = useContext(ThemeContext);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const recommended = await getRecommendedRecipes();
      const translatedTitles = await translateRecipeTitlesToRussian(
        recommended.map((recipe) => recipe.name)
      );
      const localized = recommended.map((recipe, index) => ({
        ...recipe,
        name: translatedTitles[index] || recipe.name,
      }));
      setRecipes(localized);
    } catch (loadError) {
      console.error(loadError);
      setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить рекомендации.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <RecipeCard
            recipe={item}
            onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
            index={index}
          />
        )}
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={theme === 'dark' ? ['#2D221C', '#211813', '#18221A'] : ['#FFF5EA', '#F6E6D6', '#E8F0E6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.hero, { borderColor: colors.border }]}
            >
              <Text style={[styles.kicker, { color: colors.accent }]}>FlavorFinder</Text>
              <Text style={[styles.title, { color: colors.text }]}>Что приготовить сегодня</Text>
            </LinearGradient>

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Разнообразные рецепты</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: colors.tabBarInactive, marginTop: 12 }}>Загружаем рекомендации...</Text>
            </View>
          ) : error ? (
            <View style={styles.loaderWrap}>
              <Text style={{ color: colors.error, textAlign: 'center', paddingHorizontal: 20 }}>{error}</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    marginTop: 8,
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  listContainer: {
    paddingBottom: 18,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
});

export default HomeScreen;
