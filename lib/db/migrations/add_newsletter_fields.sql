-- Migration: add newsletter consent fields to users table
-- Run once against your PostgreSQL database.

ALTER TABLE users ADD COLUMN IF NOT EXISTS newsletter_opt_in boolean;
ALTER TABLE users ADD COLUMN IF NOT EXISTS newsletter_consent_at text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS newsletter_consent_source text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS language text;
