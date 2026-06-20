-- Add status column to users: 'active' (default) or 'suspended'
-- Separates account suspension from email verification
ALTER TABLE users ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Suspended users are those currently with isVerified=false but who WERE verified before
-- (previously deactivated by admin). Email-unverified users stay unverified.
-- For a clean migration, all currently-verified users get status='active' (already default).
-- Previously deactivated users (isVerified=false) can be re-evaluated by admin.
