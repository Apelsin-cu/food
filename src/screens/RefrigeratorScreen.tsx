import React, { useState, useContext, useLayoutEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation/AppNavigator';
import { ThemeContext } from '../context/ThemeContext';
import ThemeSwitcher from '../components/ThemeSwitcher';

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
            placeholder="Add an ingredient..."
            placeholderTextColor={colors.tabBarInactive}
            value={currentIngredient}
            onChangeText={setCurrentIngredient}
            onSubmitEditing={handleAddIngredient}
          />
          <Button title="Add" onPress={handleAddIngredient} color={colors.accent} />
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
          ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.tabBarInactive }]}>Your refrigerator is empty.</Text>}
        />
        <View style={styles.buttonContainer}>
          <Button title="Find Recipes" onPress={handleFindRecipes} disabled={ingredients.length === 0} color={colors.primary} />
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
