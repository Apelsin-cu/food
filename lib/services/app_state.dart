import '../models/recipe.dart';
import '../models/ingredient.dart';

class AppState {
  static final AppState _instance = AppState._internal();
  factory AppState() => _instance;
  AppState._internal();

  List<Recipe> _recipes = [];
  List<Recipe> _favoriteRecipes = [];
  List<Ingredient> _availableIngredients = [
    Ingredient(name: 'Куриная грудка'),
    Ingredient(name: 'Брокколи'),
    Ingredient(name: 'Сыр чеддер'),
    Ingredient(name: 'Лук'),
    Ingredient(name: 'Паста'),
    Ingredient(name: 'Рис'),
    Ingredient(name: 'Помидоры'),
    Ingredient(name: 'Морковь'),
    Ingredient(name: 'Картофель'),
    Ingredient(name: 'Перец'),
    Ingredient(name: 'Чеснок'),
    Ingredient(name: 'Оливковое масло'),
  ];

  bool _isLoading = false;
  List<Function()> _listeners = [];

  List<Recipe> get recipes => _recipes;
  List<Recipe> get favoriteRecipes => _favoriteRecipes;
  List<Ingredient> get availableIngredients => _availableIngredients;
  List<String> get selectedIngredients => 
      _availableIngredients.where((i) => i.isSelected).map((i) => i.name).toList();
  bool get isLoading => _isLoading;

  void addListener(Function() listener) {
    _listeners.add(listener);
  }

  void removeListener(Function() listener) {
    _listeners.remove(listener);
  }

  void notifyListeners() {
    for (var listener in _listeners) {
      listener();
    }
  }

  void toggleIngredient(int index) {
    _availableIngredients[index].isSelected = !_availableIngredients[index].isSelected;
    notifyListeners();
  }

  void addIngredient(String name) {
    _availableIngredients.add(Ingredient(name: name));
    notifyListeners();
  }

  void removeIngredient(int index) {
    _availableIngredients.removeAt(index);
    notifyListeners();
  }

  void setRecipes(List<Recipe> recipes) {
    _recipes = recipes;
    notifyListeners();
  }

  void toggleFavorite(Recipe recipe) {
    recipe.isFavorite = !recipe.isFavorite;
    
    if (recipe.isFavorite) {
      if (!_favoriteRecipes.any((r) => r.id == recipe.id)) {
        _favoriteRecipes.add(recipe);
      }
    } else {
      _favoriteRecipes.removeWhere((r) => r.id == recipe.id);
    }
    
    notifyListeners();
  }

  void setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }
}
