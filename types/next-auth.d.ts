import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      discordId: string
      username: string
      discriminator: string
      avatar: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    discordId: string
    username: string
    discriminator: string
    avatar: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId: string
    username: string
    discriminator: string
    avatar: string
  }
}