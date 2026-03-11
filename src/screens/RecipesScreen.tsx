import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { ThemeContext } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { translateRecipeTitlesToRussian } from '../services/gptService';
import { findRecipesByIngredients, searchRecipesByName } from '../services/recipeApi';
import { Recipe } from '../types/recipe';

type RecipesScreenRouteProp = RouteProp<RootStackParamList, 'Recipes'>;
type RecipesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecipeDetail'>;

type SortMode = 'relevance' | 'time' | 'servings';

const QUICK_PRODUCTS = [
  'картофель', 'лук', 'чеснок', 'морковь', 'помидор', 'огурец', 'капуста', 'перец',
  'курица', 'говядина', 'свинина', 'рыба', 'яйца', 'молоко', 'сыр', 'масло',
  'рис', 'макароны', 'грибы', 'хлеб',
];

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
  colors: any;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.filterChip,
      { borderColor: colors.border, backgroundColor: colors.card },
      active && { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
    ]}
  >
    <Text style={{ color: active ? colors.primary : colors.text }}>{label}</Text>
  </TouchableOpacity>
);

const RecipesScreen = () => {
  const route = useRoute<RecipesScreenRouteProp>();
  const navigation = useNavigation<RecipesScreenNavigationProp>();
  const { colors } = useContext(ThemeContext);
  const initialIngredients = route.params?.ingredients || [];
  const initialQuery = route.params?.initialQuery || '';

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

  const parseIngredientsFromQuery = (query: string): string[] => {
    if (query.includes(',')) {
      return query
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (query.split(' ').length > 1) {
      return [];
    }

    return [query];
  };

  const handleSearch = async () => {
    const query = searchText.trim();
    setLoading(true);
    setError(null);

    try {
      let found: Recipe[] = [];

      if (query.length > 0) {
        found = await searchRecipesByName(query);
        if (found.length === 0) {
          const asIngredients = parseIngredientsFromQuery(query);

          if (asIngredients.length > 0) {
            found = await findRecipesByIngredients(asIngredients);
          }
        }
      } else if (initialIngredients.length > 0) {
        found = await findRecipesByIngredients(initialIngredients);
      }

      const normalized = found.filter((item) => Boolean(item.imageUrl));
      const translatedTitles = await translateRecipeTitlesToRussian(
        normalized.map((recipe) => recipe.name)
      );
      const localized = normalized.map((recipe, index) => ({
        ...recipe,
        name: translatedTitles[index] || recipe.name,
      }));

      setRecipes(localized);
      if (found.length === 0) {
        setError('Ничего не найдено. Попробуйте другое название или список продуктов через запятую.');
      }
    } catch (e) {
      setError('Ошибка поиска рецептов. Проверьте интернет и API ключи.');
      console.error(e);
    } finally {
      setLoading(false);
      setSortOpen(false);
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
    if (sortMode === 'time') {
      clone.sort((a, b) => a.cookingTime - b.cookingTime);
    }
    if (sortMode === 'servings') {
      clone.sort((a, b) => b.servings - a.servings);
    }
    return clone;
  }, [recipes, sortMode, isVegan, isVegetarian, isGlutenFree, isDairyFree, isFried, isBoiled, isBaked]);

  const quickHint = QUICK_PRODUCTS.join(', ');

  useEffect(() => {
    if ((initialQuery && initialQuery.trim()) || initialIngredients.length > 0) {
      handleSearch();
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.headline, { color: colors.text }]}>Найди рецепт по продуктам или названию</Text>
      <Text style={[styles.subHeadline, { color: colors.tabBarInactive }]}>Пример: курица, грибы, сливки</Text>

      <View style={[styles.controlsCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={styles.searchRow}>
        <TextInput
          style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
          placeholder="Введите продукт"
          placeholderTextColor={colors.tabBarInactive}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.primary }]} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Искать</Text>
        </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => setSortOpen((prev) => !prev)}
        >
          <Text style={{ color: colors.text }}>{SORT_OPTIONS.find((item) => item.key === sortMode)?.label}</Text>
        </TouchableOpacity>
      </View>

      {sortOpen && (
        <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={styles.dropdownItem}
              onPress={() => {
                setSortMode(option.key);
                setSortOpen(false);
              }}
            >
              <Text style={{ color: option.key === sortMode ? colors.primary : colors.text }}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.filtersWrap}>
        <FilterChip label="Веган" active={isVegan} onPress={() => setIsVegan((v) => !v)} colors={colors} />
        <FilterChip label="Вегетарианское" active={isVegetarian} onPress={() => setIsVegetarian((v) => !v)} colors={colors} />
        <FilterChip label="Без глютена" active={isGlutenFree} onPress={() => setIsGlutenFree((v) => !v)} colors={colors} />
        <FilterChip label="Без молока" active={isDairyFree} onPress={() => setIsDairyFree((v) => !v)} colors={colors} />
        <FilterChip label="Жареное" active={isFried} onPress={() => setIsFried((v) => !v)} colors={colors} />
        <FilterChip label="Вареное" active={isBoiled} onPress={() => setIsBoiled((v) => !v)} colors={colors} />
        <FilterChip label="В духовке" active={isBaked} onPress={() => setIsBaked((v) => !v)} colors={colors} />
      </View>

      {!loading && recipes.length === 0 && !error && (
        <View style={[styles.emptyHintWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.hintText, { color: colors.tabBarInactive }]}>Примеры для поиска: {quickHint}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 10 }}>Ищем рецепты...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.centerWrap}>
          <Text style={{ color: colors.error, textAlign: 'center', marginBottom: 10 }}>{error}</Text>
          <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.primary }]} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Повторить</Text>
          </TouchableOpacity>
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
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 12,
    marginBottom: 8,
  },
  subHeadline: {
    marginHorizontal: 12,
    marginBottom: 8,
  },
  controlsCard: {
    marginHorizontal: 12,
    padding: 10,
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchButton: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  sortButton: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  dropdown: {
    marginHorizontal: 12,
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  filtersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 12,
    marginTop: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  hintText: {
    lineHeight: 20,
  },
  emptyHintWrap: {
    marginHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
});

export default RecipesScreen;
