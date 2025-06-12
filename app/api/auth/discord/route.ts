// Route to initiate Discord OAuth flow
import { NextResponse } from "next/server"
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server"
import { DISCORD_SCOPES, APP_URL } from "@/lib/config"

export async function GET() {
  const supabase = createSupabaseRouteHandlerClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      scopes: DISCORD_SCOPES,
      redirectTo: `${APP_URL}/api/auth/callback/discord`, // Supabase handles the callback and then redirects here
    },
  })

  if (error) {
    console.error("Error initiating Discord OAuth:", error)
    return NextResponse.redirect(`${APP_URL}/auth/error?message=${encodeURIComponent(error.message)}`)
  }

  if (data.url) {
    return NextResponse.redirect(data.url) // Redirect to Discord's authorization page
  }

  return NextResponse.redirect(`${APP_URL}/auth/error?message=Could not initiate Discord login.`)
}