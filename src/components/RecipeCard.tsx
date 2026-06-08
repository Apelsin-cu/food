import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { FavoritesContext } from '../context/FavoritesContext';
import { ThemeContext } from '../context/ThemeContext';
import { Recipe } from '../types/recipe';

const { width } = Dimensions.get('window');

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  index?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress, index = 0 }) => {
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const { colors } = useContext(ThemeContext);
  const favorite = isFavorite(recipe.id);
  const scale = useSharedValue(1);
  const hasImage = Boolean(recipe.imageUrl);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const calories = Math.round(recipe.servings * 140);

  return (
    <AnimatedTouchable
      entering={FadeInDown.delay(index * 80).springify()}
      style={[
        styles.card,
        animatedStyle,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      activeOpacity={1}
    >
      <View style={styles.imageContainer}>
        {hasImage ? (
          <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
        ) : (
          <LinearGradient
            colors={[colors.primary + 'D9', colors.accent + 'B3', '#EFD8C2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.image}
          >
            <Ionicons name="restaurant-outline" size={42} color="#fff" />
          </LinearGradient>
        )}

        <LinearGradient
          colors={['rgba(0,0,0,0.02)', 'rgba(43,33,24,0.78)']}
          style={styles.imageGradient}
        />

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(recipe)}
          activeOpacity={0.85}
        >
          <View style={styles.favoriteBubble}>
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={20}
              color={favorite ? '#E85B52' : '#6B5A49'}
            />
          </View>
        </TouchableOpacity>

        {recipe.sourceName ? (
          <View style={styles.sourceBadge}>
            <Ionicons name="link-outline" size={13} color="#3D2B1F" />
            <Text style={styles.sourceBadgeText}>{recipe.sourceName}</Text>
          </View>
        ) : null}

        <View style={styles.infoOverlay}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.name}
          </Text>

          <View style={styles.badgesContainer}>
            {recipe.isVegetarian && (
              <View style={[styles.badge, { backgroundColor: '#EAF5EA' }]}>
                <Text style={[styles.badgeText, { color: '#466B49' }]}>Вегетарианское</Text>
              </View>
            )}
            {recipe.isVegan && (
              <View style={[styles.badge, { backgroundColor: '#DFF0E0' }]}>
                <Text style={[styles.badgeText, { color: '#2F6B39' }]}>Веган</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.accent + '22' }]}>
              <Ionicons name="timer-outline" size={17} color={colors.accent} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>{recipe.cookingTime}</Text>
              <Text style={[styles.statLabel, { color: colors.tabBarInactive }]}>мин</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + '22' }]}>
              <Ionicons name="people-outline" size={17} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>{recipe.servings}</Text>
              <Text style={[styles.statLabel, { color: colors.tabBarInactive }]}>порции</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FF980022' }]}>
              <Ionicons name="flame-outline" size={17} color="#FFB24A" />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>~{calories}</Text>
              <Text style={[styles.statLabel, { color: colors.tabBarInactive }]}>ккал</Text>
            </View>
          </View>
        </View>

        <View style={[styles.arrowContainer, { backgroundColor: colors.primary }]}>
          <Ionicons name="arrow-forward" size={20} color="#090D13" />
        </View>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width - 32,
    borderRadius: 24,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 214,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 148,
  },
  favoriteButton: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  favoriteBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  sourceBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 244, 224, 0.95)',
  },
  sourceBadgeText: {
    color: '#3D2B1F',
    fontSize: 12,
    fontWeight: '800',
  },
  infoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(125,108,92,0.18)',
    marginHorizontal: 8,
  },
  arrowContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
});

export default RecipeCard;
