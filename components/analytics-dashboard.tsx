"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Calendar, Clock, Target, Zap } from "lucide-react"

interface AnalyticsDashboardProps {
  webhookHistory: Array<{
    id: number
    timestamp: string
    status: string
    message: string
    username: string
  }>
}

export function AnalyticsDashboard({ webhookHistory }: AnalyticsDashboardProps) {
  // Calculate analytics data
  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const todayWebhooks = webhookHistory.filter((w) => new Date(w.timestamp).toDateString() === today)
  const yesterdayWebhooks = webhookHistory.filter((w) => new Date(w.timestamp).toDateString() === yesterday)
  const thisWeekWebhooks = webhookHistory.filter((w) => new Date(w.timestamp) >= weekAgo)
  const thisMonthWebhooks = webhookHistory.filter((w) => new Date(w.timestamp) >= monthAgo)
  const successfulWebhooks = webhookHistory.filter((w) => w.status === "success")

  // Calculate hourly distribution for today
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const count = todayWebhooks.filter((w) => new Date(w.timestamp).getHours() === hour).length
    return { hour, count }
  })

  // Calculate daily distribution for this week
  const dailyData = Array.from({ length: 7 }, (_, dayOffset) => {
    const date = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000)
    const count = webhookHistory.filter((w) => new Date(w.timestamp).toDateString() === date.toDateString()).length
    return {
      day: date.toLocaleDateString("en", { weekday: "short" }),
      count,
      date: date.toDateString(),
    }
  }).reverse()

  // Calculate success rate trend
  const successRate =
    webhookHistory.length > 0 ? Math.round((successfulWebhooks.length / webhookHistory.length) * 100) : 0

  const todaySuccessRate =
    todayWebhooks.length > 0
      ? Math.round((todayWebhooks.filter((w) => w.status === "success").length / todayWebhooks.length) * 100)
      : 0

  const yesterdaySuccessRate =
    yesterdayWebhooks.length > 0
      ? Math.round((yesterdayWebhooks.filter((w) => w.status === "success").length / yesterdayWebhooks.length) * 100)
      : 0

  // Calculate growth
  const todayGrowth =
    yesterdayWebhooks.length > 0
      ? Math.round(((todayWebhooks.length - yesterdayWebhooks.length) / yesterdayWebhooks.length) * 100)
      : 0

  const maxHourlyCount = Math.max(...hourlyData.map((d) => d.count), 1)
  const maxDailyCount = Math.max(...dailyData.map((d) => d.count), 1)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today's Activity</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{todayWebhooks.length}</p>
                <div className="flex items-center mt-1">
                  {todayGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-red-600 mr-1 rotate-180" />
                  )}
                  <span className={`text-xs ${todayGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {Math.abs(todayGrowth)}% vs yesterday
                  </span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{successRate}%</p>
                <div className="flex items-center mt-1">
                  <Target className="h-3 w-3 text-purple-600 mr-1" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{todaySuccessRate}% today</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{thisWeekWebhooks.length}</p>
                <div className="flex items-center mt-1">
                  <Zap className="h-3 w-3 text-yellow-600 mr-1" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {(thisWeekWebhooks.length / 7).toFixed(1)} avg/day
                  </span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Peak Hour</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {hourlyData.reduce((max, curr) => (curr.count > max.count ? curr : max), hourlyData[0]).hour}:00
                </p>
                <div className="flex items-center mt-1">
                  <Clock className="h-3 w-3 text-orange-600 mr-1" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.max(...hourlyData.map((d) => d.count))} webhooks
                  </span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Activity Chart */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Today's Hourly Activity</CardTitle>
            <CardDescription className="dark:text-gray-400">Webhook activity by hour for {today}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hourlyData.map((data) => (
                <div key={data.hour} className="flex items-center space-x-3">
                  <div className="w-12 text-sm text-gray-600 dark:text-gray-400">
                    {data.hour.toString().padStart(2, "0")}:00
                  </div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(data.count / maxHourlyCount) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-sm text-gray-600 dark:text-gray-400 text-right">{data.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity Chart */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Weekly Activity</CardTitle>
            <CardDescription className="dark:text-gray-400">Webhook activity for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dailyData.map((data, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-12 text-sm text-gray-600 dark:text-gray-400">{data.day}</div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        data.date === today ? "bg-green-600" : "bg-purple-600"
                      }`}
                      style={{ width: `${(data.count / maxDailyCount) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-sm text-gray-600 dark:text-gray-400 text-right">{data.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Status Distribution</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Breakdown of webhook statuses across all time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">{successfulWebhooks.length}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Successful</div>
              <div className="text-xs text-green-500 dark:text-green-500 mt-1">{successRate}% of total</div>
            </div>

            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                {webhookHistory.filter((w) => w.status === "failed").length}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">Failed</div>
              <div className="text-xs text-red-500 dark:text-red-500 mt-1">
                {webhookHistory.length > 0
                  ? Math.round(
                      (webhookHistory.filter((w) => w.status === "failed").length / webhookHistory.length) * 100,
                    )
                  : 0}
                % of total
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                {webhookHistory.filter((w) => w.status === "error").length}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Errors</div>
              <div className="text-xs text-orange-500 dark:text-orange-500 mt-1">
                {webhookHistory.length > 0
                  ? Math.round(
                      (webhookHistory.filter((w) => w.status === "error").length / webhookHistory.length) * 100,
                    )
                  : 0}
                % of total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Insights */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Activity Insights</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Key insights about your webhook usage patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Usage Patterns</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Most active day:</span>
                  <span className="font-medium dark:text-white">
                    {dailyData.reduce((max, curr) => (curr.count > max.count ? curr : max), dailyData[0]).day}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Average per day:</span>
                  <span className="font-medium dark:text-white">{(thisWeekWebhooks.length / 7).toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Peak hour:</span>
                  <span className="font-medium dark:text-white">
                    {hourlyData.reduce((max, curr) => (curr.count > max.count ? curr : max), hourlyData[0]).hour}:00
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Overall success rate:</span>
                  <Badge variant={successRate >= 90 ? "default" : successRate >= 70 ? "secondary" : "destructive"}>
                    {successRate}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Today's success rate:</span>
                  <Badge
                    variant={todaySuccessRate >= 90 ? "default" : todaySuccessRate >= 70 ? "secondary" : "destructive"}
                  >
                    {todaySuccessRate}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Growth trend:</span>
                  <Badge variant={todayGrowth >= 0 ? "default" : "secondary"}>
                    {todayGrowth >= 0 ? "+" : ""}
                    {todayGrowth}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}