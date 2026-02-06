import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useContext, useLayoutEffect, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { ThemeContext } from '../context/ThemeContext';
import { RootTabParamList } from '../navigation/AppNavigator';

type RefrigeratorScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Refrigerator'>;

const RefrigeratorScreen = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const navigation = useNavigation<RefrigeratorScreenNavigationProp>();
  const { colors } = useContext(ThemeContext);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <ThemeSwitcher />,
    });
  }, [navigation]);

  const handleAddIngredient = () => {
    const trimmed = currentIngredient.trim();
    if (trimmed && !ingredients.includes(trimmed.toLowerCase())) {
      setIngredients([...ingredients, trimmed.toLowerCase()]);
      setCurrentIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter(i => i !== ingredientToRemove));
  };

  const handleFindRecipes = () => {
    navigation.navigate('Recipes', { ingredients });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>🥗 Что у вас в холодильнике?</Text>
          <Text style={[styles.subtitle, { color: colors.tabBarInactive }]}>
            Добавьте ингредиенты и найдите рецепты
          </Text>
        </View>

        {/* Поле ввода */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { 
              borderColor: colors.accent, 
              color: colors.text, 
              backgroundColor: colors.card 
            }]}
            placeholder="Например: курица, рис, лук..."
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
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Счётчик */}
        {ingredients.length > 0 && (
          <Text style={[styles.counter, { color: colors.tabBarInactive }]}>
            Добавлено: {ingredients.length} ингредиент(ов)
          </Text>
        )}

        {/* Список ингредиентов */}
        <FlatList
          data={ingredients}
          keyExtractor={(item) => item}
          style={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.ingredientItem, { backgroundColor: colors.card }]}>
              <View style={styles.ingredientLeft}>
                <Text style={styles.ingredientIcon}>🥬</Text>
                <Text style={[styles.ingredientText, { color: colors.text }]}>{item}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => handleRemoveIngredient(item)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={26} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={60} color={colors.tabBarInactive} />
              <Text style={[styles.emptyText, { color: colors.tabBarInactive }]}>
                Холодильник пуст
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.tabBarInactive }]}>
                Добавьте ингредиенты выше
              </Text>
            </View>
          }
        />

        {/* Кнопка поиска */}
        <TouchableOpacity 
          style={[
            styles.findButton, 
            { backgroundColor: ingredients.length > 0 ? colors.primary : colors.tabBarInactive }
          ]}
          onPress={handleFindRecipes}
          disabled={ingredients.length === 0}
        >
          <Ionicons name="search" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.findButtonText}>Найти рецепты</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ingredientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredientIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  ingredientText: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  removeButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
  },
  findButton: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  findButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RefrigeratorScreen;
