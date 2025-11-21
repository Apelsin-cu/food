class Recipe {
  final String id;
  final String name;
  final String description;
  final List<String> ingredients;
  final List<String> instructions;
  final String imageUrl;
  final int servings;
  final String cookingTime;
  bool isFavorite;

  Recipe({
    required this.id,
    required this.name,
    required this.description,
    required this.ingredients,
    required this.instructions,
    required this.imageUrl,
    required this.servings,
    required this.cookingTime,
    this.isFavorite = false,
  });

  factory Recipe.fromJson(Map<String, dynamic> json) {
    return Recipe(
      id: json['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      ingredients: List<String>.from(json['ingredients'] ?? []),
      instructions: List<String>.from(json['instructions'] ?? []),
      imageUrl: json['imageUrl'] ?? 'https://via.placeholder.com/200',
      servings: json['servings'] ?? 2,
      cookingTime: json['cookingTime'] ?? '30 мин',
      isFavorite: json['isFavorite'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'ingredients': ingredients,
      'instructions': instructions,
      'imageUrl': imageUrl,
      'servings': servings,
      'cookingTime': cookingTime,
      'isFavorite': isFavorite,
    };
  }
}
