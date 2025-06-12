export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://web-github-io-pi.vercel.app/"

export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1381647541610741891"
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "mGFi6xGTcUWNln4gefZDjG6duDWUcvFi"
export const DISCORD_REDIRECT_URI = `${APP_URL}/api/auth/callback/discord`
export const DISCORD_SCOPES = ["identify", "email"].join(" ") // 'email' is optional

export const SUPER_ADMIN_DISCORD_ID = "808641359006400512"

// Easter egg configuration
export const EASTER_EGGS = {
  KONAMI_CODE: "konami",
  DOUBLE_CLICK_LOGO: "logo_double_click",
  SECRET_ROUTE: "secret_route",
  ADMIN_DANCE: "admin_dance",
  WEBHOOK_RAINBOW: "webhook_rainbow",
} as const

// Feature flags
export const FEATURES = {
  EASTER_EGGS: true,
  WEBHOOK_TEMPLATES: true,
  USER_NOTIFICATIONS: true,
  ACTIVITY_LOGGING: true,
  ADVANCED_WEBHOOKS: true,
} as const
