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
        <Text style={[styles.emptyText, { color: colors.tabBarInactive }]}>У вас пока нет избранных рецептов.</Text>
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
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
  },
});

export default FavoritesScreen;
