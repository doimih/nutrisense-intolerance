export interface HistoryRecord {
  id: string;
  generatedAt: string;
  diet_preference: string;
  intolerance_count: number;
  intolerances: string[];
  recommended_count: number;
  avoid_count: number;
  meal_count: number;
  top_recommended: string[];
  top_avoid: string[];
  sample_meals: string[];
}

export const HISTORY_RECORDS: HistoryRecord[] = [
  {
    id: 'hist-001',
    generatedAt: '2026-06-07T13:15:00',
    diet_preference: 'low-carb',
    intolerance_count: 7,
    intolerances: ['Gluten', 'Lactose', 'Eggs', 'Soy', 'Tree Nuts', 'Fructose', 'Histamine'],
    recommended_count: 8,
    avoid_count: 9,
    meal_count: 6,
    top_recommended: ['Wild Salmon', 'Avocado', 'Spinach', 'Chicken Thigh'],
    top_avoid: ['Wheat Bread', 'Cow Milk', 'Pasta'],
    sample_meals: [
      'Pan-Seared Salmon with Spinach',
      'Zucchini Noodles with Chicken',
      'Avocado & Blueberry Breakfast Bowl',
    ],
  },
  {
    id: 'hist-002',
    generatedAt: '2026-06-04T09:42:00',
    diet_preference: 'low-carb',
    intolerance_count: 7,
    intolerances: ['Gluten', 'Lactose', 'Eggs', 'Soy', 'Tree Nuts', 'Fructose', 'Histamine'],
    recommended_count: 9,
    avoid_count: 8,
    meal_count: 5,
    top_recommended: ['Turkey Breast', 'Cucumber', 'Olive Oil', 'Kale'],
    top_avoid: ['Sourdough Bread', 'Yogurt', 'Soy Milk'],
    sample_meals: ['Turkey Lettuce Cups', 'Kale & Olive Salad', 'Cucumber Gazpacho'],
  },
  {
    id: 'hist-003',
    generatedAt: '2026-05-29T16:08:00',
    diet_preference: 'low-carb',
    intolerance_count: 6,
    intolerances: ['Gluten', 'Lactose', 'Eggs', 'Soy', 'Fructose', 'Histamine'],
    recommended_count: 10,
    avoid_count: 7,
    meal_count: 6,
    top_recommended: ['Beef Steak', 'Broccoli', 'Coconut Cream', 'Asparagus'],
    top_avoid: ['Rye Bread', 'Buttermilk', 'Edamame'],
    sample_meals: ['Steak & Asparagus Plate', 'Broccoli Coconut Soup', 'Beef & Kale Stir-fry'],
  },
  {
    id: 'hist-004',
    generatedAt: '2026-05-22T11:30:00',
    diet_preference: 'low-carb',
    intolerance_count: 6,
    intolerances: ['Gluten', 'Lactose', 'Eggs', 'Soy', 'Fructose', 'Histamine'],
    recommended_count: 8,
    avoid_count: 8,
    meal_count: 4,
    top_recommended: ['Sardines', 'Rocket Leaves', 'Macadamia Oil', 'Celery'],
    top_avoid: ['Crackers', 'Ice Cream', 'Miso'],
    sample_meals: ['Sardine & Rocket Salad', 'Celery Sticks with Guacamole'],
  },
  {
    id: 'hist-005',
    generatedAt: '2026-05-15T08:55:00',
    diet_preference: 'vegetarian',
    intolerance_count: 5,
    intolerances: ['Gluten', 'Lactose', 'Eggs', 'Soy', 'Fructose'],
    recommended_count: 11,
    avoid_count: 6,
    meal_count: 6,
    top_recommended: ['Lentils', 'Chickpeas', 'Quinoa', 'Tofu-free Tempeh'],
    top_avoid: ['Wheat Pasta', 'Cheese', 'Scrambled Eggs'],
    sample_meals: ['Lentil Dal', 'Quinoa Buddha Bowl', 'Chickpea Curry'],
  },
  {
    id: 'hist-006',
    generatedAt: '2026-05-08T14:20:00',
    diet_preference: 'vegetarian',
    intolerance_count: 5,
    intolerances: ['Gluten', 'Lactose', 'Eggs', 'Soy', 'Fructose'],
    recommended_count: 9,
    avoid_count: 7,
    meal_count: 5,
    top_recommended: ['Black Beans', 'Sweet Potato', 'Tahini', 'Pumpkin Seeds'],
    top_avoid: ['Barley', 'Cream Cheese', 'Tofu'],
    sample_meals: ['Sweet Potato & Black Bean Bowl', 'Tahini Roasted Vegetables'],
  },
  {
    id: 'hist-007',
    generatedAt: '2026-04-30T10:10:00',
    diet_preference: 'normal',
    intolerance_count: 4,
    intolerances: ['Gluten', 'Lactose', 'Eggs', 'Soy'],
    recommended_count: 12,
    avoid_count: 5,
    meal_count: 6,
    top_recommended: ['Chicken Breast', 'Brown Rice', 'Broccoli', 'Olive Oil'],
    top_avoid: ['Bread', 'Milk', 'Egg-based sauces'],
    sample_meals: ['Chicken Rice Bowl', 'Stir-fried Broccoli with Chicken'],
  },
  {
    id: 'hist-008',
    generatedAt: '2026-04-21T09:00:00',
    diet_preference: 'normal',
    intolerance_count: 3,
    intolerances: ['Gluten', 'Lactose', 'Eggs'],
    recommended_count: 14,
    avoid_count: 4,
    meal_count: 7,
    top_recommended: ['Salmon', 'Potatoes', 'Spinach', 'Olive Oil'],
    top_avoid: ['Bread', 'Butter', 'Omelette'],
    sample_meals: ['Baked Salmon & Potatoes', 'Spinach Soup', 'Grilled Chicken Plate'],
  },
];
