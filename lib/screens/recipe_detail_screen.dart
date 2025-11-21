import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/recipe.dart';
import '../services/app_state.dart';

class RecipeDetailScreen extends StatelessWidget {
  final Recipe recipe;

  const RecipeDetailScreen({Key? key, required this.recipe}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFB5E5CF),
      appBar: AppBar(
        backgroundColor: Color(0xFFB5E5CF),
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Icon(Icons.restaurant, color: Colors.white),
            SizedBox(width: 8),
            Text(
              'FlavorFinder',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Заголовок блюда
            Container(
              padding: EdgeInsets.all(16),
              child: Text(
                recipe.name,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            // Основной контент
            Container(
              margin: EdgeInsets.all(16),
              padding: EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Изображение блюда
                  Center(
                    child: Container(
                      width: 150,
                      height: 150,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.grey[200],
                        image: recipe.imageUrl.isNotEmpty
                            ? DecorationImage(
                                image: NetworkImage(recipe.imageUrl),
                                fit: BoxFit.cover,
                              )
                            : null,
                      ),
                      child: recipe.imageUrl.isEmpty
                          ? Icon(
                              Icons.restaurant,
                              size: 60,
                              color: Colors.grey[400],
                            )
                          : null,
                    ),
                  ),
                  SizedBox(height: 24),
                  
                  // Ингредиенты
                  Text(
                    'Ingredients',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  SizedBox(height: 12),
                  ...recipe.ingredients.map((ingredient) => Padding(
                    padding: EdgeInsets.only(bottom: 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '• ',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFB5E5CF),
                          ),
                        ),
                        Expanded(
                          child: Text(
                            ingredient,
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.black87,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )).toList(),
                  
                  SizedBox(height: 24),
                  
                  // Инструкции
                  Text(
                    'Instructions',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  SizedBox(height: 12),
                  ...recipe.instructions.asMap().entries.map((entry) {
                    int index = entry.key;
                    String instruction = entry.value;
                    return Padding(
                      padding: EdgeInsets.only(bottom: 16),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              color: Color(0xFFB5E5CF),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                '${index + 1}',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                          SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              instruction,
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.black87,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                  
                  SizedBox(height: 24),
                  
                  // Кнопки действий
                  Row(
                    children: [
                      // Кнопка "Сохранить рецепт"
                      Expanded(
                        child: Consumer<AppState>(
                          builder: (context, appState, child) {
                            return ElevatedButton.icon(
                              onPressed: () => appState.toggleFavorite(recipe),
                              icon: Icon(
                                recipe.isFavorite ? Icons.favorite : Icons.favorite_border,
                                color: Colors.white,
                              ),
                              label: Text(
                                recipe.isFavorite ? 'Saved' : 'Save Recipe',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Color(0xFFB5E5CF),
                                foregroundColor: Colors.white,
                                padding: EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      SizedBox(width: 12),
                      // Кнопка "Поделиться"
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _shareRecipe(context),
                          icon: Icon(
                            Icons.share,
                            color: Colors.white,
                          ),
                          label: Text(
                            'Share',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Color(0xFFE67E22),
                            foregroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _shareRecipe(BuildContext context) {
    final recipeText = '''
${recipe.name}

Ингредиенты:
${recipe.ingredients.map((i) => '• $i').join('\n')}

Инструкции:
${recipe.instructions.asMap().entries.map((e) => '${e.key + 1}. ${e.value}').join('\n')}

Время приготовления: ${recipe.cookingTime}
Порций: ${recipe.servings}
''';

    // Здесь можно добавить функциональность Share
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Функция "Поделиться" будет добавлена позже'),
        backgroundColor: Color(0xFFB5E5CF),
      ),
    );
  }
}
