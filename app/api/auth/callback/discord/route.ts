import { NextResponse } from "next/server"
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server"
import { SUPER_ADMIN_DISCORD_ID } from "@/lib/config"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createSupabaseRouteHandlerClient()
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error("Discord OAuth error:", sessionError)
      requestUrl.pathname = "/auth/error"
      requestUrl.searchParams.set("message", sessionError.message)
      requestUrl.searchParams.delete("code")
      return NextResponse.redirect(requestUrl)
    }

    if (sessionData?.user) {
      const { id, email, user_metadata } = sessionData.user
      const discord_id = user_metadata?.provider_id || user_metadata?.sub
      const username = user_metadata?.user_name || user_metadata?.full_name || user_metadata?.preferred_username
      const avatar_url = user_metadata?.avatar_url
      const discriminator = user_metadata?.discriminator

      console.log("Discord user data:", { discord_id, username, email })

      if (discord_id && username) {
        const isSuperAdmin = discord_id === SUPER_ADMIN_DISCORD_ID

        const userData: any = {
          id: id,
          discord_id: discord_id,
          username: username,
          discriminator: discriminator,
          avatar_url: avatar_url,
          email: email,
        }

        // Force super admin role
        if (isSuperAdmin) {
          userData.role = "admin"
          userData.is_blocked = false
          console.log("Super admin detected, setting role to admin")
        }

        const { error: upsertError } = await supabase.from("users").upsert(userData, {
          onConflict: "discord_id",
          ignoreDuplicates: false,
        })

        if (upsertError) {
          console.error("Error upserting user profile:", upsertError)
        } else {
          console.log("User profile upserted successfully")
        }

        // Ensure user preferences exist
        const { error: prefError } = await supabase
          .from("user_preferences")
          .upsert({ user_id: id }, { onConflict: "user_id" })

        if (prefError) {
          console.error("Error ensuring user preferences:", prefError)
        }

        // Create welcome notification for new users
        const { error: notifError } = await supabase.from("user_notifications").insert({
          user_id: id,
          title: "Welcome to Webhook Sender!",
          message: "Thanks for joining! Explore the features and discover hidden easter eggs.",
          type: "success",
        })

        if (notifError && !notifError.message.includes("duplicate")) {
          console.error("Error creating welcome notification:", notifError)
        }
      }
    }
  }

  // Clean redirect
  requestUrl.pathname = "/"
  requestUrl.searchParams.delete("code")
  requestUrl.searchParams.delete("state")
  return NextResponse.redirect(requestUrl)
}