import React, { useEffect, useMemo, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, RootTabParamList } from '../navigation/AppNavigator';
import { findRecipesByIngredients } from '../services/recipeApi';
import { Recipe } from '../types/recipe';
import RecipeCard from '../components/RecipeCard';
import { ThemeContext } from '../context/ThemeContext';

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

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      if (isVegan && !recipe.isVegan) return false;
      if (isGlutenFree && !recipe.isGlutenFree) return false;
      if (isVegetarian && !recipe.isVegetarian) return false;
      if (isDairyFree && !recipe.isDairyFree) return false;
      return true;
    });
  }, [recipes, isVegan, isGlutenFree, isVegetarian, isDairyFree]);


  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text }}>Finding recipes...</Text>
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
  }
});

export default RecipesScreen;