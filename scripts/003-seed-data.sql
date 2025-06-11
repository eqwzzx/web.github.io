-- Insert default admin user (replace with your Discord ID)
INSERT INTO users (discord_id, username, discriminator, is_admin, subscription_tier)
VALUES ('808641359006400512', 'SuperAdmin', '0000', TRUE, 'premium')
ON CONFLICT (discord_id) DO UPDATE SET
    is_admin = TRUE,
    subscription_tier = 'premium',
    updated_at = CURRENT_TIMESTAMP;

-- Insert default webhook templates
INSERT INTO webhook_templates (user_id, name, description, category, config, is_public) VALUES
(1, '📢 Announcement', 'Official announcements and updates', 'announcements', 
 '{"embedTitle": "📢 Important Announcement", "embedDescription": "We have an important update to share with you.", "color": "#5865F2", "embedFields": [{"name": "📅 Date", "value": "", "inline": true}, {"name": "👤 Author", "value": "Team", "inline": true}]}', TRUE),

(1, '🔄 System Update', 'System updates and maintenance notifications', 'system', 
 '{"embedTitle": "🔄 System Update", "embedDescription": "System maintenance has been completed successfully.", "color": "#57F287", "embedFields": [{"name": "⏰ Duration", "value": "30 minutes", "inline": true}, {"name": "✅ Status", "value": "Completed", "inline": true}]}', TRUE),

(1, '🚨 Alert', 'Critical alerts and warnings', 'alerts', 
 '{"embedTitle": "🚨 Critical Alert", "embedDescription": "Immediate attention required.", "color": "#ED4245", "embedFields": [{"name": "🔥 Priority", "value": "High", "inline": true}, {"name": "⚡ Action Required", "value": "Yes", "inline": true}]}', TRUE),

(1, '👋 Welcome', 'Welcome new members', 'community', 
 '{"embedTitle": "👋 Welcome to our community!", "embedDescription": "We are excited to have you here. Feel free to introduce yourself!", "color": "#FEE75C", "embedFields": [{"name": "🎉 Getting Started", "value": "Check out our #rules channel", "inline": false}]}', TRUE),

(1, '🎉 Event', 'Event announcements and reminders', 'events', 
 '{"embedTitle": "🎉 Upcoming Event", "embedDescription": "Join us for an exciting community event!", "color": "#EB459E", "embedFields": [{"name": "📅 Date", "value": "TBD", "inline": true}, {"name": "⏰ Time", "value": "TBD", "inline": true}, {"name": "📍 Location", "value": "Discord Server", "inline": true}]}', TRUE)

ON CONFLICT DO NOTHING;