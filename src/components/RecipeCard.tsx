import { Ionicons } from '@expo/vector-icons';
import React, { useContext } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FavoritesContext } from '../context/FavoritesContext';
import { ThemeContext } from '../context/ThemeContext';
import { Recipe } from '../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => {
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const { colors } = useContext(ThemeContext);
  const favorite = isFavorite(recipe.id);

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]} onPress={onPress}>
      <View>
        <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
        <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(recipe)}>
          <Ionicons 
            name={favorite ? 'heart' : 'heart-outline'} 
            size={30} 
            color={favorite ? colors.error : 'white'} 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{recipe.name}</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="timer-outline" size={16} color={colors.tabBarInactive} />
            <Text style={[styles.detailText, { color: colors.tabBarInactive }]}>{recipe.cookingTime} мин</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={16} color={colors.tabBarInactive} />
            <Text style={[styles.detailText, { color: colors.tabBarInactive }]}>{recipe.servings} порц.</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 4,
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
  },
});

export default RecipeCard;
