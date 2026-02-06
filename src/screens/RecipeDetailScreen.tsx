import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useContext } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type RecipeDetailScreenRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;

const RecipeDetailScreen = () => {
  const route = useRoute<RecipeDetailScreenRouteProp>();
  const { recipe } = route.params;
  const { colors } = useContext(ThemeContext);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={[styles.title, { color: colors.primary }]}>{recipe.name}</Text>
        
        <View style={[styles.infoRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          <View style={styles.infoItem}>
            <Ionicons name="timer-outline" size={20} color={colors.tabBarInactive} />
            <Text style={[styles.infoText, { color: colors.text }]}>{recipe.cookingTime} min</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={20} color={colors.tabBarInactive} />
            <Text style={[styles.infoText, { color: colors.text }]}>{recipe.servings} servings</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Ingredients</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <Text key={index} style={[styles.listItem, { color: colors.text }]}>• {ingredient}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Instructions</Text>
          {recipe.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionStep}>
              <Text style={[styles.stepNumber, { color: colors.primary }]}>{index + 1}</Text>
              <Text style={[styles.stepText, { color: colors.text }]}>{instruction}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumber: {
    marginRight: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  }
});

export default RecipeDetailScreen;
