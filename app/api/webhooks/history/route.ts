import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getUserWebhooks, getUserByDiscordId } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.discordId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByDiscordId(session.user.discordId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    let webhooks = await getUserWebhooks(user.id, limit, offset)

    // Apply filters
    if (status && status !== "all") {
      webhooks = webhooks.filter((w) => w.status === status)
    }

    if (search) {
      webhooks = webhooks.filter(
        (w) =>
          w.message.toLowerCase().includes(search.toLowerCase()) ||
          w.username.toLowerCase().includes(search.toLowerCase()),
      )
    }

    return NextResponse.json({ webhooks })
  } catch (error) {
    console.error("Get webhooks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}