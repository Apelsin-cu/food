import '../models/recipe.dart';

class GPTService {
  static Future<List<Recipe>> generateRecipes(List<String> ingredients) async {
    // Имитация работы с GPT API
    await Future.delayed(Duration(seconds: 2)); // Имитация загрузки
    return _getSampleRecipes(ingredients);
  }

  static String _getRecipeImage(String recipeName) {
    // Простая логика для получения изображений по названию блюда
    final images = {
      'паста': 'https://images.unsplash.com/photo-1551892589-865f69869476?w=400',
      'курица': 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400',
      'салат': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      'суп': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
    };
    
    for (var key in images.keys) {
      if (recipeName.toLowerCase().contains(key)) {
        return images[key]!;
      }
    }
    
    return 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400';
  }

  static List<Recipe> _getSampleRecipes(List<String> ingredients) {
    return [
      Recipe(
        id: '1',
        name: 'Креативная паста с курицей',
        description: 'Сытное блюдо с курицей, брокколи и сыром',
        ingredients: [
          '2 куриные грудки',
          '1 фунт пасты',
          '1/2 стакана тертого пармезана',
          '1/4 стакана кедровых орехов',
          '2 стакана оливкового масла',
          'соль и перец по вкусу'
        ],
        instructions: [
          'Отварите пасту',
          'Обжарьте курицу на сковороде',
          'Смешайте все ингредиенты',
          'Объедините все ингредиенты',
          'Добавьте сливки и перемешайте'
        ],
        imageUrl: 'https://images.unsplash.com/photo-1551892589-865f69869476?w=400',
        servings: 4,
        cookingTime: '30 мин',
      ),
      Recipe(
        id: '2',
        name: 'Сырная запеканка с брокколи',
        description: 'Запеканка с брокколи и сыром чеддер',
        ingredients: [
          'брокколи',
          'сыр чеддер',
          'лук'
        ],
        instructions: [
          'Отварите брокколи',
          'Нарежьте лук',
          'Смешайте с сыром',
          'Запекайте 25 минут'
        ],
        imageUrl: 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400',
        servings: 3,
        cookingTime: '45 мин',
      ),
      Recipe(
        id: '3',
        name: 'Пряные креветки',
        description: 'Креветки с брокколи и сыром чеддер',
        ingredients: [
          'брокколи и сыр чеддер'
        ],
        instructions: [
          'Приготовьте креветки',
          'Добавьте специи',
          'Подавайте горячими'
        ],
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        servings: 2,
        cookingTime: '20 мин',
      ),
    ];
  }
}
