import { NextResponse } from "next/server"
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: Request) {
  const supabase = createSupabaseRouteHandlerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { webhookUrl, content, username, avatar_url, embeds } = await request.json()

  if (!webhookUrl || (!content && !embeds?.length)) {
    return NextResponse.json({ error: "Webhook URL and content are required" }, { status: 400 })
  }

  // Validate Webhook URL format
  if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
    return NextResponse.json({ error: "Invalid Discord Webhook URL format" }, { status: 400 })
  }

  const payload: any = {
    content: content,
    username: username,
    avatar_url: avatar_url,
  }

  if (embeds?.length) {
    payload.embeds = embeds
  }

  let sendStatus = "failure"
  let errorMessage: string | null = null

  try {
    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!discordResponse.ok) {
      const errorBody = await discordResponse.text()
      console.error(`Discord API Error (${discordResponse.status}): ${errorBody}`)
      errorMessage = `Discord API Error (${discordResponse.status}): ${errorBody.substring(0, 200)}`
      return NextResponse.json({ error: errorMessage }, { status: discordResponse.status })
    }
    sendStatus = "success"
  } catch (error: any) {
    console.error("Failed to send webhook:", error)
    errorMessage = error.message || "An unknown error occurred while sending the webhook."
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  } finally {
    // Log the send attempt with enhanced data
    try {
      const webhookUrlHash = crypto.createHash("sha256").update(webhookUrl).digest("hex")
      await supabase.from("webhook_sends").insert({
        user_id: user.id,
        webhook_url_hash: webhookUrlHash,
        status: sendStatus,
        error_message: errorMessage,
        embed_data: embeds?.length ? embeds[0] : null,
      })
    } catch (dbError) {
      console.error("Failed to log webhook send:", dbError)
    }
  }

  return NextResponse.json({ message: "Webhook sent successfully" })
}