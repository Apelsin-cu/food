import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import RecipeCard from '../components/RecipeCard';
import { FavoritesContext } from '../context/FavoritesContext';
import { ThemeContext } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type FavoritesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecipeDetail'>;

const FavoritesScreen = () => {
  const { favorites } = useContext(FavoritesContext);
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const { colors } = useContext(ThemeContext);

  if (favorites.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Ionicons name="heart-dislike-outline" size={80} color={colors.tabBarInactive} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Нет избранных</Text>
        <Text style={[styles.emptyText, { color: colors.tabBarInactive }]}>
          Нажмите ❤️ на рецепте, чтобы{"\n"}добавить его в избранное
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={favorites}
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
});

export default FavoritesScreen;
