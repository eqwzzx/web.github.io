export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://v0-discord-webhook-app-seven.vercel.app"

export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1381647541610741891"
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "mGFi6xGTcUWNln4gefZDjG6duDWUcvFi"
export const DISCORD_REDIRECT_URI = `${APP_URL}/api/auth/callback/discord`
export const DISCORD_SCOPES = ["identify", "email"].join(" ") // 'email' is optional

export const SUPER_ADMIN_DISCORD_ID = "808641359006400512"