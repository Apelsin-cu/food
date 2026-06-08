import { Recipe } from '../types/recipe';

export interface DetailedRussianRecipe {
  title: string;
  ingredients: string[];
  steps: string[];
}

interface LocalRecipeDefinition {
  recipe: Recipe;
  aliases?: string[];
}

const HERO_IMAGES = {
  chickenPotatoes:
    'https://img.spoonacular.com/recipes/660220-556x370.jpg',
  creamyMushroomPasta:
    'https://img.spoonacular.com/recipes/654911-556x370.jpg',
  vegetableRice:
    'https://img.spoonacular.com/recipes/716429-556x370.jpg',
  omelet:
    'https://img.spoonacular.com/recipes/665734-556x370.jpg',
  vegetableStew:
    'https://img.spoonacular.com/recipes/641893-556x370.jpg',
  toast:
    'https://images.unsplash.com/photo-1513442542250-854d436a73f2?auto=format&fit=crop&w=1200&q=80',
  salad:
    'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1200&q=80',
  soup:
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80',
  bakedPepper:
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
  casserole:
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80',
};

const foodRuImage = (encodedPath: string): string => {
  const normalizedPath = encodedPath.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  return `https://cdn.food.ru/unsigned/fit/960/540/ce/0/${normalizedPath}.jpg`;
};

const FOOD_RU_COVER_IMAGES = {
  chickenPotatoes: foodRuImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzU3Njg4L2NvdmVycy91QXFSU1IuanBlZw.jpg'),
  pastaMushroom: foodRuImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE0NDMzNC9jb3ZlcnMvdk1yelF0LmpwZWc'),
  riceVegetables: foodRuImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE1OS9jb3ZlcnMvMzNob3NnLmpwZw'),
  omelet: foodRuImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDQxMy96SnpEZzIuanBlZw'),
  beefPasta: foodRuImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMDMyNi80UmliUXIucG5n'),
  chickenRiceSoup: foodRuImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMTExNy8zVm9TeHIuanBlZw'),
  potatoCasserole: foodRuImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDQxNS9nU1A3Y0cuanBlZw.jpg'),
  riceEgg: foodRuImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMDQxOS8zRnVqTFAuanBlZw.jpg'),
  cheeseToast: foodRuImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMDIyMy9ldzljTkouanBlZw.jpg'),
  freshSalad: foodRuImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgxMy8zUnROUlMuanBlZw.jpg'),
  baconMushroomPasta: foodRuImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgyNi8zbUJnZGsuanBlZw.jpg'),
  potatoMushrooms: foodRuImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMTExNi80N2Y0QmMuanBlZw.jpg'),
  chickenMash: foodRuImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDMwNi80UFBBcFQuanBlZw.jpg'),
  bakedPeppers: foodRuImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDkwOC9XN1J5V1IuanBlZw.jpg'),
  vegetableStew: foodRuImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMDQxMS80R2RNcjIuanBlZw.jpg'),
};

const FOOD_RU_SOURCE_URLS: Record<number, string> = {
  910001: 'https://food.ru/recipes/57688-kurica-s-kartofelem',
  910002: 'https://food.ru/recipes/144334-pasta-s-gribami-i-muskatnym-orehom',
  910003: 'https://food.ru/recipes/159-ris-s-ovoshchami',
  910004: 'https://food.ru/recipes/213745-omlet-s-pomidorami-i-syrom-1712986084',
  910005: 'https://food.ru/recipes/43343-pasta-s-govjadinoi-i-gribami',
  910006: 'https://food.ru/recipes/200019-kurinyi-sup-s-risom-1700206587',
  910007: 'https://food.ru/recipes/249000-vkusneishaia-kartofelnaia-zapekanka-s-syrom-1743963705',
  910008: 'https://food.ru/recipes/169067-ris-s-ovoshchami-i-iaitsom-1681925541',
  910009: 'https://food.ru/recipes/119262-grenki-s-syrom-i-iaitsom-1645622009',
  910010: 'https://food.ru/recipes/225034-salat-so-svezhim-ogurtsom-pomidorami-i-iaitsom-1722919414',
  910011: 'https://food.ru/recipes/226357-pasta-s-gribami-i-bekonom-bez-gliutena-1724065505',
  910012: 'https://food.ru/recipes/153908-kartofel-s-gribami-1668611459',
  910013: 'https://food.ru/recipes/209154-kuritsa-s-piure-kartofelnym-1707585104',
  910014: 'https://food.ru/recipes/227958-zapechionnye-pertsy-s-syrnoi-shapochkoi-1725805494',
  910015: 'https://food.ru/recipes/163833-ovoshchnoe-ragu-1681235003',
};

const createRecipe = (
  id: number,
  name: string,
  imageUrl: string,
  cookingTime: number,
  servings: number,
  ingredients: string[],
  instructions: string[],
  flags?: Partial<Pick<Recipe, 'isVegan' | 'isGlutenFree' | 'isVegetarian' | 'isDairyFree'>>
): Recipe => ({
  id,
  name,
  imageUrl,
  cookingTime,
  servings,
  ingredients,
  instructions,
  isVegan: flags?.isVegan ?? false,
  isGlutenFree: flags?.isGlutenFree ?? false,
  isVegetarian: flags?.isVegetarian ?? false,
  isDairyFree: flags?.isDairyFree ?? false,
  sourceName: FOOD_RU_SOURCE_URLS[id] ? 'Food.ru' : undefined,
  sourceUrl: FOOD_RU_SOURCE_URLS[id],
});

const LOCAL_RECIPE_DEFINITIONS: LocalRecipeDefinition[] = [
  {
    recipe: createRecipe(
      910001,
      'Курица с картофелем',
      FOOD_RU_COVER_IMAGES.chickenPotatoes,
      40,
      3,
      ['курица', 'картофель', 'лук', 'чеснок'],
      [
        'Подготовьте курицу, картофель, лук и чеснок. Картофель очистите и нарежьте дольками, курицу разделите на небольшие кусочки.',
        'Разогрейте сковороду с растительным маслом и сначала обжарьте курицу 5-6 минут, чтобы она схватилась и стала золотистой по краям.',
        'Добавьте лук и чеснок, перемешайте и готовьте ещё 2 минуты, пока овощи не станут мягкими и ароматными.',
        'Выложите картофель, посолите, поперчите и аккуратно перемешайте, чтобы масло и сок курицы покрыли все кусочки.',
        'Накройте сковороду крышкой и готовьте на среднем огне 20 минут, иногда переворачивая картофель для равномерной корочки.',
        'Проверьте мягкость картофеля и готовность курицы. Подавайте горячим, при желании добавьте свежую зелень.',
      ],
      { isGlutenFree: true, isDairyFree: true }
    ),
    aliases: ['жареная курица с картошкой', 'курица картошка', 'куриное филе с картофелем'],
  },
  {
    recipe: createRecipe(
      910002,
      'Паста с грибами и мускатным орехом',
      FOOD_RU_COVER_IMAGES.pastaMushroom,
      25,
      2,
      ['макароны', 'грибы', 'сливки', 'чеснок', 'мускатный орех'],
      [
        'Подготовьте продукты: грибы нарежьте пластинками, чеснок очистите и слегка раздавите плоской стороной ножа.',
        'Отварите макароны до состояния al dente, оставив половину стакана воды после варки.',
        'Разогрейте сковороду, прогрейте чеснок в масле до аромата и уберите его, чтобы масло осталось душистым.',
        'Добавьте грибы и жарьте до испарения влаги и лёгкой румяности, затем влейте сливки.',
        'Приправьте мускатным орехом, солью и перцем, дайте соусу слегка загустеть.',
        'Соедините макароны с соусом, перемешайте и сразу подавайте, пока паста остаётся нежной и кремовой.',
      ],
      { isVegetarian: true }
    ),
    aliases: ['паста с шампиньонами', 'макароны с грибами', 'сливочная паста'],
  },
  {
    recipe: createRecipe(
      910003,
      'Рис с овощами',
      FOOD_RU_COVER_IMAGES.riceVegetables,
      30,
      3,
      ['рис', 'морковь', 'перец', 'лук', 'чеснок'],
      [
        'Промойте рис до прозрачной воды. Морковь нарежьте мелкими кубиками, перец полосками, лук и чеснок измельчите.',
        'Разогрейте глубокую сковороду с маслом и обжарьте лук с морковью 3 минуты.',
        'Добавьте сладкий перец и чеснок, перемешайте и готовьте ещё минуту, чтобы овощи остались яркими.',
        'Всыпьте рис, перемешайте и прогрейте его вместе с овощами, чтобы каждое зерно покрылось маслом.',
        'Влейте горячую воду, посолите, накройте крышкой и варите на слабом огне 18-20 минут, не перемешивая.',
        'Оставьте рис под крышкой на 5 минут, затем аккуратно разрыхлите вилкой и подавайте.',
      ],
      { isVegan: true, isVegetarian: true, isGlutenFree: true, isDairyFree: true }
    ),
    aliases: ['овощной рис', 'рис с перцем', 'рис с морковью'],
  },
  {
    recipe: createRecipe(
      910004,
      'Омлет с помидорами и сыром',
      FOOD_RU_COVER_IMAGES.omelet,
      15,
      2,
      ['яйца', 'молоко', 'сыр', 'помидор'],
      [
        'Разбейте яйца в миску, добавьте молоко, щепотку соли и взбейте венчиком до однородной массы.',
        'Помидор нарежьте небольшими кубиками, сыр натрите на тёрке.',
        'Разогрейте сковороду с небольшим количеством масла и влейте яичную смесь.',
        'Когда нижний слой слегка схватится, распределите сверху помидоры и сыр.',
        'Накройте сковороду крышкой и готовьте омлет 3-4 минуты на слабом огне, чтобы он остался нежным.',
        'Аккуратно переложите омлет на тарелку и подавайте сразу после приготовления.',
      ],
      { isVegetarian: true, isGlutenFree: true }
    ),
    aliases: ['яичный омлет', 'омлет с томатами', 'быстрый завтрак'],
  },
  {
    recipe: createRecipe(
      910005,
      'Паста с говядиной и грибами',
      FOOD_RU_COVER_IMAGES.beefPasta,
      35,
      3,
      ['макароны', 'говядина', 'грибы', 'лук', 'сливки'],
      [
        'Говядину нарежьте тонкими полосками, грибы пластинками, лук мелкими кубиками.',
        'Отварите макароны до готовности и сохраните немного воды после варки.',
        'На горячей сковороде быстро обжарьте говядину до румяности.',
        'Добавьте лук и грибы, готовьте до мягкости и испарения лишней влаги.',
        'Влейте сливки, посолите, поперчите и прогрейте соус до лёгкого загустения.',
        'Смешайте пасту с соусом, при необходимости добавьте немного воды от варки и подавайте горячей.',
      ],
      { isGlutenFree: true }
    ),
    aliases: ['курица с грибами', 'курица в сливках', 'сливочная курица'],
  },
  {
    recipe: createRecipe(
      910006,
      'Куриный суп с рисом',
      FOOD_RU_COVER_IMAGES.chickenRiceSoup,
      50,
      4,
      ['курица', 'рис', 'картофель', 'морковь', 'лук'],
      [
        'Курицу залейте водой, доведите до кипения и снимите пену, чтобы бульон был прозрачнее.',
        'Картофель нарежьте кубиками, морковь натрите, лук мелко порубите, рис промойте.',
        'Добавьте в бульон картофель и рис, варите около 10 минут.',
        'Лук и морковь слегка прогрейте на сковороде и переложите в кастрюлю.',
        'Варите суп до мягкости риса и картофеля, затем отрегулируйте соль и перец.',
        'Дайте супу настояться под крышкой несколько минут и подавайте горячим.',
      ],
      { isGlutenFree: true, isDairyFree: true }
    ),
    aliases: ['рисовый суп с курицей', 'суп с рисом', 'лёгкий куриный суп'],
  },
  {
    recipe: createRecipe(
      910007,
      'Вкуснейшая картофельная запеканка с сыром',
      FOOD_RU_COVER_IMAGES.potatoCasserole,
      55,
      4,
      ['картофель', 'сыр', 'молоко', 'яйца', 'лук'],
      [
        'Картофель очистите и нарежьте тонкими кружками, лук мелко порубите, сыр натрите.',
        'В миске взбейте яйца с молоком, добавьте соль и немного перца для заливки.',
        'Смажьте форму маслом, выложите слой картофеля, затем часть лука и немного сыра.',
        'Повторите слои, пока продукты не закончатся, и залейте всё яично-молочной смесью.',
        'Запекайте в духовке около 40 минут до мягкости картофеля и золотистой сырной корочки.',
        'Перед подачей дайте запеканке постоять 10 минут, чтобы кусочки держали форму.',
      ],
      { isVegetarian: true, isGlutenFree: true }
    ),
    aliases: ['запеканка из картофеля', 'картошка с сыром в духовке', 'картофельная запеканка'],
  },
  {
    recipe: createRecipe(
      910008,
      'Рис с овощами и яйцом',
      FOOD_RU_COVER_IMAGES.riceEgg,
      20,
      2,
      ['рис', 'яйца', 'морковь', 'лук', 'перец'],
      [
        'Лучше всего используйте заранее сваренный и охлаждённый рис. Морковь, лук и перец нарежьте очень мелко.',
        'Разогрейте сковороду, обжарьте лук и морковь 2-3 минуты, затем добавьте перец.',
        'Сдвиньте овощи в сторону, вбейте яйца и быстро перемешайте их лопаткой до мягких кусочков.',
        'Добавьте рис, посолите, при желании поперчите и активно перемешайте, чтобы всё прогрелось равномерно.',
        'Жарьте ещё 3-4 минуты на сильном огне, пока рис не станет рассыпчатым и ароматным.',
        'Сразу подавайте, пока блюдо остаётся горячим и лёгким.',
      ],
      { isVegetarian: true, isGlutenFree: true }
    ),
    aliases: ['рис с яйцом', 'быстрый жареный рис', 'рис на сковороде'],
  },
  {
    recipe: createRecipe(
      910009,
      'Гренки с сыром и яйцом',
      FOOD_RU_COVER_IMAGES.cheeseToast,
      15,
      2,
      ['хлеб', 'яйца', 'сыр', 'молоко'],
      [
        'Нарежьте хлеб ломтиками, сыр натрите, яйца взбейте с молоком и щепоткой соли.',
        'Быстро обмакните каждый кусочек хлеба в яичную смесь, чтобы он не размок.',
        'Разогрейте сковороду с небольшим количеством масла и выложите хлеб.',
        'Когда нижняя сторона подрумянится, переверните гренки и посыпьте сверху сыром.',
        'Накройте крышкой на 1-2 минуты, чтобы сыр расплавился и стал тягучим.',
        'Подавайте горячими на завтрак или как быстрый перекус.',
      ],
      { isVegetarian: true }
    ),
    aliases: ['сырные гренки', 'горячие бутерброды', 'хлеб с яйцом и сыром'],
  },
  {
    recipe: createRecipe(
      910010,
      'Салат со свежим огурцом, помидорами и яйцом',
      FOOD_RU_COVER_IMAGES.freshSalad,
      15,
      2,
      ['огурец', 'помидор', 'яйца'],
      [
        'Сварите яйца вкрутую, остудите и очистите.',
        'Огурец и помидор нарежьте средними кусочками, яйца разделите на аккуратные дольки.',
        'Сложите овощи и яйца в миску, посолите и аккуратно перемешайте, не раздавливая помидоры.',
        'Добавьте немного масла или сметаны по вкусу и ещё раз легко перемешайте.',
        'Дайте салату постоять 5 минут, чтобы овощи слегка пустили сок и вкус объединился.',
        'Подавайте сразу после смешивания как лёгкий обед или гарнир.',
      ],
      { isVegetarian: true, isGlutenFree: true }
    ),
    aliases: ['овощной салат с яйцом', 'салат с огурцом и помидором', 'лёгкий салат'],
  },
  {
    recipe: createRecipe(
      910011,
      'Паста без глютена с грибами и беконом',
      FOOD_RU_COVER_IMAGES.baconMushroomPasta,
      25,
      3,
      ['макароны', 'грибы', 'бекон', 'сливки', 'лук'],
      [
        'Отварите безглютеновую пасту по инструкции и сохраните немного воды после варки.',
        'Лук нарежьте мелко, грибы пластинками, бекон небольшими полосками.',
        'Обжарьте бекон до румяности, добавьте лук и грибы и готовьте до мягкости.',
        'Влейте сливки, посолите и поперчите соус по вкусу.',
        'Соедините пасту с соусом и прогрейте одну минуту, добавляя воду от варки при необходимости.',
        'Подавайте сразу, пока соус остаётся нежным и сливочным.',
      ],
      { isVegetarian: true }
    ),
    aliases: ['макароны с томатами', 'паста с помидорами', 'макароны с сыром'],
  },
  {
    recipe: createRecipe(
      910012,
      'Картофель с грибами, луком и укропом',
      FOOD_RU_COVER_IMAGES.potatoMushrooms,
      35,
      3,
      ['картофель', 'грибы', 'лук', 'чеснок'],
      [
        'Картофель нарежьте брусочками, грибы пластинками, лук полукольцами, чеснок мелко порубите.',
        'Разогрейте сковороду и сначала обжарьте картофель до золотистой корочки.',
        'Добавьте лук и грибы, перемешайте и готовьте, пока грибы не станут мягкими и ароматными.',
        'В конце добавьте чеснок, соль и перец, затем ещё раз аккуратно перемешайте.',
        'Накройте крышкой на 5 минут, чтобы картофель дошёл до полной мягкости внутри.',
        'Подавайте блюдо горячим как самостоятельный ужин или гарнир.',
      ],
      { isVegan: true, isVegetarian: true, isGlutenFree: true, isDairyFree: true }
    ),
    aliases: ['картошка с грибами', 'жареная картошка с грибами', 'картофель на сковороде'],
  },
  {
    recipe: createRecipe(
      910013,
      'Курица с картофельным пюре',
      FOOD_RU_COVER_IMAGES.chickenMash,
      35,
      3,
      ['курица', 'картофель', 'молоко', 'масло', 'лук'],
      [
        'Картофель очистите, нарежьте и отварите до мягкости в подсоленной воде.',
        'Курицу нарежьте порционными кусочками, лук мелко порубите.',
        'Обжарьте курицу до румяности, добавьте лук и готовьте до мягкости.',
        'Слейте воду с картофеля, добавьте молоко и масло, разомните в нежное пюре.',
        'Проверьте готовность курицы и при необходимости потомите её под крышкой несколько минут.',
        'Подавайте курицу рядом с картофельным пюре, полив соком со сковороды.',
      ],
      { isGlutenFree: true, isDairyFree: true }
    ),
    aliases: ['курица с пюре', 'картофельное пюре с курицей', 'курица картошка'],
  },
  {
    recipe: createRecipe(
      910014,
      'Запеченные перцы с сырной шапочкой',
      FOOD_RU_COVER_IMAGES.bakedPeppers,
      30,
      2,
      ['перец', 'сыр', 'помидор', 'сливки'],
      [
        'Перец разрежьте пополам и аккуратно удалите семена, чтобы получились удобные лодочки.',
        'Помидор нарежьте мелкими кубиками, сыр натрите и смешайте со сливками.',
        'Выложите помидор в половинки перца и накройте сырной смесью.',
        'Поставьте перцы в форму, добавьте немного воды на дно, чтобы овощи не пересохли.',
        'Запекайте в духовке 25-30 минут, пока перец не станет мягким, а сыр не подрумянится.',
        'Подавайте горячими как лёгкий ужин или гарнир.',
      ],
      { isVegetarian: true, isGlutenFree: true }
    ),
    aliases: ['фаршированный перец с яйцом', 'перец с сыром в духовке', 'запечённый сладкий перец'],
  },
  {
    recipe: createRecipe(
      910015,
      'Овощное рагу из кабачка и картофеля',
      FOOD_RU_COVER_IMAGES.vegetableStew,
      35,
      4,
      ['кабачок', 'картофель', 'морковь', 'лук', 'помидор', 'перец'],
      [
        'Кабачок, картофель, морковь, перец и помидор нарежьте средними кусочками, лук мелко порубите.',
        'В сотейнике разогрейте масло и обжарьте лук с морковью 3 минуты до мягкости.',
        'Добавьте картофель и перец, перемешайте и прогрейте ещё пару минут.',
        'Выложите кабачок и помидор, посолите, накройте крышкой и тушите на среднем огне.',
        'Готовьте 20 минут, пока овощи не станут мягкими, а соус естественно загустеет за счёт помидора.',
        'Подавайте рагу горячим или тёплым, оно хорошо подходит и как основное блюдо, и как гарнир.',
      ],
      { isVegan: true, isVegetarian: true, isGlutenFree: true, isDairyFree: true }
    ),
    aliases: ['овощное рагу', 'рагу с кабачком', 'тушёные овощи'],
  },
];

const FEATURED_RECIPE_IDS = [910002, 910003, 910004, 910005, 910006];

const DEFAULT_RECIPE_IMAGE = HERO_IMAGES.vegetableStew;
const STOCK_STEP_IMAGE_BASE = 'https://images.unsplash.com';

const STOCK_STEP_IMAGES = {
  ingredients:
    `${STOCK_STEP_IMAGE_BASE}/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80`,
  chop:
    `${STOCK_STEP_IMAGE_BASE}/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80`,
  fry:
    `${STOCK_STEP_IMAGE_BASE}/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=1200&q=80`,
  boil:
    `${STOCK_STEP_IMAGE_BASE}/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80`,
  bake:
    `${STOCK_STEP_IMAGE_BASE}/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80`,
  mix:
    `${STOCK_STEP_IMAGE_BASE}/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80`,
  serve:
    `${STOCK_STEP_IMAGE_BASE}/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80`,
};

const QUICK_INGREDIENTS_PRIORITY = [
  'курица',
  'картофель',
  'лук',
  'чеснок',
  'морковь',
  'помидор',
  'огурец',
  'капуста',
  'перец',
  'яйца',
  'молоко',
  'сыр',
  'рис',
  'макароны',
  'грибы',
  'сливки',
  'хлеб',
  'кабачок',
];

const NORMALIZATION_ALIASES: Record<string, string> = {
  картошка: 'картофель',
  картофелина: 'картофель',
  картофелины: 'картофель',
  помидоры: 'помидор',
  томат: 'помидор',
  томаты: 'помидор',
  огурцы: 'огурец',
  перцы: 'перец',
  'сладкий перец': 'перец',
  'болгарский перец': 'перец',
  яйца: 'яйца',
  яйцо: 'яйца',
  'куриное филе': 'курица',
  'куриное мясо': 'курица',
  шампиньоны: 'грибы',
  грибы: 'грибы',
  сырок: 'сыр',
  макарон: 'макароны',
  'макаронные изделия': 'макароны',
  паста: 'макароны',
  'сливки 10%': 'сливки',
  'сливки 20%': 'сливки',
  zucchini: 'кабачок',
  potato: 'картофель',
  potatoes: 'картофель',
  onion: 'лук',
  garlic: 'чеснок',
  carrot: 'морковь',
  carrots: 'морковь',
  tomato: 'помидор',
  tomatoes: 'помидор',
  cucumber: 'огурец',
  cabbage: 'капуста',
  pepper: 'перец',
  chicken: 'курица',
  egg: 'яйца',
  eggs: 'яйца',
  milk: 'молоко',
  cheese: 'сыр',
  rice: 'рис',
  pasta: 'макароны',
  mushrooms: 'грибы',
  cream: 'сливки',
  bread: 'хлеб',
};

const PANTRY_INGREDIENTS = new Set([
  'масло',
  'соль',
  'перец',
  'вода',
  'сахар',
  'мука',
  'зелень',
]);

const LOCAL_RECIPES = LOCAL_RECIPE_DEFINITIONS.map((item) => item.recipe);
const LOCAL_RECIPE_IDS = new Set(LOCAL_RECIPES.map((recipe) => recipe.id));

const normalize = (value: string): string => {
  const normalized = value.trim().toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ');
  return NORMALIZATION_ALIASES[normalized] || normalized;
};

const unique = (items: string[]) => Array.from(new Set(items.map(normalize).filter(Boolean)));

const titleCase = (value: string) =>
  value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const buildSearchHaystack = ({ recipe, aliases = [] }: LocalRecipeDefinition): string[] => [
  normalize(recipe.name),
  ...recipe.ingredients.map(normalize),
  ...aliases.map(normalize),
];

const pickRecipeImage = (name: string, ingredients: string[] = []): string => {
  const haystack = `${name} ${ingredients.join(' ')}`.toLowerCase();

  if (haystack.includes('куриц') && haystack.includes('карто')) {
    return HERO_IMAGES.chickenPotatoes;
  }
  if (haystack.includes('гриб') && (haystack.includes('слив') || haystack.includes('макарон'))) {
    return HERO_IMAGES.creamyMushroomPasta;
  }
  if (haystack.includes('омлет') || haystack.includes('яйц')) {
    return HERO_IMAGES.omelet;
  }
  if (haystack.includes('суп')) {
    return HERO_IMAGES.soup;
  }
  if (haystack.includes('перец') && haystack.includes('запеч')) {
    return HERO_IMAGES.bakedPepper;
  }
  if (haystack.includes('запекан')) {
    return HERO_IMAGES.casserole;
  }
  if (haystack.includes('рис')) {
    return HERO_IMAGES.vegetableRice;
  }
  if (haystack.includes('салат')) {
    return HERO_IMAGES.salad;
  }
  if (haystack.includes('хлеб') || haystack.includes('грен')) {
    return HERO_IMAGES.toast;
  }

  return DEFAULT_RECIPE_IMAGE;
};

export const getFallbackRecipeImage = (name: string, ingredients: string[] = []): string =>
  pickRecipeImage(name, ingredients);

export const getFallbackStepImage = (
  stepText: string,
  recipeTitle: string,
  ingredients: string[] = []
): string => {
  const stepHaystack = stepText.toLowerCase();

  if (/(подготов|продукт|ингредиент|промой|очист)/i.test(stepHaystack)) {
    return STOCK_STEP_IMAGES.ingredients;
  }
  if (/(нареж|пореж|измельч|нашинку|cut|chop|slice)/i.test(stepHaystack)) {
    return STOCK_STEP_IMAGES.chop;
  }
  if (/(разогре|обжар|жар|сковород|fry|saute|sear|pan)/i.test(stepHaystack)) {
    return STOCK_STEP_IMAGES.fry;
  }
  if (/(отвар|вар|кип|туш|boil|simmer|pot)/i.test(stepHaystack)) {
    return STOCK_STEP_IMAGES.boil;
  }
  if (/(запек|духов|печ|bake|oven|roast)/i.test(stepHaystack)) {
    return STOCK_STEP_IMAGES.bake;
  }
  if (/(смеш|перемеш|соедини|взбей|mix|stir|combine|whisk)/i.test(stepHaystack)) {
    return STOCK_STEP_IMAGES.mix;
  }
  if (/(пода|укрась|serve|plate|garnish)/i.test(stepHaystack)) {
    return STOCK_STEP_IMAGES.serve;
  }

  return pickRecipeImage(recipeTitle, ingredients);
};

export const isLocalRecipe = (recipeOrId: number | Recipe): boolean => {
  const id = typeof recipeOrId === 'number' ? recipeOrId : recipeOrId.id;
  return LOCAL_RECIPE_IDS.has(id);
};

export const getLocalRecommendedRecipes = (): Recipe[] =>
  LOCAL_RECIPES;

export const getLocalIngredientSuggestions = (): string[] => {
  const derived = new Set(LOCAL_RECIPES.flatMap((recipe) => recipe.ingredients.map(normalize)));
  const ordered = QUICK_INGREDIENTS_PRIORITY.filter((item) => derived.has(item));
  const extra = Array.from(derived).filter((item) => !ordered.includes(item)).sort();
  return [...ordered, ...extra];
};

export const findLocalRecipesByIngredients = (ingredients: string[], strict = false): Recipe[] => {
  const normalizedIngredients = unique(ingredients);
  if (normalizedIngredients.length === 0) {
    return [];
  }

  return [...LOCAL_RECIPES]
    .map((recipe) => {
      const recipeIngredients = recipe.ingredients.map(normalize);
      const score = normalizedIngredients.reduce(
        (sum, ingredient) => sum + (recipeIngredients.includes(ingredient) ? 1 : 0),
        0
      );
      const coverage = score / recipeIngredients.length;

      return { recipe, score, coverage };
    })
    .filter(({ recipe, score }) => {
      if (score === 0) {
        return false;
      }

      if (!strict) {
        return true;
      }

      const recipeIngredients = recipe.ingredients.map(normalize);
      return recipeIngredients.every(
        (ingredient) =>
          normalizedIngredients.includes(ingredient) || PANTRY_INGREDIENTS.has(ingredient)
      );
    })
    .sort((a, b) => {
      if (b.coverage !== a.coverage) {
        return b.coverage - a.coverage;
      }
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.recipe.cookingTime - b.recipe.cookingTime;
    })
    .map(({ recipe }) => recipe);
};

export const searchLocalRecipesByName = (query: string): Recipe[] => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return [];
  }

  return LOCAL_RECIPE_DEFINITIONS.filter((definition) =>
    buildSearchHaystack(definition).some((item) => item.includes(normalizedQuery))
  ).map((definition) => definition.recipe);
};

const detectDishName = (ingredients: string[]) => {
  const set = new Set(ingredients);

  if (set.has('курица') && set.has('картофель')) {
    return 'Домашняя курица с картофелем';
  }
  if (set.has('макароны')) {
    return 'Сытные макароны из того, что есть дома';
  }
  if (set.has('рис')) {
    return 'Рисовое блюдо с овощами';
  }
  if (set.has('яйца')) {
    return 'Сковородный омлет с начинкой';
  }

  return `Блюдо из ${ingredients.slice(0, 3).join(', ')}`;
};

const buildDetailedSteps = (ingredients: string[]): string[] => {
  const titleIngredients = ingredients.join(', ');

  return [
    `Подготовьте продукты: ${titleIngredients}. Все овощи промойте, при необходимости очистите и нарежьте удобными кусочками среднего размера.`,
    'Выберите подходящую посуду: сковороду, сотейник или кастрюлю. Разогрейте её на среднем огне и добавьте немного масла.',
    'Сначала готовьте самые плотные ингредиенты, которые требуют больше времени. Периодически перемешивайте, чтобы они прогревались равномерно.',
    'Добавьте остальные продукты, посолите, поперчите и при необходимости влейте немного воды, чтобы блюдо получилось сочным.',
    'Доведите всё до мягкости и обязательно попробуйте на вкус. При необходимости скорректируйте соль, перец и количество жидкости.',
    'Перед подачей дайте блюду постоять 2-3 минуты, чтобы вкус стал более собранным и насыщенным.',
  ];
};

export const generateLocalDetailedRecipe = (ingredients: string[]): DetailedRussianRecipe => {
  const normalized = unique(ingredients);
  const fallbackIngredients =
    normalized.length > 0
      ? normalized.map(titleCase)
      : ['Картофель', 'Лук', 'Масло', 'Соль'];

  return {
    title: detectDishName(normalized.length > 0 ? normalized : ['простых продуктов']),
    ingredients: fallbackIngredients,
    steps: buildDetailedSteps(normalized.length > 0 ? normalized : ['простых продуктов']),
  };
};

export const detailedRecipeToCard = (
  detailed: DetailedRussianRecipe,
  baseId = Date.now()
): Recipe => ({
  id: baseId,
  name: detailed.title,
  imageUrl: pickRecipeImage(detailed.title, detailed.ingredients),
  cookingTime: 35,
  servings: 2,
  ingredients: detailed.ingredients,
  instructions: detailed.steps,
  isVegan: false,
  isGlutenFree: false,
  isVegetarian: false,
  isDairyFree: false,
});
