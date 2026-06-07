export type GeneralState = 'good' | 'neutral' | 'bad';

export interface JournalEntry {
  id: string;
  date: string;
  foods_consumed: string[];
  symptoms: string[];
  intensity: number;
  general_state: GeneralState;
  notes: string;
}

export const SYMPTOM_OPTIONS = [
  'Bloating',
  'Gas',
  'Abdominal cramps',
  'Diarrhoea',
  'Constipation',
  'Nausea',
  'Headache',
  'Fatigue',
  'Skin rash',
  'Brain fog',
  'Joint pain',
  'Heartburn',
  'Runny nose',
  'Sneezing',
  'None',
];

export const INITIAL_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-001',
    date: '2026-06-07',
    foods_consumed: ['Avocado toast (GF)', 'Black coffee', 'Banana', 'Grilled chicken salad'],
    symptoms: ['Mild bloating'],
    intensity: 2,
    general_state: 'good',
    notes: 'Felt well rested. Minor bloating after breakfast — likely the banana.',
  },
  {
    id: 'entry-002',
    date: '2026-06-06',
    foods_consumed: ['Chicken salad', 'Sparkling water', 'Apple', 'Almonds'],
    symptoms: ['None'],
    intensity: 1,
    general_state: 'good',
    notes: '',
  },
  {
    id: 'entry-003',
    date: '2026-06-05',
    foods_consumed: ['Lentil soup', 'GF bread', 'Orange juice', 'Dairy-free yogurt'],
    symptoms: ['Headache', 'Fatigue'],
    intensity: 5,
    general_state: 'neutral',
    notes: 'Headache started around 3pm. Possibly dehydrated or OJ fructose reaction.',
  },
  {
    id: 'entry-004',
    date: '2026-06-04',
    foods_consumed: ['Brown rice', 'Broccoli', 'Grilled salmon', 'Olive oil dressing'],
    symptoms: ['None'],
    intensity: 1,
    general_state: 'good',
    notes: 'Best day this week. Clean eating, no reactions.',
  },
  {
    id: 'entry-005',
    date: '2026-06-03',
    foods_consumed: ['Oat porridge (dairy-free)', 'Almond milk', 'Mixed berries', 'Pumpkin seeds'],
    symptoms: ['Mild bloating', 'Gas'],
    intensity: 4,
    general_state: 'neutral',
    notes: 'Switched to almond milk — still some bloating. May need to reduce oats.',
  },
  {
    id: 'entry-006',
    date: '2026-06-02',
    foods_consumed: ['Restaurant meal (pasta — mistake)', 'Red wine', 'Tiramisu'],
    symptoms: ['Abdominal cramps', 'Bloating', 'Headache', 'Fatigue'],
    intensity: 8,
    general_state: 'bad',
    notes: 'Ate gluten accidentally at restaurant. Severe reaction — cramps all evening.',
  },
  {
    id: 'entry-007',
    date: '2026-06-01',
    foods_consumed: ['Zucchini noodles', 'Chicken thigh', 'Coconut oil', 'Cherry tomatoes'],
    symptoms: ['None'],
    intensity: 1,
    general_state: 'good',
    notes: '',
  },
  {
    id: 'entry-008',
    date: '2026-05-31',
    foods_consumed: ['Gluten-free pizza', 'Dairy-free cheese', 'Rocket salad'],
    symptoms: ['Mild bloating', 'Brain fog'],
    intensity: 4,
    general_state: 'neutral',
    notes: 'GF pizza still caused some reaction — possibly the dairy-free cheese ingredients.',
  },
  {
    id: 'entry-009',
    date: '2026-05-30',
    foods_consumed: ['Scrambled eggs (test)', 'Spinach', 'Black coffee'],
    symptoms: ['Nausea', 'Skin rash'],
    intensity: 6,
    general_state: 'bad',
    notes: 'Tested eggs again — clear reaction. Confirmed egg intolerance. Removing from diet.',
  },
  {
    id: 'entry-010',
    date: '2026-05-29',
    foods_consumed: ['Quinoa bowl', 'Roasted vegetables', 'Tahini dressing', 'Sparkling water'],
    symptoms: ['None'],
    intensity: 1,
    general_state: 'good',
    notes: 'Great day. Quinoa seems to work well.',
  },
  {
    id: 'entry-011',
    date: '2026-05-28',
    foods_consumed: ['Beef steak', 'Steamed broccoli', 'Olive oil', 'Herbal tea'],
    symptoms: ['None'],
    intensity: 1,
    general_state: 'good',
    notes: '',
  },
  {
    id: 'entry-012',
    date: '2026-05-27',
    foods_consumed: ['Soy latte (mistake)', 'GF muffin', 'Chicken wrap (GF)'],
    symptoms: ['Bloating', 'Gas', 'Abdominal cramps'],
    intensity: 7,
    general_state: 'bad',
    notes: 'Forgot to specify no soy in coffee. Reaction within 30 minutes.',
  },
];
