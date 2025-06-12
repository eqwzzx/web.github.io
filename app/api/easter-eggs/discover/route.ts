import { NextResponse } from "next/server"
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = createSupabaseRouteHandlerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { eggId } = await request.json()

  if (!eggId) {
    return NextResponse.json({ error: "Easter egg ID is required" }, { status: 400 })
  }

  // Record the discovery
  const { error } = await supabase
    .from("easter_egg_discoveries")
    .upsert({ user_id: user.id, egg_id: eggId }, { onConflict: "user_id,egg_id" })

  if (error) {
    console.error("Error recording easter egg discovery:", error)
    return NextResponse.json({ error: "Failed to record discovery" }, { status: 500 })
  }

  // Create notification
  await supabase.from("user_notifications").insert({
    user_id: user.id,
    title: "🥚 Easter Egg Discovered!",
    message: `You found the "${eggId}" easter egg! Keep exploring for more hidden features.`,
    type: "success",
  })

  return NextResponse.json({ message: "Easter egg discovered!" })
}