import type React from "react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ShieldAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/?error=unauthorized&message=Please login to access the admin panel.")
  }

  const { data: profile, error: profileError } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (profileError || !profile || profile.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Alert variant="destructive" className="max-w-lg">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access this page. Only administrators can view this content. If you believe
            this is an error, please contact support.
          </AlertDescription>
        </Alert>
        <Button asChild variant="link" className="mt-4">
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users and view application statistics.</p>
      </header>
      {/* Add Admin specific navigation here if needed, e.g. Tabs for Users, Stats, Settings */}
      <nav className="mb-6 border-b">
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            asChild
            className={
              typeof window !== "undefined" && window.location.pathname === "/admin"
                ? "font-semibold border-b-2 border-primary"
                : ""
            }
          >
            <Link href="/admin">Dashboard</Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className={
              typeof window !== "undefined" && window.location.pathname.startsWith("/admin/users")
                ? "font-semibold border-b-2 border-primary"
                : ""
            }
          >
            <Link href="/admin/users">User Management</Link>
          </Button>
          {/* Add more admin nav links here */}
        </div>
      </nav>
      {children}
    </div>
  )
}