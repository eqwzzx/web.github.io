import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.DATABASE_URL)

export { sql }

// Database helper functions
export async function createUser(userData: {
  discordId: string
  username: string
  discriminator?: string
  avatar?: string
  email?: string
}) {
  const result = await sql`
    INSERT INTO users (discord_id, username, discriminator, avatar, email)
    VALUES (${userData.discordId}, ${userData.username}, ${userData.discriminator || "0000"}, ${userData.avatar}, ${userData.email})
    ON CONFLICT (discord_id) DO UPDATE SET
      username = EXCLUDED.username,
      discriminator = EXCLUDED.discriminator,
      avatar = EXCLUDED.avatar,
      email = EXCLUDED.email,
      last_login = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  return result[0]
}

export async function getUserByDiscordId(discordId: string) {
  const result = await sql`
    SELECT u.*, us.* FROM users u
    LEFT JOIN user_settings us ON u.id = us.user_id
    WHERE u.discord_id = ${discordId}
  `
  return result[0]
}

export async function updateUserStats(userId: number, webhookCount: number) {
  await sql`
    UPDATE users 
    SET webhook_count = ${webhookCount}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${userId}
  `
}

export async function createWebhook(webhookData: {
  userId: number
  webhookUrl: string
  message: string
  username?: string
  avatarUrl?: string
  embedTitle?: string
  embedDescription?: string
  embedColor?: string
  embedFields?: any
  status: string
  statusCode?: number
  errorMessage?: string
  scheduledFor?: Date
  repeatType?: string
}) {
  const result = await sql`
    INSERT INTO webhooks (
      user_id, webhook_url, message, username, avatar_url,
      embed_title, embed_description, embed_color, embed_fields,
      status, status_code, error_message, scheduled_for, repeat_type
    ) VALUES (
      ${webhookData.userId}, ${webhookData.webhookUrl}, ${webhookData.message},
      ${webhookData.username}, ${webhookData.avatarUrl}, ${webhookData.embedTitle},
      ${webhookData.embedDescription}, ${webhookData.embedColor}, 
      ${JSON.stringify(webhookData.embedFields)}, ${webhookData.status},
      ${webhookData.statusCode}, ${webhookData.errorMessage}, 
      ${webhookData.scheduledFor}, ${webhookData.repeatType}
    ) RETURNING *
  `
  return result[0]
}

export async function getUserWebhooks(userId: number, limit = 50, offset = 0) {
  const result = await sql`
    SELECT * FROM webhooks 
    WHERE user_id = ${userId}
    ORDER BY sent_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `
  return result
}

export async function saveWebhookConfig(configData: {
  userId: number
  name: string
  config: any
  isFavorite?: boolean
}) {
  const result = await sql`
    INSERT INTO webhook_configs (user_id, name, config, is_favorite)
    VALUES (${configData.userId}, ${configData.name}, ${JSON.stringify(configData.config)}, ${configData.isFavorite || false})
    RETURNING *
  `
  return result[0]
}

export async function getUserConfigs(userId: number) {
  const result = await sql`
    SELECT * FROM webhook_configs 
    WHERE user_id = ${userId}
    ORDER BY is_favorite DESC, created_at DESC
  `
  return result
}

export async function logActivity(activityData: {
  userId: number
  action: string
  description: string
  details?: any
  ipAddress?: string
  userAgent?: string
}) {
  await sql`
    INSERT INTO activity_logs (user_id, action, description, details, ip_address, user_agent)
    VALUES (${activityData.userId}, ${activityData.action}, ${activityData.description}, 
            ${JSON.stringify(activityData.details)}, ${activityData.ipAddress}, ${activityData.userAgent})
  `
}

export async function getUserActivityLogs(userId: number, limit = 100) {
  const result = await sql`
    SELECT * FROM activity_logs 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return result
}

export async function getWebhookAnalytics(userId: number, days = 30) {
  const result = await sql`
    SELECT 
      DATE(created_at) as date,
      event_type,
      COUNT(*) as count
    FROM webhook_analytics 
    WHERE user_id = ${userId} 
      AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
    GROUP BY DATE(created_at), event_type
    ORDER BY date DESC
  `
  return result
}

export async function getPublicTemplates(category?: string) {
  const result = category
    ? await sql`
        SELECT wt.*, u.username as author_username 
        FROM webhook_templates wt
        JOIN users u ON wt.user_id = u.id
        WHERE wt.is_public = TRUE AND wt.category = ${category}
        ORDER BY wt.usage_count DESC, wt.created_at DESC
      `
    : await sql`
        SELECT wt.*, u.username as author_username 
        FROM webhook_templates wt
        JOIN users u ON wt.user_id = u.id
        WHERE wt.is_public = TRUE
        ORDER BY wt.usage_count DESC, wt.created_at DESC
      `
  return result
}

export async function getUserSettings(userId: number) {
  const result = await sql`
    SELECT * FROM user_settings WHERE user_id = ${userId}
  `
  return result[0]
}

export async function updateUserSettings(userId: number, settings: any) {
  const result = await sql`
    INSERT INTO user_settings (user_id, theme, notifications_enabled, email_notifications, 
                              webhook_limit, rate_limit, timezone, language, settings)
    VALUES (${userId}, ${settings.theme}, ${settings.notificationsEnabled}, ${settings.emailNotifications},
            ${settings.webhookLimit}, ${settings.rateLimit}, ${settings.timezone}, ${settings.language}, 
            ${JSON.stringify(settings.customSettings)})
    ON CONFLICT (user_id) DO UPDATE SET
      theme = EXCLUDED.theme,
      notifications_enabled = EXCLUDED.notifications_enabled,
      email_notifications = EXCLUDED.email_notifications,
      webhook_limit = EXCLUDED.webhook_limit,
      rate_limit = EXCLUDED.rate_limit,
      timezone = EXCLUDED.timezone,
      language = EXCLUDED.language,
      settings = EXCLUDED.settings,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `
  return result[0]
}