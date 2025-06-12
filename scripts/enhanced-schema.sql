-- Enhanced schema with new features
-- Add new tables for enhanced functionality

-- Webhook templates for users
CREATE TABLE IF NOT EXISTS webhook_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    webhook_url TEXT NOT NULL,
    content TEXT,
    username TEXT,
    avatar_url TEXT,
    embed_data JSONB, -- Store embed configuration
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User notifications
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' NOT NULL, -- 'info', 'success', 'warning', 'error'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Easter egg discoveries
CREATE TABLE IF NOT EXISTS easter_egg_discoveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    egg_id TEXT NOT NULL,
    discovered_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, egg_id)
);

-- User activity logs
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_templates_user_id ON webhook_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_easter_egg_discoveries_user_id ON easter_egg_discoveries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);

-- Triggers for updated_at
CREATE TRIGGER set_webhook_templates_updated_at
BEFORE UPDATE ON webhook_templates
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enhanced webhook_sends table with more details
ALTER TABLE webhook_sends ADD COLUMN IF NOT EXISTS embed_data JSONB;
ALTER TABLE webhook_sends ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES webhook_templates(id) ON DELETE SET NULL;