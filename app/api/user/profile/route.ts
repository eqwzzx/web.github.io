import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createUser, getUserByDiscordId } from "@/lib/database"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.discordId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let user = await getUserByDiscordId(session.user.discordId)

    if (!user) {
      // Create user if doesn't exist
      user = await createUser({
        discordId: session.user.discordId,
        username: session.user.username,
        discriminator: session.user.discriminator,
        avatar: session.user.avatar,
        email: session.user.email,
      })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.discordId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByDiscordId(session.user.discordId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updates = await request.json()

    // Update user profile logic here
    // For now, just return success

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update user profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}