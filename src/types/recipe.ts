export interface Recipe {
  id: number;
  name: string;
  imageUrl: string;
  cookingTime: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  isVegan: boolean;
  isGlutenFree: boolean;
  isVegetarian: boolean;
  isDairyFree: boolean;
}
