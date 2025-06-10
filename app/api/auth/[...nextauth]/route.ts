import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import type { NextAuthOptions } from "next-auth"

// Конфигурация для разработки (замените на ваши реальные значения)
const DISCORD_CONFIG = {
  clientId: process.env.DISCORD_CLIENT_ID || "1381647541610741891",
  clientSecret: process.env.DISCORD_CLIENT_SECRET || "nqxh4mOMZOx5xmFXBKDdfsDUy0VUk7JO",
  nextAuthSecret: process.env.NEXTAUTH_SECRET || "00110022003300440055",
  nextAuthUrl: process.env.NEXTAUTH_URL || "https://web-github-io-two.vercel.app/api/auth/callback/discord",
}

const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: DISCORD_CONFIG.clientId,
      clientSecret: DISCORD_CONFIG.clientSecret,
      authorization: {
        params: {
          scope: "identify email",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.discordId = profile.id
        token.username = profile.username
        token.discriminator = profile.discriminator || "0000"
        token.avatar = profile.avatar
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.discordId = token.discordId as string
        session.user.username = token.username as string
        session.user.discriminator = token.discriminator as string
        session.user.avatar = token.avatar as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  session: {
    strategy: "jwt",
  },
  secret: DISCORD_CONFIG.nextAuthSecret,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
