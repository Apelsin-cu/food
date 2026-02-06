import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useContext, useLayoutEffect, useState } from 'react';
import { Button, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
// ...
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
// ...
  };

  const handleFindRecipes = () => {
// ...
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { borderColor: colors.accent, color: colors.text, backgroundColor: colors.card }]}
            placeholder="Добавить ингредиент..."
            placeholderTextColor={colors.tabBarInactive}
            value={currentIngredient}
            onChangeText={setCurrentIngredient}
            onSubmitEditing={handleAddIngredient}
          />
          <Button title="Добавить" onPress={handleAddIngredient} color={colors.accent} />
        </View>
        <FlatList
          data={ingredients}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={[styles.ingredientItem, { backgroundColor: colors.card }]}>
              <Text style={[styles.ingredientText, { color: colors.text }]}>{item}</Text>
              <TouchableOpacity onPress={() => handleRemoveIngredient(item)}>
                <Ionicons name="remove-circle-outline" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.tabBarInactive }]}>Ваш холодильник пуст.</Text>}
        />
        <View style={styles.buttonContainer}>
          <Button title="Найти рецепты" onPress={handleFindRecipes} disabled={ingredients.length === 0} color={colors.primary} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
// ...
  },
  inputContainer: {
// ...
  },
  input: {
// ...
  },
  ingredientItem: {
// ...
  },
  ingredientText: {
// ...
  },
  emptyText: {
// ...
  },
  buttonContainer: {
// ...
  }
});

export default RefrigeratorScreen;
