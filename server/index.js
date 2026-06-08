const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3001);

const readEnvFile = () => {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const raw = fs.readFileSync(envPath, 'utf8');
  return raw.split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      return acc;
    }

    const separatorIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    acc[key] = value;
    return acc;
  }, {});
};

const envFromFile = readEnvFile();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || envFromFile.OPENAI_API_KEY || '';
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || envFromFile.SPOONACULAR_API_KEY || '';
const DEEPAI_API_KEY = process.env.DEEPAI_API_KEY || envFromFile.DEEPAI_API_KEY || '';

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
};

const sendError = (res, statusCode, message) => {
  sendJson(res, statusCode, { error: message });
};

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('Payload too large'));
      }
    });

    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const text = await response.text();

  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch (error) {
    json = { raw: text };
  }

  if (!response.ok) {
    const message = json?.error?.message || json?.message || `Request failed with status ${response.status}`;
    const err = new Error(message);
    err.statusCode = response.status;
    err.payload = json;
    throw err;
  }

  return json;
};

const parseJsonContent = (raw) => {
  if (typeof raw !== 'string') {
    throw new Error('Model returned empty response');
  }

  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  return JSON.parse(cleaned);
};

const callOpenAIChat = async (messages, { maxTokens = 900, temperature = 0.4 } = {}) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured on the backend');
  }

  const data = await fetchJson('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned no content');
  }

  return content;
};

const callOpenAIJson = async (messages, options) => {
  const content = await callOpenAIChat(messages, options);
  return parseJsonContent(content);
};

const generateImageWithOpenAI = async (prompt, size = '1024x1024') => {
  if (!OPENAI_API_KEY) {
    return null;
  }

  const data = await fetchJson('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size,
    }),
  });

  const first = data?.data?.[0];
  if (!first) {
    return null;
  }

  if (typeof first.url === 'string' && first.url.length > 0) {
    return first.url;
  }

  if (typeof first.b64_json === 'string' && first.b64_json.length > 0) {
    return `data:image/png;base64,${first.b64_json}`;
  }

  return null;
};

const generateImageWithDeepAI = async (prompt) => {
  if (!DEEPAI_API_KEY) {
    return null;
  }

  const formData = new FormData();
  formData.append('text', prompt);

  const data = await fetchJson('https://api.deepai.org/api/text2img', {
    method: 'POST',
    headers: {
      'Api-Key': DEEPAI_API_KEY,
    },
    body: formData,
  });

  return typeof data?.output_url === 'string' ? data.output_url : null;
};

const generateRecipeImage = async (prompt) => {
  try {
    const openAiImage = await generateImageWithOpenAI(prompt);
    if (openAiImage) {
      return openAiImage;
    }
  } catch (error) {
    console.error('OpenAI image generation failed:', error);
  }

  try {
    return await generateImageWithDeepAI(prompt);
  } catch (error) {
    console.error('DeepAI image generation failed:', error);
    return null;
  }
};

const spoonacularUrl = (pathname, params = {}) => {
  const url = new URL(`https://api.spoonacular.com${pathname}`);
  url.searchParams.set('apiKey', SPOONACULAR_API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

const mapRecipe = (recipe) => ({
  id: recipe.id,
  name: recipe.title,
  imageUrl:
    typeof recipe.image === 'string' && recipe.image.startsWith('http')
      ? recipe.image
      : recipe.id
        ? `https://spoonacular.com/recipeImages/${recipe.id}-636x393.jpg`
        : '',
  cookingTime: recipe.readyInMinutes || 30,
  servings: recipe.servings || 2,
  ingredients: Array.isArray(recipe.extendedIngredients)
    ? recipe.extendedIngredients.map((item) => item.original)
    : [],
  instructions: Array.isArray(recipe.analyzedInstructions?.[0]?.steps)
    ? recipe.analyzedInstructions[0].steps.map((step) => step.step)
    : [],
  isVegan: Boolean(recipe.vegan),
  isGlutenFree: Boolean(recipe.glutenFree),
  isVegetarian: Boolean(recipe.vegetarian),
  isDairyFree: Boolean(recipe.dairyFree),
});

const RUSSIAN_TO_ENGLISH = {
  картофель: 'potato',
  картошка: 'potato',
  лук: 'onion',
  чеснок: 'garlic',
  морковь: 'carrot',
  помидор: 'tomato',
  помидоры: 'tomatoes',
  огурец: 'cucumber',
  огурцы: 'cucumbers',
  капуста: 'cabbage',
  перец: 'pepper',
  курица: 'chicken',
  говядина: 'beef',
  свинина: 'pork',
  рыба: 'fish',
  яйца: 'eggs',
  яйцо: 'egg',
  молоко: 'milk',
  сыр: 'cheese',
  рис: 'rice',
  макароны: 'pasta',
  паста: 'pasta',
  грибы: 'mushrooms',
  гриб: 'mushroom',
  сливки: 'cream',
  хлеб: 'bread',
  масло: 'oil',
  суп: 'soup',
  салат: 'salad',
  рагу: 'stew',
  жареный: 'fried',
  жареная: 'fried',
  жареное: 'fried',
  вареный: 'boiled',
  вареная: 'boiled',
  вареное: 'boiled',
  запеченный: 'baked',
  запеченная: 'baked',
  запеченное: 'baked',
  быстрый: 'quick',
  ужин: 'dinner',
  обед: 'lunch',
  завтрак: 'breakfast',
  с: '',
  и: '',
  из: '',
  для: '',
};

const translateRussianToken = (token) => {
  const normalized = String(token || '')
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:()]/g, '');

  if (!normalized) {
    return '';
  }

  if (normalized in RUSSIAN_TO_ENGLISH) {
    return RUSSIAN_TO_ENGLISH[normalized];
  }

  // Drop unknown Cyrillic tokens so mixed-language queries still work.
  if (/[а-яё]/i.test(normalized)) {
    return '';
  }

  return token;
};

const translateQueryToEnglish = (value) =>
  String(value || '')
    .split(/\s+/)
    .map((token) => translateRussianToken(token))
    .filter(Boolean)
    .join(' ')
    .trim();

const normalizeIngredients = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeIngredientsForApi = (value) =>
  normalizeIngredients(value).map((item) => translateQueryToEnglish(item));

const SPOONACULAR_INGREDIENT_IMAGE_BASE = 'https://spoonacular.com/cdn/ingredients_500x500';

const spoonacularIngredientImage = (fileName) =>
  `${SPOONACULAR_INGREDIENT_IMAGE_BASE}/${fileName}`;

const STEP_SUBJECT_HINTS = [
  { patterns: [/куриц/i, /chicken/i], query: 'chicken', ingredientImage: spoonacularIngredientImage('chicken-breasts.png') },
  { patterns: [/картоф/i, /potato/i], query: 'potato', ingredientImage: spoonacularIngredientImage('potato.png') },
  { patterns: [/лук/i, /onion/i], query: 'onion', ingredientImage: spoonacularIngredientImage('onion.png') },
  { patterns: [/чеснок/i, /garlic/i], query: 'garlic', ingredientImage: spoonacularIngredientImage('garlic.png') },
  { patterns: [/морков/i, /carrot/i], query: 'carrot', ingredientImage: spoonacularIngredientImage('carrot.png') },
  { patterns: [/помидор/i, /tomato/i], query: 'tomato', ingredientImage: spoonacularIngredientImage('tomato.png') },
  { patterns: [/гриб/i, /mushroom/i], query: 'mushroom', ingredientImage: spoonacularIngredientImage('mushrooms.png') },
  { patterns: [/рис/i, /rice/i], query: 'rice', ingredientImage: spoonacularIngredientImage('white-rice.png') },
  { patterns: [/макарон/i, /паст/i, /pasta/i], query: 'pasta', ingredientImage: spoonacularIngredientImage('spaghetti.png') },
  { patterns: [/яйц/i, /egg/i], query: 'egg', ingredientImage: spoonacularIngredientImage('egg.png') },
  { patterns: [/сыр/i, /cheese/i], query: 'cheese', ingredientImage: spoonacularIngredientImage('cheddar-cheese.png') },
  { patterns: [/перец/i, /pepper/i], query: 'pepper', ingredientImage: spoonacularIngredientImage('red-pepper.png') },
  { patterns: [/капуст/i, /cabbage/i], query: 'cabbage', ingredientImage: spoonacularIngredientImage('cabbage.png') },
];

const STEP_ACTION_HINTS = [
  {
    type: 'ingredients',
    patterns: [/подготов/i, /продукт/i, /ингредиент/i, /промой/i, /очист/i],
    queries: ['fresh ingredients', 'prepared ingredients'],
    preferIngredientImage: true,
  },
  {
    type: 'chop',
    patterns: [/нареж/i, /реж/i, /пореж/i, /измельч/i, /нашинку/i, /cut/i, /slice/i, /chop/i],
    queries: ['chopped', 'sliced'],
  },
  {
    type: 'fry',
    patterns: [/обжар/i, /жар/i, /сковород/i, /разогре/i, /пассер/i, /fry/i, /saute/i, /sear/i],
    queries: ['fried', 'sauteed', 'pan fried'],
  },
  {
    type: 'boil',
    patterns: [/отвар/i, /вар/i, /кип/i, /туш/i, /кастрюл/i, /boil/i, /simmer/i, /stew/i],
    queries: ['boiled', 'simmered', 'stewed'],
  },
  {
    type: 'bake',
    patterns: [/запек/i, /духов/i, /печ/i, /bake/i, /oven/i, /roast/i],
    queries: ['baked', 'roasted'],
  },
  {
    type: 'mix',
    patterns: [/смеш/i, /перемеш/i, /соедин/i, /взбей/i, /mix/i, /stir/i, /combine/i, /whisk/i],
    queries: ['mixed', 'creamy', 'salad'],
  },
  {
    type: 'serve',
    patterns: [/пода/i, /укрась/i, /вылож/i, /plate/i, /serve/i, /garnish/i],
    queries: ['plated', 'served'],
  },
];

const STEP_REFERENCE_PRESETS = [
  { action: 'fry', subject: 'chicken', imageUrl: 'https://img.spoonacular.com/recipes/633624-312x231.jpg' },
  { action: 'fry', subject: 'mushroom', imageUrl: 'https://img.spoonacular.com/recipes/659419-312x231.jpg' },
  { action: 'fry', subject: 'potato', imageUrl: 'https://img.spoonacular.com/recipes/1043339-312x231.jpg' },
  { action: 'boil', subject: 'pasta', imageUrl: 'https://img.spoonacular.com/recipes/654959-312x231.jpg' },
  { action: 'boil', subject: 'rice', imageUrl: 'https://img.spoonacular.com/recipes/716627-312x231.jpg' },
  { action: 'mix', subject: 'egg', imageUrl: 'https://img.spoonacular.com/recipes/635964-312x231.jpg' },
  { action: 'serve', subject: 'salad', imageUrl: 'https://img.spoonacular.com/recipes/661340-312x231.jpg' },
  { action: 'boil', subject: 'cabbage', imageUrl: 'https://img.spoonacular.com/recipes/642610-312x231.jpg' },
  { action: 'bake', subject: 'chicken', imageUrl: 'https://img.spoonacular.com/recipes/730914-312x231.jpg' },
  { action: 'cook', subject: 'potato', imageUrl: 'https://img.spoonacular.com/recipes/1043339-312x231.jpg' },
];

const uniqueStrings = (items) => Array.from(new Set(items.map((item) => String(item || '').trim()).filter(Boolean)));

const detectStepSubject = (stepText, recipeTitle = '') => {
  const haystack = `${stepText} ${recipeTitle}`.toLowerCase();
  const translatedHaystack = translateQueryToEnglish(haystack);

  return (
    STEP_SUBJECT_HINTS.find(
      ({ patterns, query }) =>
        patterns.some((pattern) => pattern.test(haystack)) || translatedHaystack.includes(query)
    ) || null
  );
};

const detectStepAction = (stepText) => {
  const text = String(stepText || '').toLowerCase();
  return (
    STEP_ACTION_HINTS.find(({ patterns }) => patterns.some((pattern) => pattern.test(text))) || {
      type: 'cook',
      queries: ['cooked', 'homemade'],
      preferIngredientImage: false,
    }
  );
};

const searchRecipeImageByQuery = async (query) => {
  if (!query) {
    return null;
  }

  requireSpoonacular();
  const data = await fetchJson(
    spoonacularUrl('/recipes/complexSearch', {
      query,
      number: 1,
    })
  );

  const first = Array.isArray(data?.results) ? data.results[0] : null;
  if (!first) {
    return null;
  }

  if (typeof first.image === 'string' && first.image.startsWith('http')) {
    return first.image;
  }

  if (first.id) {
    return `https://spoonacular.com/recipeImages/${first.id}-636x393.jpg`;
  }

  return null;
};

const buildAiStepQueries = async (stepText, recipeTitle = '') => {
  try {
    const result = await callOpenAIJson(
      [
        {
          role: 'system',
          content: [
            'You write short English search queries for food photos.',
            'Return only valid JSON in the format {"queries":["..."]}.',
            'Generate 3 to 5 concise queries.',
            'Each query must describe the cooking action and the main ingredient from the step.',
            'Use plain English words like "pan fried chicken", "boiled pasta", "whisked eggs", "chopped mushrooms".',
            'No explanations, no markdown.',
          ].join(' '),
        },
        {
          role: 'user',
          content: `Recipe title: ${recipeTitle}\nStep: ${stepText}`,
        },
      ],
      { maxTokens: 120, temperature: 0.2 }
    );

    return uniqueStrings(Array.isArray(result?.queries) ? result.queries : []);
  } catch (error) {
    console.error('Step query generation failed:', error);
    return [];
  }
};

const classifyStepVisual = async (stepText, recipeTitle = '') => {
  try {
    const result = await callOpenAIJson(
      [
        {
          role: 'system',
          content: [
            'Classify a recipe step for picking a reference food photo.',
            'Return only valid JSON in the format {"action":"...","subject":"..."}.',
            'Allowed actions: ingredients, chop, fry, boil, bake, mix, serve, cook.',
            'Allowed subjects: chicken, potato, onion, mushroom, pasta, rice, egg, salad, vegetable, cheese, tomato, garlic, pepper, cabbage, none.',
            'Choose the main ingredient or product that visually defines the step.',
            'Use English only.',
          ].join(' '),
        },
        {
          role: 'user',
          content: `Recipe title: ${recipeTitle}\nStep: ${stepText}`,
        },
      ],
      { maxTokens: 80, temperature: 0.1 }
    );

    return {
      action: typeof result?.action === 'string' ? result.action.trim().toLowerCase() : '',
      subject: typeof result?.subject === 'string' ? result.subject.trim().toLowerCase() : '',
    };
  } catch (error) {
    console.error('Step visual classification failed:', error);
    return { action: '', subject: '' };
  }
};

const getFallbackStepReferenceImage = async (stepText, recipeTitle = '') => {
  const subject = detectStepSubject(stepText, recipeTitle);
  const action = detectStepAction(stepText);
  const translatedStep = translateQueryToEnglish(stepText);
  const aiQueries = await buildAiStepQueries(stepText, recipeTitle);
  const classified = await classifyStepVisual(stepText, recipeTitle);
  const preset =
    STEP_REFERENCE_PRESETS.find(
      (item) => item.action === classified.action && item.subject === classified.subject
    ) ||
    STEP_REFERENCE_PRESETS.find(
      (item) => item.action === action.type && item.subject === subject?.query
    );

  if (action.preferIngredientImage && subject?.ingredientImage) {
    return subject.ingredientImage;
  }

  if (preset) {
    return preset.imageUrl;
  }

  const translatedTitle = translateQueryToEnglish(recipeTitle);
  const queries = uniqueStrings([
    ...aiQueries,
    ...action.queries.map((query) => (subject ? `${query} ${subject.query}` : '')),
    subject?.query && translatedTitle ? `${subject.query} ${translatedTitle}` : '',
    ...action.queries.map((query) => (translatedTitle ? `${query} ${translatedTitle}` : '')),
    translatedStep,
    subject?.query ? `${subject.query} recipe` : '',
    translatedTitle,
    ...action.queries,
  ]);

  for (const query of queries) {
    try {
      const imageUrl = await searchRecipeImageByQuery(query);
      if (imageUrl) {
        return imageUrl;
      }
    } catch (error) {
      console.error(`Spoonacular step fallback failed for query "${query}":`, error);
    }
  }

  return subject?.ingredientImage || null;
};

const buildRecipeGenerationMessages = (ingredients) => [
  {
    role: 'system',
    content: [
      'You are an experienced home cook and recipe editor.',
      'Write the final answer strictly in Russian.',
      'Return only valid JSON without markdown in the shape {"title":"...","ingredients":["..."],"steps":["..."]}.',
      'Create one coherent, appetizing, realistic dish that a person would genuinely want to eat.',
      'Do not combine all provided ingredients blindly.',
      'Choose only ingredients that fit together well in one dish, and skip incompatible ones.',
      'You may add a few common pantry staples if needed: salt, pepper, oil, butter, water, flour, sugar, garlic, onion, lemon juice, herbs, simple spices.',
      'Prefer familiar home-style dishes over strange experimental combinations.',
      'The title must sound like a real dish.',
      'List ingredients in practical kitchen wording, with rough quantities when appropriate.',
      'Write 6 to 8 detailed cooking steps.',
      'Each step should explain both the action and the expected result or texture.',
      'Keep the recipe internally consistent, tasty, and realistic for a home kitchen.',
    ].join(' '),
  },
  {
    role: 'user',
    content: [
      `Available ingredients: ${ingredients.join(', ')}.`,
      'Create the best possible full recipe from these products.',
      'Focus on taste, balance, texture, and a believable cooking process.',
      'If some ingredients do not fit the chosen dish, do not use them.',
    ].join(' '),
  },
];

const handleGenerateRecipe = async (res, body) => {
  const ingredients = Array.isArray(body.ingredients)
    ? body.ingredients.map((item) => String(item).trim()).filter(Boolean)
    : [];

  if (ingredients.length === 0) {
    sendError(res, 400, 'ingredients is required');
    return;
  }

  const recipe = await callOpenAIJson(
    [
      {
        role: 'system',
        content:
          'Ты кулинарный редактор. Пиши строго на русском языке. Возвращай только JSON без markdown. Формат: {"title":"...","ingredients":["..."],"steps":["..."]}. Делай подробный рецепт: минимум 6 шагов, каждый шаг 2-3 предложения.',
      },
      {
        role: 'user',
        content: `Ингредиенты: ${ingredients.join(', ')}. Составь понятный домашний рецепт строго на русском языке.`,
      },
    ],
    { maxTokens: 900, temperature: 0.7 }
  );

  sendJson(res, 200, { recipe });
};

const handleLocalizeRecipe = async (res, body) => {
  const recipe = body.recipe;
  if (!recipe || typeof recipe !== 'object') {
    sendError(res, 400, 'recipe is required');
    return;
  }

  const localized = await callOpenAIJson(
    [
      {
        role: 'system',
        content:
          'Ты кулинарный редактор. Переписывай рецепт полностью на русском языке и возвращай только JSON формата {"title":"...","ingredients":["..."],"steps":["..."]}. Минимум 6 подробных шагов.',
      },
      {
        role: 'user',
        content: `Название: ${recipe.name}\nИнгредиенты: ${(recipe.ingredients || []).join(', ')}\nШаги: ${(recipe.instructions || []).join(' | ')}`,
      },
    ],
    { maxTokens: 900, temperature: 0.4 }
  );

  sendJson(res, 200, { recipe: localized });
};

const handleTranslateTitles = async (res, body) => {
  const titles = Array.isArray(body.titles) ? body.titles.map((item) => String(item)) : [];
  if (titles.length === 0) {
    sendJson(res, 200, { titles: [] });
    return;
  }

  const translated = await callOpenAIJson(
    [
      {
        role: 'system',
        content:
          'Переводи названия блюд на русский кулинарный язык. Возвращай только JSON формата {"titles":["..."]}.',
      },
      {
        role: 'user',
        content: `Переведи названия: ${JSON.stringify(titles)}`,
      },
    ],
    { maxTokens: 400, temperature: 0.2 }
  );

  sendJson(res, 200, { titles: Array.isArray(translated.titles) ? translated.titles : [] });
};

const handleRecipeTips = async (res, body) => {
  const recipeName = String(body.recipeName || '').trim();
  const ingredients = Array.isArray(body.ingredients)
    ? body.ingredients.map((item) => String(item))
    : [];

  const tips = await callOpenAIChat(
    [
      {
        role: 'system',
        content: 'Ты кулинарный помощник. Дай короткие советы по приготовлению строго на русском языке.',
      },
      {
        role: 'user',
        content: `Блюдо: ${recipeName}. Ингредиенты: ${ingredients.join(', ')}.`,
      },
    ],
    { maxTokens: 150, temperature: 0.5 }
  );

  sendJson(res, 200, { tips });
};

const handleStepImage = async (res, body) => {
  const prompt = `Фотореалистичное изображение этапа приготовления блюда "${body.recipeTitle}". Крупный план, современная кухня, естественный свет, без текста на изображении. Этап ${body.stepNumber}: ${body.stepText}`;
  const imageUrl = await generateRecipeImage(prompt);
  sendJson(res, 200, { imageUrl });
};

const handleRecipeImage = async (res, body) => {
  const ingredients = Array.isArray(body.ingredients) ? body.ingredients.join(', ') : '';
  const prompt = `Фотореалистичное аппетитное фото готового блюда "${body.recipeTitle}". Домашняя подача, натуральный свет, кулинарная съемка, без текста. Ингредиенты: ${ingredients}`;
  const imageUrl = await generateRecipeImage(prompt);
  sendJson(res, 200, { imageUrl });
};

const handleGenerateRecipeImproved = async (res, body) => {
  const ingredients = Array.isArray(body.ingredients)
    ? body.ingredients.map((item) => String(item).trim()).filter(Boolean)
    : [];

  if (ingredients.length === 0) {
    sendError(res, 400, 'ingredients is required');
    return;
  }

  const recipe = await callOpenAIJson(buildRecipeGenerationMessages(ingredients), {
    maxTokens: 1200,
    temperature: 0.55,
  });

  sendJson(res, 200, { recipe });
};

const handleLocalizeRecipeImproved = async (res, body) => {
  const recipe = body.recipe;
  if (!recipe || typeof recipe !== 'object') {
    sendError(res, 400, 'recipe is required');
    return;
  }

  const localized = await callOpenAIJson(
    [
      {
        role: 'system',
        content: [
          'You are an experienced food editor.',
          'Rewrite the recipe into natural, appetizing Russian.',
          'Return only valid JSON without markdown in the shape {"title":"...","ingredients":["..."],"steps":["..."]}.',
          'Preserve the dish idea, but improve vague or weak parts.',
          'Make the dish feel complete, realistic, and pleasant to cook and eat.',
          'Use practical ingredient wording and 6 to 8 detailed steps.',
        ].join(' '),
      },
      {
        role: 'user',
        content: `Title: ${recipe.name}\nIngredients: ${(recipe.ingredients || []).join(', ')}\nSteps: ${(recipe.instructions || []).join(' | ')}`,
      },
    ],
    { maxTokens: 1200, temperature: 0.35 }
  );

  sendJson(res, 200, { recipe: localized });
};

const handleStepImageImproved = async (res, body) => {
  const prompt = [
    `Photorealistic food preparation scene for the dish "${body.recipeTitle}".`,
    `Show step ${body.stepNumber}: ${body.stepText}.`,
    'Modern home kitchen, natural light, realistic ingredients and utensils, appetizing composition.',
    'No text, no watermark, no collage, no deformed hands or objects.',
    'Focus on believable cooking action and clean food styling.',
  ].join(' ');
  const imageUrl = (await generateRecipeImage(prompt)) || (await getFallbackStepReferenceImage(body.stepText, body.recipeTitle));
  sendJson(res, 200, { imageUrl });
};

const handleRecipeImageImproved = async (res, body) => {
  const ingredients = Array.isArray(body.ingredients) ? body.ingredients.join(', ') : '';
  const prompt = [
    `Photorealistic hero shot of the finished dish "${body.recipeTitle}".`,
    `Main ingredients: ${ingredients}.`,
    'Show it as a real, delicious home-cooked meal with attractive plating, natural light, realistic textures, and editorial-quality food photography.',
    'No text, no watermark, no collage, no extra dishes stealing attention.',
  ].join(' ');
  const imageUrl = await generateRecipeImage(prompt);
  sendJson(res, 200, { imageUrl });
};

const requireSpoonacular = () => {
  if (!SPOONACULAR_API_KEY) {
    throw new Error('SPOONACULAR_API_KEY is not configured on the backend');
  }
};

const handleRecipesByIngredients = async (res, url) => {
  requireSpoonacular();
  const ingredients = normalizeIngredientsForApi(url.searchParams.get('ingredients'));
  if (ingredients.length === 0) {
    sendJson(res, 200, { recipes: [] });
    return;
  }

  const found = await fetchJson(
    spoonacularUrl('/recipes/findByIngredients', {
      ingredients: ingredients.join(','),
      number: 12,
      ranking: 2,
      ignorePantry: true,
    })
  );

  const ids = Array.isArray(found) ? found.map((item) => item.id).filter(Boolean) : [];
  if (ids.length === 0) {
    sendJson(res, 200, { recipes: [] });
    return;
  }

  const detailed = await fetchJson(
    spoonacularUrl('/recipes/informationBulk', {
      ids: ids.join(','),
      includeNutrition: false,
    })
  );

  sendJson(res, 200, {
    recipes: Array.isArray(detailed) ? detailed.map(mapRecipe) : [],
  });
};

const handleRecipeSearch = async (res, url) => {
  requireSpoonacular();
  const rawQuery = String(url.searchParams.get('query') || '').trim();
  const query = translateQueryToEnglish(rawQuery);
  if (!query) {
    sendJson(res, 200, { recipes: [] });
    return;
  }

  const data = await fetchJson(
    spoonacularUrl('/recipes/complexSearch', {
      query,
      number: 10,
      addRecipeInformation: true,
      fillIngredients: true,
    })
  );

  sendJson(res, 200, {
    recipes: Array.isArray(data?.results) ? data.results.map(mapRecipe) : [],
  });
};

const handleRecommendedRecipes = async (res) => {
  requireSpoonacular();
  const data = await fetchJson(
    spoonacularUrl('/recipes/random', {
      number: 10,
    })
  );

  sendJson(res, 200, {
    recipes: Array.isArray(data?.recipes) ? data.recipes.map(mapRecipe) : [],
  });
};

const handleStepVisuals = async (res, recipeId) => {
  requireSpoonacular();
  const data = await fetchJson(spoonacularUrl(`/recipes/${recipeId}/analyzedInstructions`));
  const steps = Array.isArray(data?.[0]?.steps) ? data[0].steps : [];

  sendJson(res, 200, {
    visuals: steps.map((step) => {
      const equipmentImageName = Array.isArray(step?.equipment)
        ? step.equipment.find((item) => item?.image)?.image
        : undefined;
      const ingredientImageName = Array.isArray(step?.ingredients)
        ? step.ingredients.find((item) => item?.image)?.image
        : undefined;

      const equipmentImage = equipmentImageName
        ? `https://spoonacular.com/cdn/equipment_500x500/${equipmentImageName}`
        : undefined;
      const ingredientImage = ingredientImageName
        ? `https://spoonacular.com/cdn/ingredients_500x500/${ingredientImageName}`
        : undefined;

      return {
        text: step.step,
        imageUrl: equipmentImage || ingredientImage,
      };
    }),
  });
};

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendError(res, 400, 'Invalid request');
    return;
  }

  if (req.method === 'OPTIONS') {
    sendJson(res, 200, { ok: true });
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, {
        ok: true,
        services: {
          openaiConfigured: Boolean(OPENAI_API_KEY),
          spoonacularConfigured: Boolean(SPOONACULAR_API_KEY),
          deepAiConfigured: Boolean(DEEPAI_API_KEY),
        },
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/recipes/by-ingredients') {
      await handleRecipesByIngredients(res, url);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/recipes/search') {
      await handleRecipeSearch(res, url);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/recipes/recommended') {
      await handleRecommendedRecipes(res);
      return;
    }

    const stepVisualMatch = url.pathname.match(/^\/recipes\/(\d+)\/step-visuals$/);
    if (req.method === 'GET' && stepVisualMatch) {
      await handleStepVisuals(res, stepVisualMatch[1]);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/ai/generate-recipe') {
      await handleGenerateRecipeImproved(res, await readJsonBody(req));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/ai/localize-recipe') {
      await handleLocalizeRecipeImproved(res, await readJsonBody(req));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/ai/translate-titles') {
      await handleTranslateTitles(res, await readJsonBody(req));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/ai/recipe-tips') {
      await handleRecipeTips(res, await readJsonBody(req));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/ai/step-image') {
      await handleStepImageImproved(res, await readJsonBody(req));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/ai/recipe-image') {
      await handleRecipeImageImproved(res, await readJsonBody(req));
      return;
    }

    sendError(res, 404, 'Route not found');
  } catch (error) {
    console.error(error);
    sendError(res, error.statusCode || 500, error.message || 'Server error');
  }
});

server.listen(PORT, () => {
  console.log(`FlavorFinder backend listening on http://localhost:${PORT}`);
});
