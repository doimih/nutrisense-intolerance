-- Migration: add recipes, recipe_batches, recipe_usage tables
-- Run once against your PostgreSQL database.

CREATE TABLE IF NOT EXISTS recipes (
  id text PRIMARY KEY,
  title_ro text NOT NULL,
  title_en text NOT NULL,
  category text NOT NULL,
  ingredients_ro jsonb NOT NULL DEFAULT '[]',
  ingredients_en jsonb NOT NULL DEFAULT '[]',
  instructions_ro jsonb NOT NULL DEFAULT '[]',
  instructions_en jsonb NOT NULL DEFAULT '[]',
  prep_time_minutes integer NOT NULL DEFAULT 0,
  difficulty text NOT NULL DEFAULT 'easy',
  calories integer,
  macros jsonb,
  cuisine text,
  tags_ro jsonb,
  tags_en jsonb,
  allergens jsonb,
  substitutions_ro jsonb,
  substitutions_en jsonb,
  cooking_tips_ro jsonb,
  cooking_tips_en jsonb,
  image_url text,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS recipe_batches (
  id serial PRIMARY KEY,
  batch_number integer NOT NULL,
  target_count integer NOT NULL,
  generated_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  started_at text,
  finished_at text
);

CREATE TABLE IF NOT EXISTS recipe_usage (
  id serial PRIMARY KEY,
  recipe_id text NOT NULL,
  user_id text NOT NULL,
  used_at text NOT NULL,
  context text
);

CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipe_usage_user_id ON recipe_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_usage_recipe_id ON recipe_usage(recipe_id);
