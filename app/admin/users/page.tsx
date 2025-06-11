import UserManagementClient from "@/components/admin/user-management-client"
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server"

async function getUsers() {
  const supabaseAdmin = await createSupabaseServiceRoleClient()
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, discord_id, username, email, role, is_blocked, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }
  return data
}

export default async function UserManagementPage() {
  const users = await getUsers()

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>
      <UserManagementClient initialUsers={users} />
    </div>
  )
}