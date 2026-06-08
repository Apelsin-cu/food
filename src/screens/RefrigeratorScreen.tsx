import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useLayoutEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  Layout,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { AppColors } from '../constants/Colors';
import { ThemeContext } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getLocalQuickProducts } from '../services/recipeApi';

type RefrigeratorScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface IngredientItemProps {
  item: string;
  onRemove: () => void;
  colors: AppColors;
  index: number;
}

const IngredientItem: React.FC<IngredientItemProps> = ({ item, onRemove, colors, index }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={SlideInRight.delay(index * 50).springify()}
      exiting={SlideOutLeft.duration(200)}
      layout={Layout.springify()}
      style={[
        styles.ingredientItem,
        animatedStyle,
        { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
      ]}
    >
      <View style={styles.ingredientLeft}>
        <Text style={[styles.ingredientText, { color: colors.text }]}>{item}</Text>
      </View>
      <TouchableOpacity
        onPressIn={() => {
          scale.value = withSpring(0.95);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={onRemove}
        style={styles.removeButton}
      >
        <LinearGradient colors={['#FF6B6B', '#EE5A5A']} style={styles.removeGradient}>
          <Ionicons name="close" size={18} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const RefrigeratorScreen = () => {
  const quickIngredients = getLocalQuickProducts();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const navigation = useNavigation<RefrigeratorScreenNavigationProp>();
  const { colors, theme } = useContext(ThemeContext);
  const buttonScale = useSharedValue(1);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <ThemeSwitcher />,
    });
  }, [navigation]);

  const addIngredient = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed || ingredients.includes(trimmed)) {
      return;
    }

    setIngredients((prev) => [...prev, trimmed]);
    setCurrentIngredient('');
    setSuggestions([]);
  };

  const handleAddIngredient = () => {
    addIngredient(currentIngredient);
  };

  const handleIngredientInputChange = (value: string) => {
    setCurrentIngredient(value);
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      setSuggestions([]);
      return;
    }

    setSuggestions(
      quickIngredients.filter((item) => item.includes(normalized) && !ingredients.includes(item)).slice(
        0,
        7
      )
    );
  };

  const handleFindRecipes = () => {
    navigation.navigate('Recipes', { ingredients, strictIngredients: false });
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LinearGradient
            colors={theme === 'dark' ? ['#2D221C', '#211813', '#18221A'] : ['#FFF5EA', '#F6E5D4', '#E7F0E6']}
            style={[styles.heroCard, { borderColor: colors.border }]}
          >
            <Text style={[styles.title, { color: colors.text }]}>Что есть в холодильнике?</Text>
            <Text style={[styles.subtitle, { color: colors.tabBarInactive }]}>
              Добавьте продукты, а приложение подберет блюда и составит пошаговый рецепт.
            </Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.inputWrapper}>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
            ]}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={colors.accent}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Введите продукт..."
              placeholderTextColor={colors.tabBarInactive}
              value={currentIngredient}
              onChangeText={handleIngredientInputChange}
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

        {suggestions.length > 0 && (
          <View style={[styles.suggestionsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={suggestion}
                onPress={() => addIngredient(suggestion)}
                style={[
                  styles.suggestionButton,
                  index === suggestions.length - 1 && styles.suggestionButtonLast,
                ]}
              >
                <Text style={{ color: colors.text }}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.quickProductsSection}>
          <Text style={[styles.quickProductsLabel, { color: colors.tabBarInactive }]}>
            Быстрый выбор продуктов
          </Text>
          <View style={styles.quickProductsWrap}>
            {quickIngredients
              .filter((item) => !ingredients.includes(item))
              .slice(0, 10)
              .map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.quickProductChip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => addIngredient(item)}
                >
                  <Text style={[styles.quickProductText, { color: colors.text }]}>{item}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {ingredients.length > 0 && (
          <Animated.View entering={FadeIn} style={[styles.counterContainer, { backgroundColor: colors.chip }]}>
            <Ionicons name="cube-outline" size={16} color={colors.primary} />
            <Text style={[styles.counter, { color: colors.primary }]}>
              {ingredients.length} ингредиент{ingredients.length === 1 ? '' : ingredients.length < 5 ? 'а' : 'ов'}
            </Text>
          </Animated.View>
        )}

        <Animated.FlatList
          data={ingredients}
          keyExtractor={(item) => item}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <IngredientItem
              item={item}
              onRemove={() => setIngredients((prev) => prev.filter((value) => value !== item))}
              colors={colors}
              index={index}
            />
          )}
          ListEmptyComponent={
            <Animated.View entering={FadeIn.delay(300)} style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
                <Ionicons name="nutrition-outline" size={50} color={colors.tabBarInactive} />
              </View>
              <Text style={[styles.emptyText, { color: colors.text }]}>Холодильник пока пуст</Text>
              <Text style={[styles.emptySubtext, { color: colors.tabBarInactive }]}>
                Добавьте ингредиенты, которые есть дома,{'\n'}и приложение подберет подходящий рецепт
              </Text>
            </Animated.View>
          }
        />

        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={[styles.buttonWrapper, animatedButtonStyle]}
        >
          <TouchableOpacity
            onPressIn={() => {
              buttonScale.value = withSpring(0.95);
            }}
            onPressOut={() => {
              buttonScale.value = withSpring(1);
            }}
            onPress={handleFindRecipes}
            disabled={ingredients.length === 0}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={
                ingredients.length > 0
                  ? [colors.primary, colors.accent]
                  : [colors.tabBarInactive, colors.tabBarInactive]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.findButton}
            >
              <Ionicons name="search" size={22} color="#0b0f14" />
              <Text style={styles.findButtonText}>Подобрать рецепты</Text>
              <Ionicons name="arrow-forward" size={22} color="#0b0f14" />
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
    padding: 16,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 18,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputWrapper: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
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
    color: '#fff',
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
  suggestionsBox: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  suggestionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  suggestionButtonLast: {
    borderBottomWidth: 0,
  },
  quickProductsSection: {
    marginBottom: 12,
  },
  quickProductsLabel: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
  },
  quickProductsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickProductChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickProductText: {
    fontSize: 13,
    fontWeight: '700',
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
    borderWidth: 1,
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
  ingredientText: {
    fontSize: 16,
    fontWeight: '600',
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
    color: '#0b0f14',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default RefrigeratorScreen;
