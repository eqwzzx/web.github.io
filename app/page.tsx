"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  MessageSquare,
  Shield,
  Settings,
  Send,
  History,
  BarChart3,
  Zap,
  CheckCircle,
  TrendingUp,
  Calendar,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalWebhooks: 0,
    todayWebhooks: 0,
    successRate: 0,
    thisWeekWebhooks: 0,
    thisMonthWebhooks: 0,
    averagePerDay: 0,
  })

  useEffect(() => {
    // Check for session first, then fallback to localStorage
    if (session?.user) {
      const userData = {
        id: session.user.discordId,
        username: session.user.username,
        discriminator: session.user.discriminator,
        avatar: session.user.avatar
          ? `https://cdn.discordapp.com/avatars/${session.user.discordId}/${session.user.avatar}.png`
          : "/placeholder.svg?height=24&width=24",
        isAdmin: session.user.discordId === "808641359006400512",
      }

      // Check if user is blocked
      const blockedUsers = JSON.parse(localStorage.getItem("blocked_users") || "[]")
      if (blockedUsers.includes(userData.id)) {
        // User is blocked, don't set user data
        return
      }

      setUser(userData)
      localStorage.setItem("discord_user", JSON.stringify(userData))
    } else {
      // Fallback to localStorage for demo mode
      const userData = localStorage.getItem("discord_user")
      if (userData) {
        const parsedUser = JSON.parse(userData)
        // Check if user is blocked
        const blockedUsers = JSON.parse(localStorage.getItem("blocked_users") || "[]")
        if (blockedUsers.includes(parsedUser.id)) {
          // User is blocked, don't set user data
          return
        }
        setUser(parsedUser)
      }
    }
  }, [session])

  useEffect(() => {
    if (user) {
      loadUserStats()
    }
  }, [user])

  const loadUserStats = () => {
    const history = localStorage.getItem("webhook_history")
    const userStats = localStorage.getItem(`user_stats_${user.id}`)

    let webhooks = []
    let savedStats = {
      totalWebhooks: 0,
      todayWebhooks: 0,
      successRate: 0,
      thisWeekWebhooks: 0,
      thisMonthWebhooks: 0,
      averagePerDay: 0,
      firstWebhookDate: null,
    }

    if (history) {
      webhooks = JSON.parse(history)
    }

    if (userStats) {
      savedStats = { ...savedStats, ...JSON.parse(userStats) }
    }

    const now = new Date()
    const today = now.toDateString()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const todayWebhooks = webhooks.filter((w) => new Date(w.timestamp).toDateString() === today)
    const thisWeekWebhooks = webhooks.filter((w) => new Date(w.timestamp) >= weekAgo)
    const thisMonthWebhooks = webhooks.filter((w) => new Date(w.timestamp) >= monthAgo)
    const successfulWebhooks = webhooks.filter((w) => w.status === "success")

    // Calculate average per day
    const firstWebhook = webhooks.length > 0 ? new Date(webhooks[webhooks.length - 1].timestamp) : new Date()
    const daysSinceFirst = Math.max(1, Math.ceil((now.getTime() - firstWebhook.getTime()) / (1000 * 60 * 60 * 24)))
    const averagePerDay = webhooks.length > 0 ? (webhooks.length / daysSinceFirst).toFixed(1) : 0

    const newStats = {
      totalWebhooks: webhooks.length,
      todayWebhooks: todayWebhooks.length,
      thisWeekWebhooks: thisWeekWebhooks.length,
      thisMonthWebhooks: thisMonthWebhooks.length,
      successRate: webhooks.length > 0 ? Math.round((successfulWebhooks.length / webhooks.length) * 100) : 0,
      averagePerDay: Number.parseFloat(averagePerDay),
      firstWebhookDate: webhooks.length > 0 ? firstWebhook.toISOString() : null,
    }

    setStats(newStats)

    // Save updated stats
    localStorage.setItem(`user_stats_${user.id}`, JSON.stringify(newStats))
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

  // Render different content for logged in users
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discord Webhook Manager</h1>
              </div>

              <nav className="flex items-center space-x-4">
                <ThemeToggle />
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                {(user.id === "808641359006400512" || user.isAdmin) && (
                  <Link href="/admin">
                    <Button variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <img
                    src={user.avatar || "/placeholder.svg?height=24&width=24"}
                    alt={user.username}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</span>
                  {user.isAdmin && (
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content for Logged In Users */}
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {user.username}!</h2>
            <p className="text-gray-600 dark:text-gray-400">Here's your webhook activity overview</p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Webhooks</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalWebhooks}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stats.averagePerDay}/day avg</p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.thisWeekWebhooks}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stats.todayWebhooks} today</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {stats.thisMonthWebhooks} this month
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">Active</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">All systems operational</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/dashboard?tab=send">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Send Webhook</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">Quickly</p>
                    </div>
                    <Send className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard?tab=history">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Webhook History</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">View</p>
                    </div>
                    <History className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard?tab=settings">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Settings</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">Manage</p>
                    </div>
                    <Settings className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard?tab=analytics">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Analytics</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">Track</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // Render different content for guests
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discord Webhook Manager</h1>
            </div>

            <nav className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/auth">
                <Button variant="outline">Login</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content for Guests */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Discord Webhook Manager</h2>
          <p className="text-gray-600 dark:text-gray-400">Please log in to manage your webhooks</p>
        </div>

        {/* Quick Actions for Guests */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/auth">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Send Webhook</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">Quickly</p>
                  </div>
                  <Send className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/auth">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Webhook History</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">View</p>
                  </div>
                  <History className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/auth">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Settings</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">Manage</p>
                  </div>
                  <Settings className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/auth">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Analytics</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">Track</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}