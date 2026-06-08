import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { AppColors } from '../constants/Colors';
import { ThemeContext } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { generateRecipeFromIngredients, translateRecipeTitlesToRussian } from '../services/gptService';
import { detailedRecipeToCard } from '../services/localRecipeService';
import { findRecipesByIngredients, getLocalQuickProducts, searchRecipesByName } from '../services/recipeApi';
import { Recipe } from '../types/recipe';

type RecipesScreenRouteProp = RouteProp<RootStackParamList, 'Recipes'>;
type RecipesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecipeDetail'>;
type SortMode = 'relevance' | 'time' | 'servings';

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'relevance', label: 'Сортировка: по релевантности' },
  { key: 'time', label: 'Сортировка: быстрее готовится' },
  { key: 'servings', label: 'Сортировка: больше порций' },
];

const FilterChip = ({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: AppColors;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.filterChip,
      { borderColor: colors.border, backgroundColor: colors.card },
      active && { borderColor: colors.primary, backgroundColor: colors.primary + '18' },
    ]}
  >
    <Text style={{ color: active ? colors.primary : colors.text }}>{label}</Text>
  </TouchableOpacity>
);

const RecipesScreen = () => {
  const quickProducts = getLocalQuickProducts();
  const route = useRoute<RecipesScreenRouteProp>();
  const navigation = useNavigation<RecipesScreenNavigationProp>();
  const { colors, theme } = useContext(ThemeContext);
  const initialIngredients = route.params?.ingredients || [];
  const initialQuery = route.params?.initialQuery || '';
  const strictIngredients = route.params?.strictIngredients || false;

  const [searchText, setSearchText] = useState(initialQuery);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('relevance');
  const [sortOpen, setSortOpen] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isDairyFree, setIsDairyFree] = useState(false);
  const [isFried, setIsFried] = useState(false);
  const [isBoiled, setIsBoiled] = useState(false);
  const [isBaked, setIsBaked] = useState(false);
  const [aiRecipe, setAiRecipe] = useState<Recipe | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(initialIngredients);
  const activeFiltersCount = [
    isVegan,
    isVegetarian,
    isGlutenFree,
    isDairyFree,
    isFried,
    isBoiled,
    isBaked,
  ].filter(Boolean).length;

  const addIngredient = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return;
    }

    setSelectedIngredients((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
    setSearchText('');
    setSuggestions([]);
  };

  const clearSelectedIngredients = () => {
    setSelectedIngredients([]);
    setRecipes([]);
    setAiRecipe(null);
    setError(null);
  };

  const submitIngredientInput = () => {
    if (!searchText.trim()) {
      return;
    }

    addIngredient(searchText);
  };

  const updateSuggestions = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (normalized.length < 2) {
      setSuggestions([]);
      return;
    }

    setSuggestions(
      quickProducts
        .filter(
          (item) =>
            item.includes(normalized) &&
            item !== normalized &&
            !selectedIngredients.includes(item)
        )
        .slice(0, 6)
    );
  };

  const handleSearch = async () => {
    const query = searchText.trim();
    setLoading(true);
    setError(null);
    setAiRecipe(null);

    try {
      let ingredients = [...selectedIngredients];
      let foundRecipes: Recipe[] = [];

      if (query.length > 0 && ingredients.length === 0) {
        const normalizedQuery = query.toLowerCase();
        const matchedProduct = quickProducts.find((item) => item === normalizedQuery);
        if (matchedProduct || query.split(/\s+/).length === 1) {
          ingredients = [matchedProduct || normalizedQuery];
        }
      }

      if (ingredients.length > 0) {
        foundRecipes = await findRecipesByIngredients(ingredients, strictIngredients);
      } else if (query.length > 0) {
        foundRecipes = await searchRecipesByName(query);
      } else {
        setError('Введите хотя бы один ингредиент или название блюда.');
        setRecipes([]);
        return;
      }

      if (foundRecipes.length > 0) {
        const translatedTitles = await translateRecipeTitlesToRussian(
          foundRecipes.map((item) => item.name)
        );
        foundRecipes = foundRecipes.map((item, index) => ({
          ...item,
          name: translatedTitles[index] || item.name,
        }));
      }

      setRecipes(foundRecipes);

      if (!strictIngredients && foundRecipes.length === 0 && ingredients.length > 0) {
        const detailed = await generateRecipeFromIngredients(ingredients);
        if (detailed) {
          setAiRecipe(detailedRecipeToCard(detailed));
        } else {
          setError('Не удалось составить рецепт по этим продуктам. Попробуйте уточнить список ингредиентов.');
        }
      }
    } catch (searchError) {
      console.error(searchError);
      setError(searchError instanceof Error ? searchError.message : 'Произошла ошибка поиска рецептов.');
      setRecipes([]);
    } finally {
      setLoading(false);
      setSortOpen(false);
      setSuggestions([]);
    }
  };

  const sortedRecipes = useMemo(() => {
    const filtered = recipes.filter((recipe) => {
      if (isVegan && !recipe.isVegan) return false;
      if (isVegetarian && !recipe.isVegetarian) return false;
      if (isGlutenFree && !recipe.isGlutenFree) return false;
      if (isDairyFree && !recipe.isDairyFree) return false;

      const joinedSteps = recipe.instructions.join(' ').toLowerCase();
      if (isFried && !/жар|обжар|fry|saute/.test(joinedSteps)) return false;
      if (isBoiled && !/вар|кип|boil/.test(joinedSteps)) return false;
      if (isBaked && !/духов|запек|bake|oven|roast/.test(joinedSteps)) return false;

      return true;
    });

    const clone = [...filtered];
    if (sortMode === 'time') clone.sort((a, b) => a.cookingTime - b.cookingTime);
    if (sortMode === 'servings') clone.sort((a, b) => b.servings - a.servings);
    return clone;
  }, [recipes, sortMode, isVegan, isVegetarian, isGlutenFree, isDairyFree, isFried, isBoiled, isBaked]);

  useEffect(() => {
    if ((initialQuery && initialQuery.trim()) || initialIngredients.length > 0) {
      handleSearch();
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={theme === 'dark' ? ['#2D221C', '#211813', '#18221A'] : ['#FFF5EA', '#F6E5D4', '#E7EFE6']}
        style={[styles.hero, { borderColor: colors.border }]}
      >
        <Text style={[styles.headline, { color: colors.text }]}>Поиск</Text>
      </LinearGradient>

      <View style={[styles.controlsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.searchRow}>
          <TextInput
            style={[
              styles.searchInput,
              { borderColor: colors.border, color: colors.text, backgroundColor: colors.card },
            ]}
            placeholder={selectedIngredients.length > 0 ? 'Добавьте еще продукт' : 'Например: рис'}
            placeholderTextColor={colors.tabBarInactive}
            value={searchText}
            onChangeText={(value) => {
              setSearchText(value);
              updateSuggestions(value);
            }}
            onSubmitEditing={submitIngredientInput}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            onPress={searchText.trim() ? submitIngredientInput : handleSearch}
          >
            <Text style={styles.searchButtonText}>{searchText.trim() ? '+' : 'Искать'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionsButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => setSortOpen((prev) => !prev)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
            {activeFiltersCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {selectedIngredients.length > 0 && (
          <View style={styles.selectedSummaryRow}>
            <View style={styles.selectedSummaryLeft}>
              <Ionicons name="basket-outline" size={16} color={colors.primary} />
              <Text style={[styles.selectedSummaryText, { color: colors.tabBarInactive }]}>
                Выбрано продуктов: {selectedIngredients.length}
              </Text>
            </View>
            <TouchableOpacity onPress={clearSelectedIngredients}>
              <Text style={[styles.clearSelectedText, { color: colors.primary }]}>Очистить</Text>
            </TouchableOpacity>
          </View>
        )}

        {suggestions.length > 0 && (
          <View
            style={[
              styles.suggestionsBox,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
          >
            {suggestions.map((item, index) => (
              <Pressable
                key={item}
                style={[
                  styles.suggestionItem,
                  index === suggestions.length - 1 && styles.suggestionItemLast,
                ]}
                onPress={() => addIngredient(item)}
              >
                <Text style={{ color: colors.text }}>{item}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {sortOpen && (
          <View style={[styles.optionsPanel, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.optionsTitle, { color: colors.text }]}>Сортировка</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionRow,
                  sortMode === option.key && { backgroundColor: colors.primary + '18' },
                ]}
                onPress={() => setSortMode(option.key)}
              >
                <Text style={{ color: sortMode === option.key ? colors.primary : colors.text }}>
                  {option.label}
                </Text>
                {sortMode === option.key && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            <Text style={[styles.optionsTitle, { color: colors.text }]}>Фильтры</Text>
            <View style={styles.filtersMenuWrap}>
              <FilterChip label="Веган" active={isVegan} onPress={() => setIsVegan((v) => !v)} colors={colors} />
              <FilterChip
                label="Вегетарианское"
                active={isVegetarian}
                onPress={() => setIsVegetarian((v) => !v)}
                colors={colors}
              />
              <FilterChip
                label="Без глютена"
                active={isGlutenFree}
                onPress={() => setIsGlutenFree((v) => !v)}
                colors={colors}
              />
              <FilterChip
                label="Без молока"
                active={isDairyFree}
                onPress={() => setIsDairyFree((v) => !v)}
                colors={colors}
              />
              <FilterChip label="Жареное" active={isFried} onPress={() => setIsFried((v) => !v)} colors={colors} />
              <FilterChip label="Вареное" active={isBoiled} onPress={() => setIsBoiled((v) => !v)} colors={colors} />
              <FilterChip label="В духовке" active={isBaked} onPress={() => setIsBaked((v) => !v)} colors={colors} />
            </View>
          </View>
        )}
      </View>

      {loading && (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 10 }}>Подбираем рецепты...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.centerWrap}>
          <Text style={{ color: colors.error, textAlign: 'center', marginBottom: 10 }}>{error}</Text>
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && aiRecipe && !error && (
        <View style={styles.aiSection}>
          <Text style={[styles.aiTitle, { color: colors.text }]}>Полный рецепт по вашим продуктам</Text>
          <RecipeCard
            recipe={aiRecipe}
            onPress={() => navigation.navigate('RecipeDetail', { recipe: aiRecipe })}
          />
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={sortedRecipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <RecipeCard
              recipe={item}
              index={index}
              onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
            />
          )}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            !aiRecipe ? (
              <View style={styles.centerWrap}>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {strictIngredients ? 'Точных рецептов пока нет' : 'Ничего не найдено'}
                </Text>
                <Text style={[styles.emptyText, { color: colors.tabBarInactive }]}>
                  {strictIngredients
                    ? 'В режиме холодильника показываются только блюда из выбранных вами продуктов. Добавьте еще ингредиенты или попробуйте другой набор.'
                    : 'Попробуйте уточнить запрос, изменить фильтры или выбрать другие продукты.'}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  hero: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
  },
  controlsCard: {
    marginHorizontal: 12,
    padding: 10,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 6,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 6,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchButton: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#11151d',
    fontWeight: '700',
  },
  optionsButton: {
    width: 44,
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    right: 6,
    top: 5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#11151d',
    fontSize: 10,
    fontWeight: '800',
  },
  suggestionsBox: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  selectedSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 2,
  },
  selectedSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  selectedSummaryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  clearSelectedText: {
    fontSize: 13,
    fontWeight: '800',
  },
  optionsPanel: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
  },
  optionsTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  optionRow: {
    minHeight: 38,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filtersMenuWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  aiSection: {
    paddingTop: 8,
  },
  aiTitle: {
    marginHorizontal: 16,
    marginBottom: 4,
    fontSize: 18,
    fontWeight: '800',
  },
});

export default RecipesScreen;
