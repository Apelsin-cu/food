import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fallbackTranslateTextToRussian, getDetailedRecipeInRussian } from '../services/gptService';
import { getStepImageWithCache } from '../services/imageGenerationService';

type RecipeDetailScreenRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;

const RecipeDetailScreen = () => {
  const route = useRoute<RecipeDetailScreenRouteProp>();
  const { recipe } = route.params;
  const { colors } = useContext(ThemeContext);
  const [titleRu, setTitleRu] = useState(recipe.name);
  const [ingredientsRu, setIngredientsRu] = useState<string[]>(recipe.ingredients);
  const [stepsRu, setStepsRu] = useState<string[]>(recipe.instructions);
  const [stepImages, setStepImages] = useState<string[]>([]);
  const [enriching, setEnriching] = useState(false);
  const [attemptedImageIndexes, setAttemptedImageIndexes] = useState<number[]>([]);
  const [generatingImages, setGeneratingImages] = useState(false);

  useEffect(() => {
    const localize = async () => {
      setEnriching(true);
      const detailed = await getDetailedRecipeInRussian(recipe);

      if (detailed) {
        setTitleRu(detailed.title);
        setIngredientsRu(detailed.ingredients);
        setStepsRu(detailed.steps);
      } else {
        setTitleRu(fallbackTranslateTextToRussian(recipe.name));
        setIngredientsRu(recipe.ingredients.map((item) => fallbackTranslateTextToRussian(item)));
        if (recipe.instructions.length > 0) {
          const expanded = recipe.instructions.map(
            (step, idx) =>
              `Шаг ${idx + 1}. ${fallbackTranslateTextToRussian(step)}. После выполнения шага проверьте вкус, соль и степень готовности ингредиентов, затем переходите к следующему шагу.`
          );
          setStepsRu(expanded);
        }
      }

      setEnriching(false);
    };

    localize();
  }, [recipe]);

  useEffect(() => {
    const generateMissingStepImages = async () => {
      if (stepsRu.length === 0) {
        return;
      }

      const missingIndexes = stepsRu
        .map((_, index) => index)
        .filter((index) => !stepImages[index] && !attemptedImageIndexes.includes(index))
        .slice(0, 4);

      if (missingIndexes.length === 0) {
        return;
      }

      setGeneratingImages(true);

      for (const index of missingIndexes) {
        const generated = await getStepImageWithCache(recipe.id, stepsRu[index], titleRu, index + 1);
        setAttemptedImageIndexes((prev) => [...prev, index]);

        if (generated) {
          setStepImages((prev) => {
            const next = [...prev];
            next[index] = generated;
            return next;
          });
        }
      }

      setGeneratingImages(false);
    };

    generateMissingStepImages();
  }, [stepsRu, stepImages, attemptedImageIndexes, titleRu]);

  const stepCards = useMemo(
    () =>
      stepsRu.map((text, index) => ({
        id: `${index}`,
        text,
        imageUrl: stepImages[index],
      })),
    [stepsRu, stepImages]
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={[styles.title, { color: colors.primary }]}>{titleRu}</Text>
        
        <View style={[styles.infoRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          <View style={styles.infoItem}>
            <Ionicons name="timer-outline" size={20} color={colors.tabBarInactive} />
            <Text style={[styles.infoText, { color: colors.text }]}>{recipe.cookingTime} мин</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={20} color={colors.tabBarInactive} />
            <Text style={[styles.infoText, { color: colors.text }]}>{recipe.servings} порций</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Ингредиенты</Text>
          {ingredientsRu.map((ingredient, index) => (
            <Text key={index} style={[styles.listItem, { color: colors.text }]}>• {ingredient}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Пошаговый фото рецепт</Text>
          {enriching && (
            <View style={styles.enrichingWrap}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ color: colors.tabBarInactive, marginLeft: 8 }}>Делаем подробную русскую версию...</Text>
            </View>
          )}
          {generatingImages && (
            <View style={styles.enrichingWrap}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ color: colors.tabBarInactive, marginLeft: 8 }}>Генерируем изображения шагов...</Text>
            </View>
          )}
          {stepCards.map((step, index) => (
            <View key={step.id} style={[styles.stepCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
              {step.imageUrl ? (
                <Image source={{ uri: step.imageUrl }} style={styles.stepImage} />
              ) : (
                <View style={[styles.imageFallback, { backgroundColor: colors.background }]}> 
                  <Text style={{ color: colors.tabBarInactive }}>Фото шага генерируется...</Text>
                </View>
              )}
              <View style={styles.stepTextWrap}>
                <Text style={[styles.stepNumber, { color: colors.primary }]}>Шаг {index + 1}</Text>
                <Text style={[styles.stepText, { color: colors.text }]}>{step.text}</Text>
              </View>
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
  stepCard: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  stepImage: {
    width: '100%',
    height: 180,
  },
  imageFallback: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTextWrap: {
    padding: 12,
  },
  enrichingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  stepText: {
    fontSize: 16,
    lineHeight: 24,
  }
});

export default RecipeDetailScreen;
