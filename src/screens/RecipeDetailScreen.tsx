import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fallbackTranslateTextToRussian, getDetailedRecipeInRussian } from '../services/gptService';
import { getRecipeImageWithCache, getStepImageWithCache } from '../services/imageGenerationService';
import { getFallbackRecipeImage, isLocalRecipe } from '../services/localRecipeService';
import { getRecipeStepVisuals } from '../services/recipeApi';
import {
  getLocalStepVisualAsset,
  getRecipeSpecificStepImageAsset,
  getRecipeSpecificStepImageUrl,
} from '../services/stepVisualAssets';

type RecipeDetailScreenRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;

type StepVisualHint = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  colors: [string, string];
};

const getStepVisualHint = (stepText: string): StepVisualHint => {
  const text = stepText.toLowerCase();

  if (/(нареж|пореж|измельч|нашинку|cut|chop|slice)/.test(text)) {
    return { icon: 'cut-outline', label: 'Подготовка ингредиентов', colors: ['#F7D7B5', '#F0B17A'] };
  }

  if (/(разогре|обжар|жар|сковород|fry|saute|sear|pan)/.test(text)) {
    return { icon: 'flame-outline', label: 'Обжарка', colors: ['#F8B38A', '#E57C55'] };
  }

  if (/(отвар|вар|кип|boil|simmer|pot)/.test(text)) {
    return { icon: 'water-outline', label: 'Варка', colors: ['#B7D9F7', '#6FA6D8'] };
  }

  if (/(запек|духов|печ|bake|oven|roast)/.test(text)) {
    return { icon: 'restaurant-outline', label: 'Запекание', colors: ['#D8B48B', '#B97345'] };
  }

  if (/(смеш|перемеш|соедин|mix|stir|combine)/.test(text)) {
    return { icon: 'refresh-outline', label: 'Смешивание', colors: ['#C6DFC8', '#7AAC7F'] };
  }

  if (/(пода|укрась|serve|plate|garnish)/.test(text)) {
    return { icon: 'sparkles-outline', label: 'Подача', colors: ['#F6D8C6', '#D89B72'] };
  }

  return { icon: 'restaurant-outline', label: 'Шаг приготовления', colors: ['#E8D8C8', '#C9A98B'] };
};

const RecipeDetailScreen = () => {
  const route = useRoute<RecipeDetailScreenRouteProp>();
  const { recipe } = route.params;
  const { colors } = useContext(ThemeContext);
  const [titleRu, setTitleRu] = useState(recipe.name);
  const [ingredientsRu, setIngredientsRu] = useState<string[]>(recipe.ingredients);
  const [stepsRu, setStepsRu] = useState<string[]>(recipe.instructions);
  const [heroImageUrl, setHeroImageUrl] = useState(recipe.imageUrl);
  const [stepImages, setStepImages] = useState<string[]>([]);
  const [failedStepImages, setFailedStepImages] = useState<Record<string, boolean>>({});
  const [enriching, setEnriching] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [generatingHeroImage, setGeneratingHeroImage] = useState(false);
  const requestedStepIndexesRef = useRef<Set<number>>(new Set());
  const builtInRecipe = isLocalRecipe(recipe);
  const resolvedHeroImage = heroImageUrl || getFallbackRecipeImage(titleRu, ingredientsRu);

  useEffect(() => {
    let cancelled = false;

    const localize = async () => {
      setEnriching(true);
      try {
        const [detailed, visuals] = await Promise.all([
          getDetailedRecipeInRussian(recipe),
          getRecipeStepVisuals(recipe.id),
        ]);

        if (cancelled) {
          return;
        }

        const fallbackTitle = fallbackTranslateTextToRussian(recipe.name);
        const fallbackIngredients = recipe.ingredients.map((item) => fallbackTranslateTextToRussian(item));
        const fallbackSteps =
          recipe.instructions.length > 0
            ? recipe.instructions.map((step) => fallbackTranslateTextToRussian(step))
            : visuals
                .map((item) => fallbackTranslateTextToRussian(item.text || ''))
                .filter((item) => item.trim().length > 0);

        setTitleRu(detailed?.title || fallbackTitle);
        setIngredientsRu(detailed?.ingredients?.length ? detailed.ingredients : fallbackIngredients);
        setStepsRu(detailed?.steps?.length ? detailed.steps : fallbackSteps);
        setStepImages(visuals.map((item) => item.imageUrl || ''));
      } finally {
        if (!cancelled) {
          setEnriching(false);
        }
      }
    };

    setHeroImageUrl(recipe.imageUrl);
    setStepImages([]);
    setFailedStepImages({});
    requestedStepIndexesRef.current = new Set();

    if (builtInRecipe) {
      setTitleRu(recipe.name);
      setIngredientsRu(recipe.ingredients);
      setStepsRu(recipe.instructions);
      return () => {
        cancelled = true;
      };
    }

    localize();

    return () => {
      cancelled = true;
    };
  }, [builtInRecipe, recipe]);

  useEffect(() => {
    const generateHeroImage = async () => {
      if (builtInRecipe || heroImageUrl || !titleRu.trim()) {
        return;
      }

      setGeneratingHeroImage(true);
      const generated = await getRecipeImageWithCache(recipe.id, titleRu, ingredientsRu);
      if (generated) {
        setHeroImageUrl(generated);
      }
      setGeneratingHeroImage(false);
    };

    generateHeroImage();
  }, [builtInRecipe, heroImageUrl, ingredientsRu, recipe.id, titleRu]);

  useEffect(() => {
    let cancelled = false;

    const generateMissingStepImages = async () => {
      if (builtInRecipe || stepsRu.length === 0) {
        return;
      }

      const missingIndexes = stepsRu
        .map((_, index) => index)
        .filter((index) => !stepImages[index] && !requestedStepIndexesRef.current.has(index));

      if (missingIndexes.length === 0) {
        return;
      }

      missingIndexes.forEach((index) => requestedStepIndexesRef.current.add(index));

      setGeneratingImages(true);
      try {
        for (let offset = 0; offset < missingIndexes.length; offset += 4) {
          const batch = missingIndexes.slice(offset, offset + 4);
          const results = await Promise.all(
            batch.map(async (index) => ({
              index,
              generated: await getStepImageWithCache(recipe.id, stepsRu[index], titleRu, index + 1),
            }))
          );

          if (cancelled) {
            return;
          }

          setStepImages((prev) => {
            const next = [...prev];
            results.forEach((result) => {
              if (result.generated) {
                next[result.index] = result.generated;
              }
            });
            return next;
          });
        }
      } finally {
        if (!cancelled) {
          setGeneratingImages(false);
        }
      }
    };

    generateMissingStepImages();

    return () => {
      cancelled = true;
    };
  }, [builtInRecipe, stepsRu, stepImages, titleRu, recipe.id]);

  const stepCards = useMemo(
    () =>
      stepsRu.map((text, index) => {
        const recipeSpecificImage = getRecipeSpecificStepImageAsset(recipe.id, index);

        return {
          id: `${index}`,
          text,
          imageUrl: stepImages[index] || getRecipeSpecificStepImageUrl(recipe.id, index),
          localImageSource: recipeSpecificImage || getLocalStepVisualAsset(text, index, stepsRu.length),
          visualHint: getStepVisualHint(text),
        };
      }),
    [recipe.id, stepImages, stepsRu]
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.heroWrap}>
        {resolvedHeroImage ? (
          <Image source={{ uri: resolvedHeroImage }} style={styles.heroImage} />
        ) : (
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroImage, styles.heroPlaceholder]}
          >
            <Ionicons name="restaurant-outline" size={54} color="#fff" />
          </LinearGradient>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{titleRu}</Text>

        {generatingHeroImage && (
          <View style={[styles.enrichingWrap, styles.infoBadge, { backgroundColor: colors.chip }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.badgeTextMuted, { color: colors.tabBarInactive }]}>
              Подбираем изображение блюда...
            </Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <View style={[styles.metaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="timer-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>{recipe.cookingTime} мин</Text>
          </View>
          <View style={[styles.metaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="people-outline" size={20} color={colors.accent} />
            <Text style={[styles.infoText, { color: colors.text }]}>{recipe.servings} порции</Text>
          </View>
        </View>

        {recipe.sourceUrl && (
          <TouchableOpacity
            style={[styles.sourceBadge, { backgroundColor: colors.chip }]}
            onPress={() => Linking.openURL(recipe.sourceUrl!)}
          >
            <Ionicons name="link-outline" size={17} color={colors.primary} />
            <Text style={[styles.sourceText, { color: colors.primary }]}>
              Основано на рецепте {recipe.sourceName || 'Food.ru'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ингредиенты</Text>
          {ingredientsRu.map((ingredient, index) => (
            <Text key={index} style={[styles.listItem, { color: colors.text }]}>
              • {ingredient}
            </Text>
          ))}
        </View>

        <View style={styles.stepsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Пошаговый рецепт</Text>

          {enriching && (
            <View style={[styles.enrichingWrap, styles.infoBadge, { backgroundColor: colors.chip }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.badgeTextMuted, { color: colors.tabBarInactive }]}>
                Подготавливаем подробную русскую версию...
              </Text>
            </View>
          )}

          {generatingImages && (
            <View style={[styles.enrichingWrap, styles.infoBadge, { backgroundColor: colors.chip }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.badgeTextMuted, { color: colors.tabBarInactive }]}>
                Подбираем изображения шагов...
              </Text>
            </View>
          )}

          {stepCards.map((step, index) => {
            const failedRemote = failedStepImages[step.id];
            const remoteImageSource = !failedRemote && step.imageUrl ? { uri: step.imageUrl } : null;
            const resolvedStepImage = remoteImageSource || step.localImageSource;

            return (
            <View key={step.id} style={styles.stepCard}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{index + 1}</Text>
              </View>

              {resolvedStepImage ? (
                <Image
                  source={resolvedStepImage}
                  defaultSource={step.localImageSource}
                  style={styles.stepImage}
                  onError={() =>
                    remoteImageSource
                      ? setFailedStepImages((prev) => ({
                          ...prev,
                          [step.id]: true,
                        }))
                      : undefined
                  }
                />
              ) : (
                <LinearGradient colors={step.visualHint.colors} style={styles.imageFallback}>
                  <Ionicons name={step.visualHint.icon} size={42} color="#fff" />
                  <Text style={styles.imageFallbackLabel}>{step.visualHint.label}</Text>
                </LinearGradient>
              )}

              <Text style={styles.stepText}>{step.text}</Text>
            </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroWrap: {
    padding: 16,
    paddingBottom: 0,
  },
  heroImage: {
    width: '100%',
    height: 270,
    borderRadius: 28,
  },
  heroPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metaCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sourceBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  sourceText: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  stepsSection: {
    marginBottom: 16,
  },
  stepCard: {
    backgroundColor: '#2B2826',
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    minWidth: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FFD326',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  stepBadgeText: {
    color: '#1A1614',
    fontSize: 16,
    fontWeight: '800',
  },
  stepImage: {
    width: '100%',
    height: 180,
    borderRadius: 18,
  },
  imageFallback: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  imageFallbackLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#F5EFE6',
    marginTop: 14,
  },
  enrichingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeTextMuted: {
    marginLeft: 8,
  },
});

export default RecipeDetailScreen;
