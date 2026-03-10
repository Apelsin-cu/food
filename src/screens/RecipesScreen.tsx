import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { ThemeContext } from '../context/ThemeContext';
import { RootStackParamList, RootTabParamList } from '../navigation/AppNavigator';
import { findRecipesByIngredients, searchRecipesByName } from '../services/recipeApi';
import { Recipe } from '../types/recipe';

type RecipesScreenRouteProp = RouteProp<RootTabParamList, 'Recipes'>;
type RecipesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecipeDetail'>;

const QUICK_PRODUCTS = [
  'картофель', 'лук', 'чеснок', 'морковь', 'помидор', 'огурец', 'капуста', 'перец',
  'курица', 'говядина', 'свинина', 'рыба', 'яйца', 'молоко', 'сыр', 'масло',
  'рис', 'макароны', 'грибы', 'хлеб',
];

const FilterChip = ({
  label,
  selected,
  onSelect,
  colors,
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
      selected && { backgroundColor: colors.primary, borderColor: colors.primary },
    ]}
    onPress={onSelect}
  >
    <Text style={[styles.chipText, { color: colors.text }, selected && { color: 'white' }]}>{label}</Text>
  </TouchableOpacity>
);

const RecipesScreen = () => {
  const route = useRoute<RecipesScreenRouteProp>();
  const navigation = useNavigation<RecipesScreenNavigationProp>();
  const { ingredients = [] } = route.params || {};
  const { colors } = useContext(ThemeContext);

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(ingredients);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productSearchText, setProductSearchText] = useState('');
  const [productSuggestions, setProductSuggestions] = useState<string[]>([]);
  const [recipeSearchText, setRecipeSearchText] = useState('');

  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isDairyFree, setIsDairyFree] = useState(false);
  const [isFrying, setIsFrying] = useState(false);
  const [isBoiling, setIsBoiling] = useState(false);

  useEffect(() => {
    setSelectedIngredients(ingredients);
  }, [ingredients]);

  const fetchByIngredients = async (sourceIngredients: string[]) => {
    if (sourceIngredients.length === 0) {
      setRecipes([]);
      setError('Добавьте хотя бы один продукт для подбора рецептов.');
      return;
    }

    setLoading(true);
    try {
      const foundRecipes = await findRecipesByIngredients(sourceIngredients);
      setRecipes(foundRecipes.filter((item) => Boolean(item.imageUrl)));
      setError(null);
    } catch (e) {
      setError('Не удалось загрузить рецепты. Проверьте API ключи и интернет.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!recipeSearchText.trim()) {
      await fetchByIngredients(selectedIngredients);
      return;
    }

    setLoading(true);
    try {
      const foundRecipes = await searchRecipesByName(recipeSearchText);
      setRecipes(foundRecipes.filter((item) => Boolean(item.imageUrl)));
      setError(null);
    } catch (e) {
      setError('Не удалось выполнить поиск по названию.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSearchTextChange = (text: string) => {
    setProductSearchText(text);

    if (!text.trim()) {
      setProductSuggestions([]);
      return;
    }

    const normalized = text.trim().toLowerCase();
    const suggestions = QUICK_PRODUCTS.filter((product) => product.includes(normalized)).slice(0, 8);
    setProductSuggestions(suggestions);
  };

  const addProduct = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return;
    }

    if (!selectedIngredients.includes(normalized)) {
      setSelectedIngredients((prev) => [...prev, normalized]);
    }

    setProductSearchText('');
    setProductSuggestions([]);
  };

  const removeProduct = (value: string) => {
    setSelectedIngredients((prev) => prev.filter((item) => item !== value));
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      if (isVegan && !recipe.isVegan) return false;
      if (isGlutenFree && !recipe.isGlutenFree) return false;
      if (isVegetarian && !recipe.isVegetarian) return false;
      if (isDairyFree && !recipe.isDairyFree) return false;
      if (isFrying && !recipe.instructions.some((step) => step.toLowerCase().includes('fry'))) return false;
      if (isBoiling && !recipe.instructions.some((step) => step.toLowerCase().includes('boil'))) return false;
      return true;
    });
  }, [recipes, isVegan, isGlutenFree, isVegetarian, isDairyFree, isFrying, isBoiling]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.searchSection}>
        <TextInput
          style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
          placeholder="Быстрый поиск продукта"
          placeholderTextColor={colors.tabBarInactive}
          value={productSearchText}
          onChangeText={handleProductSearchTextChange}
          onSubmitEditing={() => addProduct(productSearchText)}
          returnKeyType="done"
        />
        <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.primary }]} onPress={() => addProduct(productSearchText)}>
          <Text style={styles.searchButtonText}>Добавить</Text>
        </TouchableOpacity>
      </View>

      {productSuggestions.length > 0 && (
        <ScrollView style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {productSuggestions.map((suggestion) => (
            <TouchableOpacity key={suggestion} onPress={() => addProduct(suggestion)}>
              <Text style={[styles.suggestionItem, { color: colors.text }]}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.ingredientsRow}>
        {selectedIngredients.map((item) => (
          <TouchableOpacity key={item} style={[styles.selectedChip, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => removeProduct(item)}>
            <Text style={{ color: colors.text }}>{item} x</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
          placeholder="Поиск рецепта по названию"
          placeholderTextColor={colors.tabBarInactive}
          value={recipeSearchText}
          onChangeText={setRecipeSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.primary }]} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Искать</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <FilterChip label="Веган" selected={isVegan} onSelect={() => setIsVegan(!isVegan)} colors={colors} />
        <FilterChip label="Без глютена" selected={isGlutenFree} onSelect={() => setIsGlutenFree(!isGlutenFree)} colors={colors} />
        <FilterChip label="Вегетарианское" selected={isVegetarian} onSelect={() => setIsVegetarian(!isVegetarian)} colors={colors} />
        <FilterChip label="Без молока" selected={isDairyFree} onSelect={() => setIsDairyFree(!isDairyFree)} colors={colors} />
        <FilterChip label="Жарка" selected={isFrying} onSelect={() => setIsFrying(!isFrying)} colors={colors} />
        <FilterChip label="Варка" selected={isBoiling} onSelect={() => setIsBoiling(!isBoiling)} colors={colors} />
      </View>

      {loading && (
        <View style={[styles.centerContainer, { backgroundColor: colors.background }]}> 
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Ищем рецепты...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={[styles.centerContainer, { backgroundColor: colors.background }]}> 
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => fetchByIngredients(selectedIngredients)}>
            <Text style={styles.retryButtonText}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <RecipeCard
              recipe={item}
              onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
              index={index}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <Text style={[styles.emptyListText, { color: colors.tabBarInactive }]}>Рецепты не найдены для выбранных продуктов и фильтров</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
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
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchButton: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  suggestionsContainer: {
    maxHeight: 160,
    marginHorizontal: 10,
    marginTop: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  ingredientsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingTop: 8,
    gap: 8,
  },
  selectedChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 15,
  },
});

export default RecipesScreen;
