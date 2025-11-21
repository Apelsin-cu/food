import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/app_state.dart';

class RefrigeratorScreen extends StatefulWidget {
  @override
  _RefrigeratorScreenState createState() => _RefrigeratorScreenState();
}

class _RefrigeratorScreenState extends State<RefrigeratorScreen> {
  final TextEditingController _controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFB5E5CF),
      appBar: AppBar(
        backgroundColor: Color(0xFFB5E5CF),
        elevation: 0,
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
      body: Consumer<AppState>(
        builder: (context, appState, child) {
          return Column(
            children: [
              Container(
                padding: EdgeInsets.all(16),
                child: Text(
                  'My Refrigerator',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              Expanded(
                child: Container(
                  margin: EdgeInsets.all(16),
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    children: [
                      // Поле для добавления нового продукта
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(25),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _controller,
                                decoration: InputDecoration(
                                  hintText: 'Добавить продукт...',
                                  border: InputBorder.none,
                                  hintStyle: TextStyle(color: Colors.grey[500]),
                                ),
                              ),
                            ),
                            IconButton(
                              onPressed: _addIngredient,
                              icon: Container(
                                padding: EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Color(0xFFB5E5CF),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.add,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 20),
                      // Список продуктов
                      Expanded(
                        child: ListView.builder(
                          itemCount: appState.availableIngredients.length,
                          itemBuilder: (context, index) {
                            final ingredient = appState.availableIngredients[index];
                            return Container(
                              margin: EdgeInsets.only(bottom: 12),
                              padding: EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: Colors.grey[200]!,
                                  width: 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      ingredient.name,
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                  IconButton(
                                    onPressed: () => appState.removeIngredient(index),
                                    icon: Icon(
                                      Icons.close,
                                      color: Color(0xFFE74C3C),
                                      size: 20,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                      SizedBox(height: 20),
                      // Кнопка поиска рецептов
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: appState.selectedIngredients.isNotEmpty
                              ? () => _findRecipes(context)
                              : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Color(0xFFE67E22),
                            foregroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(25),
                            ),
                          ),
                          child: Text(
                            'Find Recipes',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  void _addIngredient() {
    if (_controller.text.trim().isNotEmpty) {
      Provider.of<AppState>(context, listen: false)
          .addIngredient(_controller.text.trim());
      _controller.clear();
    }
  }

  void _findRecipes(BuildContext context) {
    // Переключаемся на экран рецептов
    DefaultTabController.of(context)?.animateTo(0);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
