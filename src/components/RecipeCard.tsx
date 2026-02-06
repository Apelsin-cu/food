import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext } from 'react';
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { FavoritesContext } from '../context/FavoritesContext';
import { ThemeContext } from '../context/ThemeContext';
import { Recipe } from '../types/recipe';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  index?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress, index = 0 }) => {
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const { colors, theme } = useContext(ThemeContext);
  const favorite = isFavorite(recipe.id);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleFavoritePress = () => {
    toggleFavorite(recipe);
  };

  return (
    <AnimatedTouchable 
      entering={FadeInDown.delay(index * 100).springify()}
      style={[styles.card, animatedStyle, { shadowColor: colors.shadow }]} 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        
        {/* Favorite Button with Blur */}
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={handleFavoritePress}
          activeOpacity={0.8}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
              <Ionicons 
                name={favorite ? 'heart' : 'heart-outline'} 
                size={24} 
                color={favorite ? '#FF6B6B' : 'white'} 
              />
            </BlurView>
          ) : (
            <View style={[styles.blurContainer, styles.androidBlur]}>
              <Ionicons 
                name={favorite ? 'heart' : 'heart-outline'} 
                size={24} 
                color={favorite ? '#FF6B6B' : 'white'} 
              />
            </View>
          )}
        </TouchableOpacity>

        {/* Info Overlay */}
        <View style={styles.infoOverlay}>
          <Text style={styles.title} numberOfLines={2}>{recipe.name}</Text>
          
          <View style={styles.badgesContainer}>
            {recipe.isVegetarian && (
              <View style={[styles.badge, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.badgeText}>🥗 Вегетарианское</Text>
              </View>
            )}
            {recipe.isVegan && (
              <View style={[styles.badge, { backgroundColor: '#8BC34A' }]}>
                <Text style={styles.badgeText}>🌱 Веган</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      {/* Bottom Info */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.card }]}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="timer-outline" size={18} color={colors.accent} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>{recipe.cookingTime}</Text>
              <Text style={[styles.statLabel, { color: colors.tabBarInactive }]}>минут</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="people-outline" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>{recipe.servings}</Text>
              <Text style={[styles.statLabel, { color: colors.tabBarInactive }]}>порций</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FF9800' + '20' }]}>
              <Ionicons name="flame-outline" size={18} color="#FF9800" />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>~{recipe.servings * 150}</Text>
              <Text style={[styles.statLabel, { color: colors.tabBarInactive }]}>ккал</Text>
            </View>
          </View>
        </View>
        
        {/* Arrow */}
        <View style={[styles.arrowContainer, { backgroundColor: colors.primary }]}>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </View>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 220,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  blurContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  androidBlur: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(128,128,128,0.2)',
    marginHorizontal: 12,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RecipeCard;
