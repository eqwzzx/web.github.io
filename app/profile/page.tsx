import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, MessageSquare, Trophy, Zap } from "lucide-react"

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/?error=unauthorized")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  const { count: webhookCount } = await supabase
    .from("webhook_sends")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: easterEggCount } = await supabase
    .from("easter_egg_discoveries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
          <AvatarFallback className="text-xl">{profile?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{profile?.username || "User"}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant={profile?.role === "admin" ? "default" : "secondary"} className="text-xs">
              {profile?.role === "admin" ? "Administrator" : "User"}
            </Badge>
            {profile?.discord_id === "808641359006400512" && (
              <Badge variant="destructive" className="text-xs">
                Super Admin
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhooks Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhookCount || 0}</div>
            <p className="text-xs text-muted-foreground">Total messages sent</p>
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Easter Eggs</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{easterEggCount || 0}</div>
            <p className="text-xs text-muted-foreground">Hidden features found</p>
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Join date</p>
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{profile?.is_blocked ? "Blocked" : "Active"}</div>
            <p className="text-xs text-muted-foreground">Account status</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details and statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Discord ID</label>
              <p className="text-sm font-mono bg-muted/30 p-2 rounded">{profile?.discord_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Username</label>
              <p className="text-sm bg-muted/30 p-2 rounded">{profile?.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm bg-muted/30 p-2 rounded">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <p className="text-sm bg-muted/30 p-2 rounded capitalize">{profile?.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}