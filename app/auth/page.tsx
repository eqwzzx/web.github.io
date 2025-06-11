"use client"

import { useState, useEffect } from "react"
import { signIn, useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft, MessageSquare, AlertCircle, Copy, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [showSetup, setShowSetup] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  // Check for OAuth errors in URL
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      switch (errorParam) {
        case "Configuration":
          setError("OAuth configuration error. Please check your Discord app settings.")
          setShowSetup(true)
          break
        case "AccessDenied":
          setError("Access denied. You cancelled the Discord authorization.")
          break
        case "Verification":
          setError("Verification error. Please try again.")
          break
        default:
          setError(`Authentication error: ${errorParam}`)
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Store user data in localStorage for compatibility with existing code
      const userData = {
        id: session.user.discordId,
        username: session.user.username,
        discriminator: session.user.discriminator,
        avatar: session.user.avatar
          ? `https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.avatar}.png`
          : "/placeholder.svg?height=32&width=32",
        isAdmin: session.user.discordId === "808641359006400512",
      }

      localStorage.setItem("discord_user", JSON.stringify(userData))
      router.push("/")
    }
  }, [session, status, router])

  const handleDiscordLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("discord", {
        redirect: false,
        callbackUrl: "/",
      })

      if (result?.error) {
        setError("Failed to authenticate with Discord. Please check your app configuration.")
        setShowSetup(true)
        setIsLoading(false)
      }
      // Don't set loading to false here - let the useEffect handle the redirect
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    if (!username.trim()) return

    const demoUser = {
      id: username === "admin" ? "808641359006400512" : Date.now().toString(),
      username: username,
      discriminator: "0000",
      avatar: "/placeholder.svg?height=32&width=32",
      isAdmin: username === "admin",
    }

    localStorage.setItem("discord_user", JSON.stringify(demoUser))
    router.push("/")
  }

  const handleCompleteLogout = async () => {
    // Clear all localStorage
    localStorage.removeItem("discord_user")
    localStorage.removeItem("webhook_history")
    localStorage.removeItem("admin_users")

    // Sign out from NextAuth if session exists
    if (session) {
      await signOut({ redirect: false })
    }

    // Clear URL parameters
    router.replace("/auth")
    setError("")
    setShowSetup(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="text-center">
            <MessageSquare className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <CardTitle className="text-2xl dark:text-white">Sign In</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Connect with Discord to manage your webhooks
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            {!demoMode ? (
              <>
                <Button
                  onClick={handleDiscordLogin}
                  disabled={isLoading}
                  className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
                  size="lg"
                >
                  {isLoading ? (
                    "Connecting..."
                  ) : (
                    <>
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                      Continue with Discord
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or</span>
                  </div>
                </div>

                <Button onClick={() => setDemoMode(true)} variant="outline" className="w-full">
                  Demo Mode (No Discord Required)
                </Button>

                {!showSetup && (
                  <Button onClick={() => setShowSetup(true)} variant="ghost" className="w-full text-sm">
                    Need help setting up Discord OAuth?
                  </Button>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="dark:text-white">
                    Demo Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="Enter username (use 'admin' for admin access)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <Button onClick={handleDemoLogin} disabled={!username.trim()} className="w-full">
                  Enter Demo
                </Button>
                <Button onClick={() => setDemoMode(false)} variant="outline" className="w-full">
                  Back to Discord Login
                </Button>
              </div>
            )}

            {(session || error) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={handleCompleteLogout} variant="outline" className="w-full">
                  Clear Session & Retry
                </Button>
              </div>
            )}

            <div className="text-center">
              <Link href="/">
                <Button variant="ghost" className="text-gray-600 dark:text-gray-400">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        {showSetup && (
          <Card className="mt-4 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg dark:text-white flex items-center">
                <ExternalLink className="mr-2 h-5 w-5" />
                Discord OAuth Setup
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Follow these steps to set up Discord authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Step 1: Create Discord App</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                    Go to Discord Developer Portal and create a new application
                  </p>
                  <Button
                    onClick={() => window.open("https://discord.com/developers/applications", "_blank")}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Discord Developer Portal
                  </Button>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Step 2: Configure OAuth2</h4>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-2">
                    In your Discord app, go to OAuth2 → General and add this redirect URI:
                  </p>
                  <div className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-700 rounded border">
                    <code className="text-sm flex-1">http://localhost:3000/api/auth/callback/discord</code>
                    <Button
                      onClick={() => copyToClipboard("http://localhost:3000/api/auth/callback/discord")}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">Step 3: Update Code</h4>
                  <p className="text-sm text-purple-800 dark:text-purple-300 mb-2">
                    Replace these values in <code>app/api/auth/[...nextauth]/route.ts</code>:
                  </p>
                  <div className="space-y-2">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded border">
                      <div className="flex items-center justify-between">
                        <code className="text-sm">clientId: "YOUR_DISCORD_CLIENT_ID_HERE"</code>
                        <Button
                          onClick={() => copyToClipboard("YOUR_DISCORD_CLIENT_ID_HERE")}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-700 rounded border">
                      <div className="flex items-center justify-between">
                        <code className="text-sm">clientSecret: "YOUR_DISCORD_CLIENT_SECRET_HERE"</code>
                        <Button
                          onClick={() => copyToClipboard("YOUR_DISCORD_CLIENT_SECRET_HERE")}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h4 className="font-medium text-orange-900 dark:text-orange-200 mb-2">Alternative: Use Demo Mode</h4>
                  <p className="text-sm text-orange-800 dark:text-orange-300">
                    If you don't want to set up Discord OAuth right now, you can use Demo Mode to test the application.
                  </p>
                </div>
              </div>

              <Button onClick={() => setShowSetup(false)} variant="outline" className="w-full">
                Hide Setup Instructions
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}