import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, BarChart3 } from "lucide-react"
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server" // Use service role for aggregate counts

export default async function AdminDashboardPage() {
  const supabaseAdmin = await createSupabaseServiceRoleClient() // Use with caution

  const { count: totalUsers, error: usersError } = await supabaseAdmin
    .from("users")
    .select("*", { count: "exact", head: true })

  const { count: totalWebhooksSent, error: webhooksError } = await supabaseAdmin
    .from("webhook_sends")
    .select("*", { count: "exact", head: true })

  // More stats can be added here, e.g., active users in last 24h, most active webhook URLs etc.

  if (usersError) console.error("Error fetching total users:", usersError.message)
  if (webhooksError) console.error("Error fetching total webhooks sent:", webhooksError.message)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers ?? "N/A"}</div>
            <p className="text-xs text-muted-foreground">Registered users in the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhooks Sent</CardTitle>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWebhooksSent ?? "N/A"}</div>
            <p className="text-xs text-muted-foreground">Total webhooks processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">More Stats (Placeholder)</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Coming Soon</div>
            <p className="text-xs text-muted-foreground">Detailed analytics will be here</p>
          </CardContent>
        </Card>
      </div>
      {/* Placeholder for charts or more detailed stats */}
    </div>
  )
}