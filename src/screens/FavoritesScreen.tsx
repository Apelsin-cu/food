import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { FavoritesContext } from '../context/FavoritesContext';
import { ThemeContext } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fallbackTranslateTextToRussian } from '../services/gptService';

type FavoritesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecipeDetail'>;

const FavoritesScreen = () => {
  const { favorites } = useContext(FavoritesContext);
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const { colors } = useContext(ThemeContext);

  const localizedFavorites = useMemo(
    () =>
      favorites.map((item) => ({
        ...item,
        name: fallbackTranslateTextToRussian(item.name),
      })),
    [favorites]
  );

  if (localizedFavorites.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Ionicons name="heart-dislike-outline" size={80} color={colors.tabBarInactive} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Нет избранных</Text>
        <Text style={[styles.emptyText, { color: colors.tabBarInactive }]}>
          Нажмите ❤️ на рецепте, чтобы{"\n"}добавить его в избранное
        </Text>
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Recipes')}
        >
          <Text style={styles.emptyButtonText}>Перейти к поиску рецептов</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={localizedFavorites}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <RecipeCard recipe={item} onPress={() => navigation.navigate('RecipeDetail', { recipe: item })} />
      )}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '700',
  },
});

export default FavoritesScreen;
