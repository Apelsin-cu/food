import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { ThemeContext } from '../context/ThemeContext';
import { RootStackParamList, RootTabParamList } from '../navigation/AppNavigator';
import { findRecipesByIngredients } from '../services/recipeApi';
import { Recipe } from '../types/recipe';

type RecipesScreenRouteProp = RouteProp<RootTabParamList, 'Recipes'>;
type RecipesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecipeDetail'>;

const FilterChip = ({ label, selected, onSelect, colors }: { label: string, selected: boolean, onSelect: () => void, colors: any }) => (
  <TouchableOpacity
    style={[styles.chip, { backgroundColor: colors.card }, selected && [styles.chipSelected, { backgroundColor: colors.primary }]]}
    onPress={onSelect}
  >
    <Text style={[styles.chipText, { color: colors.text }, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

const RecipesScreen = () => {
  const route = useRoute<RecipesScreenRouteProp>();
  const navigation = useNavigation<RecipesScreenNavigationProp>();
  const { ingredients } = route.params;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useContext(ThemeContext);

  // GPT state
  const [gptSuggestions, setGptSuggestions] = useState<string[]>([]);
  const [loadingGpt, setLoadingGpt] = useState(false);
  const [useGpt, setUseGpt] = useState(false);

  // Filter states
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isDairyFree, setIsDairyFree] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const foundRecipes = await findRecipesByIngredients(ingredients);
        setRecipes(foundRecipes);
        setError(null);
      } catch (e) {
        setError('Failed to fetch recipes. Please try again.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [ingredients]);

  // Функция для получения предложений от GPT
  const handleGetGptSuggestions = async () => {
    if (ingredients.length === 0) {
      Alert.alert('Ошибка', 'Добавьте ингредиенты для получения предложений от GPT');
      return;
    }

    setLoadingGpt(true);
    setUseGpt(true);
    try {
      const suggestions = await getRecipeSuggestionsFromGPT(ingredients);
      setGptSuggestions(suggestions);

      if (suggestions.length > 0) {
        // Ищем рецепты по первому предложению GPT
        const allRecipes: Recipe[] = [];
        for (const suggestion of suggestions.slice(0, 3)) {
          const found = await searchRecipesByName(suggestion);
          allRecipes.push(...found);
        }
        // Убираем дубликаты по id
        const uniqueRecipes = allRecipes.filter(
          (recipe, index, self) => index === self.findIndex(r => r.id === recipe.id)
        );
        setRecipes(uniqueRecipes);
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось получить предложения от GPT');
      console.error(e);
    } finally {
      setLoadingGpt(false);
    }
  };

  // Функция для возврата к обычному поиску
  const handleNormalSearch = async () => {
    setUseGpt(false);
    setGptSuggestions([]);
    setLoading(true);
    try {
      const foundRecipes = await findRecipesByIngredients(ingredients);
      setRecipes(foundRecipes);
      setError(null);
    } catch (e) {
      setError('Failed to fetch recipes. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      if (isVegan && !recipe.isVegan) return false;
      if (isGlutenFree && !recipe.isGlutenFree) return false;
      if (isVegetarian && !recipe.isVegetarian) return false;
      if (isDairyFree && !recipe.isDairyFree) return false;
      return true;
    });
  }, [recipes, isVegan, isGlutenFree, isVegetarian, isDairyFree]);


  if (loading || loadingGpt) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>
          {loadingGpt ? 'GPT ищет идеи рецептов...' : 'Finding recipes...'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      {/* GPT кнопка */}
      <View style={styles.gptContainer}>
        <TouchableOpacity
          style={[styles.gptButton, { backgroundColor: useGpt ? colors.accent : colors.primary }]}
          onPress={useGpt ? handleNormalSearch : handleGetGptSuggestions}
        >
          <Ionicons name="sparkles" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.gptButtonText}>
            {useGpt ? 'Обычный поиск' : 'Спросить GPT'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* GPT предложения */}
      {useGpt && gptSuggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.suggestionsTitle, { color: colors.primary }]}>Идеи от GPT:</Text>
          <View style={styles.suggestionsList}>
            {gptSuggestions.map((suggestion, index) => (
              <View key={index} style={[styles.suggestionChip, { backgroundColor: colors.accent }]}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Фильтры */}
      <View style={[styles.filtersContainer, { backgroundColor: colors.background }]}>
        <FilterChip label="Vegan" selected={isVegan} onSelect={() => setIsVegan(!isVegan)} colors={colors} />
        <FilterChip label="Gluten-Free" selected={isGlutenFree} onSelect={() => setIsGlutenFree(!isGlutenFree)} colors={colors} />
        <FilterChip label="Vegetarian" selected={isVegetarian} onSelect={() => setIsVegetarian(!isVegetarian)} colors={colors} />
        <FilterChip label="Dairy-Free" selected={isDairyFree} onSelect={() => setIsDairyFree(!isDairyFree)} colors={colors} />
      </View>

      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} onPress={() => navigation.navigate('RecipeDetail', { recipe: item })} />
        )}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.tabBarInactive }]}>No recipes found for your ingredients and filters.</Text>}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'center',
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    margin: 4,
  },
  chipSelected: {},
  chipText: {},
  chipTextSelected: {
    color: 'white',
  },
  gptContainer: {
    padding: 12,
    alignItems: 'center',
  },
  gptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  gptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    margin: 2,
  },
  suggestionText: {
    color: 'white',
    fontSize: 12,
  },
});

export default RecipesScreen;