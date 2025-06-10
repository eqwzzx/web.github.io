import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { discordId } = await request.json()

    if (!discordId) {
      return NextResponse.json({ error: "Discord ID is required" }, { status: 400 })
    }

    // Get blocked users from environment variable (in production, use database)
    const blockedUsersEnv = process.env.BLOCKED_USERS || "[]"
    let blockedUsers: string[] = []

    try {
      blockedUsers = JSON.parse(blockedUsersEnv)
    } catch (error) {
      console.error("Error parsing BLOCKED_USERS:", error)
      blockedUsers = []
    }

    const isBlocked = blockedUsers.includes(discordId)
    const isAdmin = discordId === "808641359006400512"

    return NextResponse.json({
      isBlocked,
      isAdmin,
      status: isBlocked ? "blocked" : "active",
    })
  } catch (error) {
    console.error("Error checking user status:", error)
    return NextResponse.json({ error: "Failed to check user status" }, { status: 500 })
  }
}