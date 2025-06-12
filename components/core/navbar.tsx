import Link from "next/link"
import { MessageSquareQuote, ShieldCheck } from "lucide-react"
import ThemeSwitcher from "./theme-switcher"
// import LanguageSwitcher from "./language-switcher"; // Conceptual
import UserAvatarDropdown from "@/components/auth/user-avatar-dropdown"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function Navbar() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userRole = null
  if (user) {
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
    userRole = profile?.role
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Увеличиваем горизонтальный отступ контейнера для большего пространства от края */}
      <div className="container flex h-16 items-center px-6 md:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <MessageSquareQuote className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">Webhook Sender</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-4">{/* Add other nav links here if needed */}</nav>
        <div className="flex items-center space-x-2 md:space-x-4">
          {userRole === "admin" && (
            <Link
              href="/admin"
              className="text-sm font-medium hover:text-primary p-2 rounded-md hover:bg-muted"
              title="Admin Panel"
            >
              <ShieldCheck className="h-5 w-5" />
              <span className="sr-only">Admin Panel</span>
            </Link>
          )}
          <ThemeSwitcher />
          {/* <LanguageSwitcher /> */}
          <UserAvatarDropdown user={user} />
        </div>
      </div>
    </header>
  )
}