import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { ThemeContext } from '../context/ThemeContext';
import { RootStackParamList, RootTabParamList } from '../navigation/AppNavigator';
import { getRecipeSuggestionsFromGPT } from '../services/gptService';
import { findRecipesByIngredients, searchRecipesByName } from '../services/recipeApi';
import { Recipe } from '../types/recipe';

type RecipesScreenRouteProp = RouteProp<RootTabParamList, 'Recipes'>;
type RecipesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecipeDetail'>;

const FilterChip = ({ 
  label, 
  selected, 
  onSelect, 
  colors 
}: { 
  label: string; 
  selected: boolean; 
  onSelect: () => void; 
  colors: any;
}) => (
  <TouchableOpacity
    style={[
      styles.chip, 
      { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }, 
      selected && { backgroundColor: colors.primary, borderColor: colors.primary }
    ]}
    onPress={onSelect}
  >
    <Text style={[
      styles.chipText, 
      { color: colors.text }, 
      selected && { color: 'white' }
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const RecipesScreen = () => {
  const route = useRoute<RecipesScreenRouteProp>();
  const navigation = useNavigation<RecipesScreenNavigationProp>();
  const { ingredients = [] } = route.params || {};
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
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
    if (ingredients.length === 0) {
      setLoading(false);
      return;
    }

    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        const foundRecipes = await findRecipesByIngredients(ingredients);
        setRecipes(foundRecipes);
      } catch (e) {
        setError('Не удалось загрузить рецепты. Попробуйте ещё.');
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
      Alert.alert('Ошибка', 'Сначала добавьте ингредиенты в холодильник');
      return;
    }

    setLoadingGpt(true);
    setUseGpt(true);
    try {
      const suggestions = await getRecipeSuggestionsFromGPT(ingredients);
      setGptSuggestions(suggestions);

      if (suggestions.length > 0) {
        const allRecipes: Recipe[] = [];
        for (const suggestion of suggestions.slice(0, 3)) {
          const found = await searchRecipesByName(suggestion);
          allRecipes.push(...found);
        }
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
    if (ingredients.length === 0) return;
    
    setUseGpt(false);
    setGptSuggestions([]);
    setLoading(true);
    try {
      const foundRecipes = await findRecipesByIngredients(ingredients);
      setRecipes(foundRecipes);
      setError(null);
    } catch (e) {
      setError('Не удалось загрузить рецепты. Попробуйте ещё.');
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

  // Если нет ингредиентов
  if (ingredients.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="restaurant-outline" size={80} color={colors.tabBarInactive} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Нет ингредиентов</Text>
        <Text style={[styles.emptySubtitle, { color: colors.tabBarInactive }]}>
          Добавьте ингредиенты в холодильник,{'\n'}чтобы найти рецепты
        </Text>
      </View>
    );
  }

  if (loading || loadingGpt) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {loadingGpt ? '🤖 GPT ищет идеи рецептов...' : '🔍 Ищем рецепты...'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="cloud-offline-outline" size={60} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={handleNormalSearch}
        >
          <Text style={styles.retryButtonText}>Попробовать снова</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* GPT кнопка */}
      <View style={styles.gptContainer}>
        <TouchableOpacity
          style={[styles.gptButton, { backgroundColor: useGpt ? colors.accent : colors.primary }]}
          onPress={useGpt ? handleNormalSearch : handleGetGptSuggestions}
        >
          <Ionicons name="sparkles" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.gptButtonText}>
            {useGpt ? 'Обычный поиск' : '✨ Спросить GPT'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* GPT предложения */}
      {useGpt && gptSuggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.suggestionsTitle, { color: colors.primary }]}>
            💡 Идеи от GPT:
          </Text>
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
      <View style={styles.filtersContainer}>
        <FilterChip label="🌱 Веган" selected={isVegan} onSelect={() => setIsVegan(!isVegan)} colors={colors} />
        <FilterChip label="🌾 Без глютена" selected={isGlutenFree} onSelect={() => setIsGlutenFree(!isGlutenFree)} colors={colors} />
        <FilterChip label="🥗 Вегетарианское" selected={isVegetarian} onSelect={() => setIsVegetarian(!isVegetarian)} colors={colors} />
        <FilterChip label="🥛 Без молока" selected={isDairyFree} onSelect={() => setIsDairyFree(!isDairyFree)} colors={colors} />
      </View>

      {/* Список рецептов */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RecipeCard 
            recipe={item} 
            onPress={() => navigation.navigate('RecipeDetail', { recipe: item })} 
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Ionicons name="search-outline" size={50} color={colors.tabBarInactive} />
            <Text style={[styles.emptyListText, { color: colors.tabBarInactive }]}>
              Рецепты не найдены для ваших ингредиентов и фильтров
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  gptContainer: {
    padding: 12,
    alignItems: 'center',
  },
  gptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  gptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
  },
  suggestionsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    margin: 3,
  },
  suggestionText: {
    color: 'white',
    fontSize: 13,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 15,
  },
});

export default RecipesScreen;
