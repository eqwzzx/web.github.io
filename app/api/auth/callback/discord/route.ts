// Route to handle Discord OAuth callback
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
      requestUrl.pathname = "/auth/error"
      requestUrl.searchParams.set("message", sessionError.message)
      requestUrl.searchParams.delete("code") // Удаляем код из URL при ошибке
      return NextResponse.redirect(requestUrl)
    }

    // Super Admin Logic & User Profile Upsert
    if (sessionData?.user) {
      const { id, email, user_metadata } = sessionData.user
      const discord_id = user_metadata?.provider_id
      const username = user_metadata?.user_name || user_metadata?.full_name
      const avatar_url = user_metadata?.avatar_url

      if (discord_id && username) {
        const isSuperAdmin = discord_id === SUPER_ADMIN_DISCORD_ID

        const userData: any = {
          id: id,
          discord_id: discord_id,
          username: username,
          avatar_url: avatar_url,
          email: email,
        }

        if (isSuperAdmin) {
          userData.role = "admin"
          userData.is_blocked = false // Супер-админ не может быть заблокирован
        }

        const { error: upsertError } = await supabase.from("users").upsert(userData, { onConflict: "discord_id" })

        if (upsertError) {
          console.error("Error upserting user profile:", upsertError)
        }
      }
    }
  }

  // Перенаправляем на главную страницу, очищая URL от параметра 'code'
  requestUrl.pathname = "/"
  requestUrl.searchParams.delete("code")
  return NextResponse.redirect(requestUrl)
}