// API route for updating a specific user (e.g., role, blocked status)
import { NextResponse } from "next/server"
import { createSupabaseRouteHandlerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server"
import { SUPER_ADMIN_DISCORD_ID } from "@/lib/config"

export async function PUT(request: Request, { params }: { params: { userId: string } }) {
  const supabase = createSupabaseRouteHandlerClient() // For checking admin's auth
  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser()

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if the authenticated user is an admin
  const { data: adminProfile } = await supabase.from("users").select("role").eq("id", adminUser.id).single()

  if (!adminProfile || adminProfile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 })
  }

  const targetUserId = params.userId

  // Prevent modification of the super admin
  const supabaseAdmin = await createSupabaseServiceRoleClient()
  const { data: targetUser, error: targetUserError } = await supabaseAdmin
    .from("users")
    .select("discord_id")
    .eq("id", targetUserId)
    .single()

  if (targetUserError) {
    // Don't expose detailed error, just say it's forbidden or not found
    return NextResponse.json({ error: "Operation not allowed or user not found." }, { status: 403 })
  }

  if (targetUser.discord_id === SUPER_ADMIN_DISCORD_ID) {
    return NextResponse.json({ error: "This user's status cannot be modified." }, { status: 403 })
  }

  const { role, is_blocked } = await request.json()

  if (typeof role !== "string" || (role !== "user" && role !== "admin")) {
    return NextResponse.json({ error: "Invalid role specified" }, { status: 400 })
  }
  if (typeof is_blocked !== "boolean") {
    return NextResponse.json({ error: "Invalid blocked status specified" }, { status: 400 })
  }

  // Use service role client to update user data, as RLS might prevent direct updates by another admin
  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ role, is_blocked })
    .eq("id", targetUserId)
    .select()
    .single()

  if (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 })
  }

  return NextResponse.json(data)
}