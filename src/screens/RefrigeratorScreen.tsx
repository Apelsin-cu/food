import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useLayoutEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    Layout,
    SlideInRight,
    SlideOutLeft,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { ThemeContext } from '../context/ThemeContext';
import { RootTabParamList } from '../navigation/AppNavigator';

type RefrigeratorScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Refrigerator'>;

const FOOD_EMOJIS = ['🥬', '🍅', '🥕', '🧅', '🥩', '🍗', '🧀', '🥚', '🍞', '🥛', '🍎', '🍋', '🥒', '🌶️', '🍄'];

const getRandomEmoji = () => FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];

interface IngredientItemProps {
  item: string;
  emoji: string;
  onRemove: () => void;
  colors: any;
  index: number;
}

const IngredientItem: React.FC<IngredientItemProps> = ({ item, emoji, onRemove, colors, index }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={SlideInRight.delay(index * 50).springify()}
      exiting={SlideOutLeft.duration(200)}
      layout={Layout.springify()}
      style={[styles.ingredientItem, animatedStyle, { backgroundColor: colors.card }]}
    >
      <View style={styles.ingredientLeft}>
        <View style={[styles.emojiContainer, { backgroundColor: colors.accent + '20' }]}>
          <Text style={styles.ingredientIcon}>{emoji}</Text>
        </View>
        <Text style={[styles.ingredientText, { color: colors.text }]}>{item}</Text>
      </View>
      <TouchableOpacity 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onRemove}
        style={styles.removeButton}
      >
        <LinearGradient
          colors={['#FF6B6B', '#EE5A5A']}
          style={styles.removeGradient}
        >
          <Ionicons name="close" size={18} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const RefrigeratorScreen = () => {
  const [ingredients, setIngredients] = useState<{name: string, emoji: string}[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const navigation = useNavigation<RefrigeratorScreenNavigationProp>();
  const { colors, theme } = useContext(ThemeContext);
  
  const buttonScale = useSharedValue(1);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <ThemeSwitcher />,
    });
  }, [navigation]);

  const handleAddIngredient = () => {
    const trimmed = currentIngredient.trim().toLowerCase();
    if (trimmed && !ingredients.find(i => i.name === trimmed)) {
      setIngredients([...ingredients, { name: trimmed, emoji: getRandomEmoji() }]);
      setCurrentIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter(i => i.name !== ingredientToRemove));
  };

  const handleFindRecipes = () => {
    navigation.navigate('Recipes', { ingredients: ingredients.map(i => i.name) });
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleButtonPressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Animated Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>
            🍳 Что приготовим?
          </Text>
          <Text style={[styles.subtitle, { color: colors.tabBarInactive }]}>
            Добавьте ингредиенты из холодильника
          </Text>
        </Animated.View>

        {/* Input Container */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()} 
          style={styles.inputWrapper}
        >
          <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="add-circle-outline" size={24} color={colors.accent} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Введите ингредиент..."
              placeholderTextColor={colors.tabBarInactive}
              value={currentIngredient}
              onChangeText={setCurrentIngredient}
              onSubmitEditing={handleAddIngredient}
              returnKeyType="done"
            />
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.accent }]}
              onPress={handleAddIngredient}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Counter */}
        {ingredients.length > 0 && (
          <Animated.View 
            entering={FadeIn} 
            style={[styles.counterContainer, { backgroundColor: colors.primary + '15' }]}
          >
            <Ionicons name="cube-outline" size={16} color={colors.primary} />
            <Text style={[styles.counter, { color: colors.primary }]}>
              {ingredients.length} ингредиент{ingredients.length === 1 ? '' : ingredients.length < 5 ? 'а' : 'ов'}
            </Text>
          </Animated.View>
        )}

        {/* Ingredients List */}
        <Animated.FlatList
          data={ingredients}
          keyExtractor={(item) => item.name}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <IngredientItem
              item={item.name}
              emoji={item.emoji}
              onRemove={() => handleRemoveIngredient(item.name)}
              colors={colors}
              index={index}
            />
          )}
          ListEmptyComponent={
            <Animated.View 
              entering={FadeIn.delay(300)} 
              style={styles.emptyContainer}
            >
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
                <Ionicons name="nutrition-outline" size={50} color={colors.tabBarInactive} />
              </View>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Холодильник пуст
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.tabBarInactive }]}>
                Начните добавлять ингредиенты{'\n'}которые есть у вас дома
              </Text>
            </Animated.View>
          }
        />

        {/* Find Recipes Button */}
        <Animated.View 
          entering={FadeInDown.delay(400).springify()}
          style={[styles.buttonWrapper, animatedButtonStyle]}
        >
          <TouchableOpacity 
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            onPress={handleFindRecipes}
            disabled={ingredients.length === 0}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={ingredients.length > 0 
                ? [colors.primary, colors.accent] 
                : [colors.tabBarInactive, colors.tabBarInactive]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.findButton}
            >
              <Ionicons name="search" size={22} color="white" />
              <Text style={styles.findButtonText}>Найти рецепты</Text>
              <Ionicons name="arrow-forward" size={22} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 12,
    gap: 6,
  },
  counter: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginVertical: 5,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  ingredientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emojiContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ingredientIcon: {
    fontSize: 22,
  },
  ingredientText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  removeGradient: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonWrapper: {
    marginTop: 16,
  },
  findButton: {
    flexDirection: 'row',
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  findButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default RefrigeratorScreen;
