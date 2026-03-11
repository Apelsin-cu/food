import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { ThemeContext } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { translateRecipeTitlesToRussian } from '../services/gptService';
import { getRecommendedRecipes } from '../services/recipeApi';
import { Recipe } from '../types/recipe';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const QUICK_QUERY = ['Быстрый ужин', 'Суп', 'Курица', 'Паста'];

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors } = useContext(ThemeContext);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecommendations = async () => {
    setLoading(true);
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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + '24', colors.accent + '22', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>Рекомендации на сегодня</Text>
          <Text style={[styles.subtitle, { color: colors.tabBarInactive }]}>Идеи блюд под настроение и сезон</Text>
        </View>

        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Recipes')}
        >
          <Text style={styles.searchButtonText}>Открыть поиск рецептов</Text>
        </TouchableOpacity>

        <View style={styles.quickRow}>
          {QUICK_QUERY.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.quickChip, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Recipes', { initialQuery: item })}
            >
              <Text style={{ color: colors.text }}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 12 }}>Загружаем рекомендации...</Text>
        </View>
      ) : (
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
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 14,
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
  },
  searchButton: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickRow: {
    marginTop: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  listContainer: {
    paddingTop: 10,
    paddingBottom: 16,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
