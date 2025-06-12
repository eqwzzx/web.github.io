-- Enable HTTP extension if not already enabled (for fetching Discord avatar, optional)
-- CREATE EXTENSION IF NOT EXISTS http;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discord_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    discriminator TEXT, -- For older Discord usernames, might be null for newer ones
    avatar_url TEXT,
    email TEXT, -- Requires 'email' scope from Discord
    role TEXT DEFAULT 'user' NOT NULL, -- 'user' or 'admin'
    is_blocked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'system' NOT NULL, -- 'light', 'dark', 'system'
    language VARCHAR(10) DEFAULT 'en' NOT NULL, -- e.g., 'en', 'es'
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Webhook send logs (for statistics)
CREATE TABLE IF NOT EXISTS webhook_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Null if sent anonymously (if allowed)
    webhook_url_hash TEXT, -- Hash of the webhook URL to track unique webhooks without storing the full URL
    status TEXT NOT NULL, -- 'success', 'failure'
    sent_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    error_message TEXT -- If status is 'failure'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_webhook_sends_user_id ON webhook_sends(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_sends_sent_at ON webhook_sends(sent_at);

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for 'updated_at'
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Seed an admin user (replace with actual Discord ID after first login)
-- This is just an example. In a real scenario, you'd promote a user via an admin interface or directly in the DB.
-- INSERT INTO users (discord_id, username, discriminator, role)
-- VALUES ('YOUR_DISCORD_ID_HERE', 'AdminUser', '0000', 'admin')
-- ON CONFLICT (discord_id) DO NOTHING;