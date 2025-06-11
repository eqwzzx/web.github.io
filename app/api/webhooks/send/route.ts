import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createWebhook, getUserByDiscordId, logActivity, updateUserStats } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.discordId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserByDiscordId(session.user.discordId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.is_blocked) {
      return NextResponse.json({ error: "User is blocked" }, { status: 403 })
    }

    const body = await request.json()
    const {
      webhookUrl,
      message,
      username,
      avatarUrl,
      embedTitle,
      embedDescription,
      embedColor,
      embedFields,
      embedThumbnail,
      embedImage,
      embedFooter,
      embedAuthor,
      embedUrl,
    } = body

    if (!webhookUrl || !message) {
      return NextResponse.json({ error: "Webhook URL and message are required" }, { status: 400 })
    }

    // Rate limiting check
    const userSettings = user.webhook_limit || 100
    if (user.webhook_count >= userSettings) {
      return NextResponse.json({ error: "Webhook limit exceeded" }, { status: 429 })
    }

    // Build embed
    const embed = {
      title: embedTitle || undefined,
      description: embedDescription || message,
      color: embedColor ? Number.parseInt(embedColor.replace("#", ""), 16) : undefined,
      timestamp: new Date().toISOString(),
      footer: {
        text: embedFooter || `Sent by ${user.username}`,
      },
      author: embedAuthor ? { name: embedAuthor } : undefined,
      thumbnail: embedThumbnail ? { url: embedThumbnail } : undefined,
      image: embedImage ? { url: embedImage } : undefined,
      url: embedUrl || undefined,
      fields: embedFields?.filter((f: any) => f.name && f.value) || undefined,
    }

    const payload = {
      content: message,
      username: username || user.username,
      avatar_url: avatarUrl || undefined,
      embeds: [embed],
    }

    // Send webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const status = response.ok ? "success" : "failed"
    const errorMessage = response.ok ? null : await response.text()

    // Save to database
    const webhookRecord = await createWebhook({
      userId: user.id,
      webhookUrl,
      message,
      username: username || user.username,
      avatarUrl,
      embedTitle,
      embedDescription,
      embedColor,
      embedFields,
      status,
      statusCode: response.status,
      errorMessage,
    })

    // Update user stats
    await updateUserStats(user.id, user.webhook_count + 1)

    // Log activity
    await logActivity({
      userId: user.id,
      action: "webhook_sent",
      description: `Sent webhook: ${message.substring(0, 50)}...`,
      details: { webhookId: webhookRecord.id, status: response.status },
      ipAddress: request.ip,
      userAgent: request.headers.get("user-agent"),
    })

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      webhookId: webhookRecord.id,
      message: response.ok ? "Webhook sent successfully" : `Failed: ${response.status} ${response.statusText}`,
    })
  } catch (error) {
    console.error("Webhook send error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}