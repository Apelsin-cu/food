class Ingredient {
  final String name;
  bool isSelected;

  Ingredient({
    required this.name,
    this.isSelected = false,
  });

  factory Ingredient.fromJson(Map<String, dynamic> json) {
    return Ingredient(
      name: json['name'] ?? '',
      isSelected: json['isSelected'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'isSelected': isSelected,
    };
  }
}
