export type StepVisualType =
  | 'ingredients'
  | 'chop'
  | 'fry'
  | 'boil'
  | 'bake'
  | 'mix'
  | 'serve';

export type LocalStepVisualAsset = number;

const STEP_VISUAL_ASSETS: Record<StepVisualType, LocalStepVisualAsset> = {
  ingredients: require('../../assets/step-images/ingredients.jpg'),
  chop: require('../../assets/step-images/chop.jpg'),
  fry: require('../../assets/step-images/fry-onion.jpg'),
  boil: require('../../assets/step-images/boil.jpg'),
  bake: require('../../assets/step-images/serve.jpg'),
  mix: require('../../assets/step-images/mixing-bowl.jpg'),
  serve: require('../../assets/step-images/serve.jpg'),
};

const realisticPhoto = (keywords: string, lock: number): string =>
  `https://loremflickr.com/960/540/${keywords}?lock=${lock}`;

const makeRealisticStepImages = (recipeId: number, keywords: string[]): string[] =>
  keywords.map((item, index) => realisticPhoto(item, recipeId * 10 + index + 1));

const foodRuCdnImage = (encodedPath: string): string => {
  const normalizedPath = encodedPath.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  return `https://cdn.food.ru/unsigned/fit/960/540/ce/0/${normalizedPath}.jpg`;
};

const FOOD_RU_STEP_IMAGES = {
  chickenPotatoes: [
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzU3Njg4L3N0ZXBzL1QySFVpOS5qcGVn.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzU3Njg4L3N0ZXBzLzNnb1lzZi5qcGVn.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzU3Njg4L3N0ZXBzLzl1Q0ptRS5qcGVn.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzU3Njg4L3N0ZXBzLzRCRnNMci5qcGVn.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzU3Njg4L3N0ZXBzL0x2UEdFYy5qcGVn.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzU3Njg4L3N0ZXBzL1l5cmpqcS5qcGVn.jpg'),
  ],
  pastaMushroom: [
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE0NDMzNC9jb3ZlcnMvdk1yelF0LmpwZWc'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE0NDMzNC9zdGVwcy80Ukpkdm0uanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE0NDMzNC9zdGVwcy9YQ005S0QuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE0NDMzNC9zdGVwcy8zR2RldXMuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE0NDMzNC9zdGVwcy8zUFhVd1EuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE0NDMzNC9jb3ZlcnMvdk1yelF0LmpwZWc'),
  ],
  riceVegetables: [
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE1OS9jb3ZlcnMvMzNob3NnLmpwZw'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE1OS9zdGVwcy9OWkR4V2kuanBn.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE1OS9zdGVwcy9XUjVSYUYuanBn.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE1OS9zdGVwcy83NlJZTjMuanBn.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE1OS9zdGVwcy80S3p1NHYuanBn.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE1OS9zdGVwcy9hdU5RaXcuanBn.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE1OS9zdGVwcy8zNHRFYWYuanBn.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE1OS9zdGVwcy80NjRLUkguanBn.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE1OS9zdGVwcy80QW9OaTguanBn.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy9yZWNpcGVzLzE1OS9zdGVwcy8zRDVBRDYuanBn.jpg'),
  ],
  omelet: [
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDQxNi8zUGFrRUEuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDQxMy9CZDdCUGYuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDQxMy8zdno1UDUuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDQxMy8zWG9qUWcuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDQxNi9VOG1zc2MuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDQxMy8zOEM2b3AuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDQxMy9FUXFuRE0uanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDQxMy8zZkI5NHcuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDQxMy9Ed1Q2dDMuanBlZw.jpg'),
  ],
  beefPasta: [
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDMyMS9VWVprbW8uanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDMyMS8zY0xyQ3guanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDMyMS80VUdBWnguanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDMyMS80S0tZRTguanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDMyMS80UWtSRHEuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDMyMS8zWTV1WVMuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDMyMS80UWlxd0wuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDMyMS9rWEVWdXkuanBlZw.jpg'),
  ],
  chickenRiceSoup: [
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMTIxOC80TXRXS2EuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMTExNy80TkhySmsuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMTExNy9aODlIaWEuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMTExNy8zR29pM3kuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMTExNy83VVZ0aWUuanBlZw.jpg'),
  ],
  potatoCasserole: [
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDQxNS9zOEhNbVUuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDQwNi9menQ5d2EuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDQwNi8zY3RINmsuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDQwNi9uWHhpV2IuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDQwNi80M0VOOFQuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDQwNi9rZmRtZ2QuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDQwNi8zamNpQU0uanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDQwNi91aWpmTGguanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI1MDQxNS9nU1A3Y0cuanBlZw.jpg'),
  ],
  riceEgg: [
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMDUxMS8zaUZaVzQuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMDQxOS8zZFl2WGsuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMDQxOS80RjU5OU0uanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMDQxOS90ZHV6Z3guanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMDQxOS9vU3FkOWkuanBlZw.jpg'),
  ],
  cheeseToast: [
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMDIyMy8zb2hHeHcuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMDIyMy9ldkNYR2IuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMDIyMy9OdlZzenIuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMDIyMy9lV1JtS2guanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMDIyMy9ldzljTkouanBlZw.jpg'),
  ],
  freshSalad: [
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgwNi8zWHVIRlcuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgwNi9GNEZVNmYuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgwNi9oUGdIZmQuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgwNi80RjJzY0wuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgwNi8zTXFoSHYuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgwNi8zRHV6UjcuanBlZw.jpg'),
  ],
  baconMushroomPasta: [
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgxOS80SHBURnguanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgxOS9DTFhDRXEuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgxOS8zRjNqcEguanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgxOS8zN3p1QWUuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgxOS80RGdodm0uanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgxOS9tOHlheHIuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgxOS80VDVxQVouanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgxOS8zTE5SUWkuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgxOS8zTG80cm4uanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgxOS8zd2M0VjQuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDgxOS8zbldCTFguanBlZw.jpg'),
  ],
  potatoMushrooms: [
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMDEyMy9EZlJHb0UuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMTExNi80Snk3OUcuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMTExNi80MmpWNFMuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMTExNi9hVGtVejUuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMTExNi8zTTlnd1MuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMTExNi8zNnk1ck4uanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMTExNi8zTktoa1QuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMTExNi92TXZ4M2YuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIyMTExNi80N2Y0QmMuanBlZw.jpg'),
  ],
  chickenMash: [
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDMwNi9jWUJmWTYuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDMwNi80NnJ3cFYuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDMwNi82eGREcVEuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDIxMC8zYlNpV0guanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDIxMC80THhUeXouanBlZw.jpg'),
  ],
  bakedPeppers: [
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDkxMi80QWV0YjYuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDkwOC8zcGpGTXQuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDkwOC9IVm0yVm4uanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDkwOC9YcGpXVEUuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDkwOC80OGZkeTUuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDkwOC8zY0ZZQnguanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDkwOC96Z1huNVYuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDkwOC95VW8zdnMuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDkwOC81TjVuZXkuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDkwOC9qRHhNRzMuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDkwOC80Q2t1eDkuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDI0MDkwOC80UzhCY2UuanBlZw.jpg'),
  ],
  vegetableStew: [
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMDQxOC8zYWlwNmMuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMDQxMS8zZTZGVW4uanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMDQxMS8zS1k2N1kuanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMDQxMS80Um1nVDguanBlZw.jpg'),
    foodRuCdnImage('czM6Ly9tZWRpYS9waWN0dXJlcy8yMDIzMDQxMS9vaXNRZ3QuanBlZw.jpg'),
  ],
};

const LOCAL_GENERATED_STEP_IMAGES: Record<number, LocalStepVisualAsset[]> = {
  910001: [
    require('../../assets/generated-step-images/910001-1.png'),
    require('../../assets/generated-step-images/910001-2.png'),
    require('../../assets/generated-step-images/910001-3.png'),
    require('../../assets/generated-step-images/910001-4.png'),
    require('../../assets/generated-step-images/910001-5.png'),
    require('../../assets/generated-step-images/910001-6.png'),
  ],
  910002: [
    require('../../assets/generated-step-images/910002-1.png'),
    require('../../assets/generated-step-images/910002-2.png'),
    require('../../assets/generated-step-images/910002-3.png'),
    require('../../assets/generated-step-images/910002-4.png'),
    require('../../assets/generated-step-images/910002-5.png'),
    require('../../assets/generated-step-images/910002-6.png'),
  ],
  910003: [
    require('../../assets/generated-step-images/910003-1.png'),
    require('../../assets/generated-step-images/910003-2.png'),
    require('../../assets/generated-step-images/910003-3.png'),
    require('../../assets/generated-step-images/910003-4.png'),
    require('../../assets/generated-step-images/910003-5.png'),
    require('../../assets/generated-step-images/910003-6.png'),
  ],
  910004: [
    require('../../assets/generated-step-images/910004-1.png'),
    require('../../assets/generated-step-images/910004-2.png'),
    require('../../assets/generated-step-images/910004-3.png'),
    require('../../assets/generated-step-images/910004-4.png'),
    require('../../assets/generated-step-images/910004-5.png'),
    require('../../assets/generated-step-images/910004-6.png'),
  ],
  910005: [
    require('../../assets/generated-step-images/910005-1.png'),
    require('../../assets/generated-step-images/910005-2.png'),
    require('../../assets/generated-step-images/910005-3.png'),
    require('../../assets/generated-step-images/910005-4.png'),
    require('../../assets/generated-step-images/910005-5.png'),
    require('../../assets/generated-step-images/910005-6.png'),
  ],
  910006: [
    require('../../assets/generated-step-images/910006-1.png'),
    require('../../assets/generated-step-images/910006-2.png'),
    require('../../assets/generated-step-images/910006-3.png'),
    require('../../assets/generated-step-images/910006-4.png'),
    require('../../assets/generated-step-images/910006-5.png'),
    require('../../assets/generated-step-images/910006-6.png'),
  ],
  910007: [
    require('../../assets/generated-step-images/910007-1.png'),
    require('../../assets/generated-step-images/910007-2.png'),
    require('../../assets/generated-step-images/910007-3.png'),
    require('../../assets/generated-step-images/910007-4.png'),
    require('../../assets/generated-step-images/910007-5.png'),
    require('../../assets/generated-step-images/910007-6.png'),
  ],
  910008: [
    require('../../assets/generated-step-images/910008-1.png'),
    require('../../assets/generated-step-images/910008-2.png'),
    require('../../assets/generated-step-images/910008-3.png'),
    require('../../assets/generated-step-images/910008-4.png'),
    require('../../assets/generated-step-images/910008-5.png'),
    require('../../assets/generated-step-images/910008-6.png'),
  ],
  910009: [
    require('../../assets/generated-step-images/910009-1.png'),
    require('../../assets/generated-step-images/910009-2.png'),
    require('../../assets/generated-step-images/910009-3.png'),
    require('../../assets/generated-step-images/910009-4.png'),
    require('../../assets/generated-step-images/910009-5.png'),
    require('../../assets/generated-step-images/910009-6.png'),
  ],
  910010: [
    require('../../assets/generated-step-images/910010-1.png'),
    require('../../assets/generated-step-images/910010-2.png'),
    require('../../assets/generated-step-images/910010-3.png'),
    require('../../assets/generated-step-images/910010-4.png'),
    require('../../assets/generated-step-images/910010-5.png'),
    require('../../assets/generated-step-images/910010-6.png'),
  ],
  910011: [
    require('../../assets/generated-step-images/910011-1.png'),
    require('../../assets/generated-step-images/910011-2.png'),
    require('../../assets/generated-step-images/910011-3.png'),
    require('../../assets/generated-step-images/910011-4.png'),
    require('../../assets/generated-step-images/910011-5.png'),
    require('../../assets/generated-step-images/910011-6.png'),
  ],
  910012: [
    require('../../assets/generated-step-images/910012-1.png'),
    require('../../assets/generated-step-images/910012-2.png'),
    require('../../assets/generated-step-images/910012-3.png'),
    require('../../assets/generated-step-images/910012-4.png'),
    require('../../assets/generated-step-images/910012-5.png'),
    require('../../assets/generated-step-images/910012-6.png'),
  ],
  910013: [
    require('../../assets/generated-step-images/910013-1.png'),
    require('../../assets/generated-step-images/910013-2.png'),
    require('../../assets/generated-step-images/910013-3.png'),
    require('../../assets/generated-step-images/910013-4.png'),
    require('../../assets/generated-step-images/910013-5.png'),
    require('../../assets/generated-step-images/910013-6.png'),
  ],
  910014: [
    require('../../assets/generated-step-images/910014-1.png'),
    require('../../assets/generated-step-images/910014-2.png'),
    require('../../assets/generated-step-images/910014-3.png'),
    require('../../assets/generated-step-images/910014-4.png'),
    require('../../assets/generated-step-images/910014-5.png'),
    require('../../assets/generated-step-images/910014-6.png'),
  ],
  910015: [
    require('../../assets/generated-step-images/910015-1.png'),
    require('../../assets/generated-step-images/910015-2.png'),
    require('../../assets/generated-step-images/910015-3.png'),
    require('../../assets/generated-step-images/910015-4.png'),
    require('../../assets/generated-step-images/910015-5.png'),
    require('../../assets/generated-step-images/910015-6.png'),
  ],
};

const LOCAL_RECIPE_STEP_IMAGES: Record<number, string[]> = {
  900001: [
    'https://img.spoonacular.com/recipes/660220-556x370.jpg',
    'https://img.spoonacular.com/recipes/633624-312x231.jpg',
    'https://img.spoonacular.com/recipes/654460-312x231.jpg',
    'https://img.spoonacular.com/recipes/1043339-312x231.jpg',
    'https://img.spoonacular.com/recipes/660220-556x370.jpg',
    'https://img.spoonacular.com/recipes/660220-556x370.jpg',
  ],
  900002: [
    'https://img.spoonacular.com/recipes/642610-312x231.jpg',
    'https://img.spoonacular.com/recipes/642610-312x231.jpg',
    'https://img.spoonacular.com/recipes/642610-312x231.jpg',
    'https://img.spoonacular.com/recipes/642610-312x231.jpg',
    'https://img.spoonacular.com/recipes/642610-312x231.jpg',
    'https://img.spoonacular.com/recipes/642610-312x231.jpg',
  ],
  900003: [
    'https://img.spoonacular.com/recipes/654959-312x231.jpg',
    'https://img.spoonacular.com/recipes/659419-312x231.jpg',
    'https://img.spoonacular.com/recipes/652610-312x231.jpg',
    'https://img.spoonacular.com/recipes/652610-312x231.jpg',
    'https://img.spoonacular.com/recipes/652610-312x231.jpg',
    'https://img.spoonacular.com/recipes/652610-312x231.jpg',
  ],
  900004: [
    'https://img.spoonacular.com/recipes/716627-312x231.jpg',
    'https://img.spoonacular.com/recipes/716627-312x231.jpg',
    'https://img.spoonacular.com/recipes/716627-312x231.jpg',
    'https://img.spoonacular.com/recipes/716627-312x231.jpg',
    'https://img.spoonacular.com/recipes/716627-312x231.jpg',
    'https://img.spoonacular.com/recipes/716627-312x231.jpg',
  ],
  900005: [
    'https://img.spoonacular.com/recipes/635964-312x231.jpg',
    'https://img.spoonacular.com/recipes/635964-312x231.jpg',
    'https://img.spoonacular.com/recipes/635964-312x231.jpg',
    'https://img.spoonacular.com/recipes/635964-312x231.jpg',
    'https://img.spoonacular.com/recipes/635964-312x231.jpg',
    'https://img.spoonacular.com/recipes/635964-312x231.jpg',
  ],
  910001: FOOD_RU_STEP_IMAGES.chickenPotatoes,
  910002: FOOD_RU_STEP_IMAGES.pastaMushroom,
  910003: FOOD_RU_STEP_IMAGES.riceVegetables,
  910004: FOOD_RU_STEP_IMAGES.omelet,
  910005: FOOD_RU_STEP_IMAGES.beefPasta,
  910006: FOOD_RU_STEP_IMAGES.chickenRiceSoup,
  910007: FOOD_RU_STEP_IMAGES.potatoCasserole,
  910008: FOOD_RU_STEP_IMAGES.riceEgg,
  910009: FOOD_RU_STEP_IMAGES.cheeseToast,
  910010: FOOD_RU_STEP_IMAGES.freshSalad,
  910011: FOOD_RU_STEP_IMAGES.baconMushroomPasta,
  910012: FOOD_RU_STEP_IMAGES.potatoMushrooms,
  910013: FOOD_RU_STEP_IMAGES.chickenMash,
  910014: FOOD_RU_STEP_IMAGES.bakedPeppers,
  910015: FOOD_RU_STEP_IMAGES.vegetableStew,
};

const KEYWORD_GROUPS: Array<{ type: StepVisualType; patterns: RegExp[] }> = [
  {
    type: 'ingredients',
    patterns: [/подготов/i, /продукт/i, /ингредиент/i, /промой/i, /очист/i],
  },
  {
    type: 'chop',
    patterns: [/нареж/i, /реж/i, /пореж/i, /измельч/i, /нашинку/i, /cut/i, /slice/i, /chop/i],
  },
  {
    type: 'fry',
    patterns: [/обжар/i, /жар/i, /сковород/i, /разогре/i, /пассер/i, /fry/i, /saute/i, /sear/i],
  },
  {
    type: 'boil',
    patterns: [/отвар/i, /вар/i, /кип/i, /туш/i, /кастрюл/i, /pot/i, /boil/i, /simmer/i],
  },
  {
    type: 'bake',
    patterns: [/запек/i, /духов/i, /печ/i, /bake/i, /oven/i, /roast/i],
  },
  {
    type: 'mix',
    patterns: [/смеш/i, /перемеш/i, /соедин/i, /взбей/i, /mix/i, /stir/i, /combine/i, /whisk/i],
  },
  {
    type: 'serve',
    patterns: [/пода/i, /укрась/i, /вылож/i, /plate/i, /serve/i, /garnish/i],
  },
];

export const detectStepVisualType = (
  stepText: string,
  stepIndex: number,
  totalSteps: number
): StepVisualType => {
  const text = String(stepText || '').toLowerCase();

  const matched = KEYWORD_GROUPS.find(({ patterns }) =>
    patterns.some((pattern) => pattern.test(text))
  );
  if (matched) {
    return matched.type;
  }

  if (stepIndex === 0) {
    return 'ingredients';
  }

  if (stepIndex === totalSteps - 1) {
    return 'serve';
  }

  if (stepIndex === 1) {
    return 'chop';
  }

  if (stepIndex < Math.ceil(totalSteps / 2)) {
    return 'fry';
  }

  return 'mix';
};

export const getLocalStepVisualAsset = (
  stepText: string,
  stepIndex: number,
  totalSteps: number
): LocalStepVisualAsset => STEP_VISUAL_ASSETS[detectStepVisualType(stepText, stepIndex, totalSteps)];

export const getRecipeSpecificStepImageAsset = (
  recipeId: number,
  stepIndex: number
): LocalStepVisualAsset | null => {
  if (LOCAL_RECIPE_STEP_IMAGES[recipeId]) {
    return null;
  }

  const recipeImages = LOCAL_GENERATED_STEP_IMAGES[recipeId];
  if (!recipeImages) {
    return null;
  }

  return recipeImages[stepIndex] || recipeImages[recipeImages.length - 1] || null;
};

export const getRecipeSpecificStepImageUrl = (recipeId: number, stepIndex: number): string => {
  const recipeImages = LOCAL_RECIPE_STEP_IMAGES[recipeId];
  if (!recipeImages) {
    return '';
  }

  return recipeImages[stepIndex] || recipeImages[recipeImages.length - 1] || '';
};
