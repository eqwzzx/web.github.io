-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked);

CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_sent_at ON webhooks(sent_at);
CREATE INDEX IF NOT EXISTS idx_webhooks_status ON webhooks(status);
CREATE INDEX IF NOT EXISTS idx_webhooks_scheduled_for ON webhooks(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_webhook_configs_user_id ON webhook_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_is_favorite ON webhook_configs(is_favorite);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

CREATE INDEX IF NOT EXISTS idx_webhook_analytics_user_id ON webhook_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_analytics_webhook_id ON webhook_analytics(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_analytics_event_type ON webhook_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_analytics_created_at ON webhook_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_webhook_templates_user_id ON webhook_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_templates_category ON webhook_templates(category);
CREATE INDEX IF NOT EXISTS idx_webhook_templates_is_public ON webhook_templates(is_public);