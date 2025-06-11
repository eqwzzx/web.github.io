"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { createSupabaseBrowserClient } from "@/lib/supabase/client";
// import { useUser } from "@/contexts/user-context"; // If you have a user context

export default function ThemeSwitcher() {
  const { setTheme, theme, themes } = useTheme()
  // const supabase = createSupabaseBrowserClient();
  // const { user } = useUser(); // Assuming you have a context providing the user

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme)
    // if (user) {
    //   // Persist theme to database for logged-in user
    //   try {
    //     const { error } = await supabase
    //       .from("user_preferences")
    //       .update({ theme: newTheme })
    //       .eq("user_id", user.id);
    //     if (error) console.error("Error saving theme preference:", error);
    //   } catch (e) {
    //     console.error("Error in handleThemeChange:", e);
    //   }
    // }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((t) => (
          <DropdownMenuItem key={t} onClick={() => handleThemeChange(t)} disabled={theme === t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}