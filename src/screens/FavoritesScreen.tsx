import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
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
  const { colors, theme } = useContext(ThemeContext);

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
        <LinearGradient
          colors={theme === 'dark' ? ['#2D221C', '#211813', '#18221A'] : ['#FFF4EA', '#F7E5D3', '#E7F0E7']}
          style={[styles.emptyCard, { borderColor: colors.border }]}
        >
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.card }]}>
            <Ionicons name="heart-outline" size={44} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Пока нет избранных</Text>
          <Text style={[styles.emptyText, { color: colors.tabBarInactive }]}>
            Сохраняйте понравившиеся рецепты, чтобы быстро вернуться к ним позже.
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Recipes')}
          >
            <Text style={styles.emptyButtonText}>Перейти к рецептам</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={localizedFavorites}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item, index }) => (
        <RecipeCard
          recipe={item}
          index={index}
          onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
        />
      )}
      contentContainerStyle={styles.listContainer}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Избранные рецепты</Text>
          <Text style={[styles.headerText, { color: colors.tabBarInactive }]}>
            Ваши сохраненные блюда для быстрого доступа.
          </Text>
        </View>
      }
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
    paddingTop: 12,
    paddingBottom: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerText: {
    marginTop: 4,
    fontSize: 14,
  },
  emptyCard: {
    width: '100%',
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 82,
    height: 82,
    borderRadius: 41,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: 20,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#11151d',
    fontWeight: '700',
  },
});

export default FavoritesScreen;
