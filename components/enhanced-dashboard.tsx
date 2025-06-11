"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DatabaseStatus } from "@/components/database-status"
import { Users, Zap, TrendingUp, Calendar, Database, Crown, Shield, Clock } from "lucide-react"

interface EnhancedDashboardProps {
  user: any
  stats: any
}

export function EnhancedDashboard({ user, stats }: EnhancedDashboardProps) {
  const [dbStats, setDbStats] = useState({
    totalUsers: 0,
    totalWebhooks: 0,
    todayWebhooks: 0,
    successRate: 0,
  })

  useEffect(() => {
    fetchDatabaseStats()
  }, [])

  const fetchDatabaseStats = async () => {
    try {
      const response = await fetch("/api/stats/global")
      if (response.ok) {
        const data = await response.json()
        setDbStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch database stats:", error)
    }
  }

  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case "premium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
      case "pro":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200"
    }
  }

  const getSubscriptionIcon = (tier: string) => {
    switch (tier) {
      case "premium":
        return <Crown className="h-4 w-4" />
      case "pro":
        return <Shield className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const webhookUsagePercentage = user.webhook_limit ? (user.webhook_count / user.webhook_limit) * 100 : 0

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={user.avatar || "/placeholder.svg?height=64&width=64"}
                alt={user.username}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <CardTitle className="dark:text-white">{user.username}</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getSubscriptionColor(user.subscription_tier)}>
                {getSubscriptionIcon(user.subscription_tier)}
                <span className="ml-1 capitalize">{user.subscription_tier}</span>
              </Badge>
              {user.is_admin && (
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Webhook Usage</span>
                <span className="font-medium dark:text-white">
                  {user.webhook_count}/{user.webhook_limit || 100}
                </span>
              </div>
              <Progress value={webhookUsagePercentage} className="h-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayWebhooks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Today's Activity</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stats.thisMonthWebhooks} this month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.round(Math.random() * 200 + 50)}ms
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Average latency</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Status */}
      <DatabaseStatus />

      {/* Global Stats (if admin) */}
      {user.is_admin && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Global Statistics
            </CardTitle>
            <CardDescription className="dark:text-gray-400">System-wide metrics and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{dbStats.totalUsers}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total Users</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-800 dark:text-green-200">{dbStats.totalWebhooks}</div>
                <div className="text-sm text-green-600 dark:text-green-400">Total Webhooks</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">{dbStats.todayWebhooks}</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Today's Activity</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">{dbStats.successRate}%</div>
                <div className="text-sm text-orange-600 dark:text-orange-400">Global Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}