"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Send,
  History,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  BarChart3,
  Users,
  Download,
  Plus,
  Trash2,
  Search,
  Calendar,
  Copy,
  Star,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BlockedUserMessage } from "@/components/blocked-user-message"
import { WebhookPreview } from "@/components/webhook-preview"
import { WebhookScheduler } from "@/components/webhook-scheduler"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { ActivityLog } from "@/components/activity-log"

// Webhook templates
const WEBHOOK_TEMPLATES = [
  {
    id: "announcement",
    name: "📢 Announcement",
    description: "Official announcements and updates",
    data: {
      embedTitle: "📢 Important Announcement",
      embedDescription: "We have an important update to share with you.",
      color: "#5865F2",
      embedFields: [
        { name: "📅 Date", value: new Date().toLocaleDateString(), inline: true },
        { name: "👤 Author", value: "Team", inline: true },
      ],
    },
  },
  {
    id: "update",
    name: "🔄 System Update",
    description: "System updates and maintenance notifications",
    data: {
      embedTitle: "🔄 System Update",
      embedDescription: "System maintenance has been completed successfully.",
      color: "#57F287",
      embedFields: [
        { name: "⏰ Duration", value: "30 minutes", inline: true },
        { name: "✅ Status", value: "Completed", inline: true },
      ],
    },
  },
  {
    id: "alert",
    name: "🚨 Alert",
    description: "Critical alerts and warnings",
    data: {
      embedTitle: "🚨 Critical Alert",
      embedDescription: "Immediate attention required.",
      color: "#ED4245",
      embedFields: [
        { name: "🔥 Priority", value: "High", inline: true },
        { name: "⚡ Action Required", value: "Yes", inline: true },
      ],
    },
  },
  {
    id: "welcome",
    name: "👋 Welcome",
    description: "Welcome new members",
    data: {
      embedTitle: "👋 Welcome to our community!",
      embedDescription: "We're excited to have you here. Feel free to introduce yourself!",
      color: "#FEE75C",
      embedFields: [{ name: "🎉 Getting Started", value: "Check out our #rules channel", inline: false }],
    },
  },
  {
    id: "event",
    name: "🎉 Event",
    description: "Event announcements and reminders",
    data: {
      embedTitle: "🎉 Upcoming Event",
      embedDescription: "Join us for an exciting community event!",
      color: "#EB459E",
      embedFields: [
        { name: "📅 Date", value: "TBD", inline: true },
        { name: "⏰ Time", value: "TBD", inline: true },
        { name: "📍 Location", value: "Discord Server", inline: true },
      ],
    },
  },
]

// Declare getStatusIcon function
const getStatusIcon = (status) => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
    case "error":
      return <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
  }
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [user, setUser] = useState(null)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [message, setMessage] = useState("")
  const [username, setUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [color, setColor] = useState("#5865F2")
  const [isLoading, setIsLoading] = useState(false)
  const [webhookHistory, setWebhookHistory] = useState([])
  const [lastResult, setLastResult] = useState(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "send"

  // Enhanced webhook settings
  const [embedTitle, setEmbedTitle] = useState("")
  const [embedDescription, setEmbedDescription] = useState("")
  const [embedFields, setEmbedFields] = useState([{ name: "", value: "", inline: false }])
  const [embedThumbnail, setEmbedThumbnail] = useState("")
  const [embedImage, setEmbedImage] = useState("")
  const [embedFooter, setEmbedFooter] = useState("")
  const [embedAuthor, setEmbedAuthor] = useState("")
  const [embedUrl, setEmbedUrl] = useState("")
  const [isBlocked, setIsBlocked] = useState(false)

  // New features state
  const [savedWebhooks, setSavedWebhooks] = useState([])
  const [bulkWebhooks, setBulkWebhooks] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDate, setFilterDate] = useState("all")
  const [scheduledWebhooks, setScheduledWebhooks] = useState([])
  const [activityLog, setActivityLog] = useState([])

  // Update useEffect for checking blocked status
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
        setIsBlocked(true)
        return
      }

      setUser(userData)
      localStorage.setItem("discord_user", JSON.stringify(userData))
    } else {
      // Fallback to localStorage for demo mode
      const userData = localStorage.getItem("discord_user")
      if (!userData) {
        router.push("/auth")
        return
      }

      const parsedUser = JSON.parse(userData)
      // Check if user is blocked
      const blockedUsers = JSON.parse(localStorage.getItem("blocked_users") || "[]")
      if (blockedUsers.includes(parsedUser.id)) {
        setIsBlocked(true)
        return
      }

      setUser(parsedUser)
    }

    const history = localStorage.getItem("webhook_history")
    if (history) {
      setWebhookHistory(JSON.parse(history))
    }

    const saved = localStorage.getItem("saved_webhooks")
    if (saved) {
      setSavedWebhooks(JSON.parse(saved))
    }

    // Add this inside the existing useEffect after loading webhook history
    const scheduled = localStorage.getItem("scheduled_webhooks")
    if (scheduled) {
      setScheduledWebhooks(JSON.parse(scheduled))
    }

    const activities = localStorage.getItem("activity_log")
    if (activities) {
      setActivityLog(JSON.parse(activities))
    }
  }, [session, router])

  // Update handleLogout for complete logout
  const handleLogout = async () => {
    // Clear localStorage
    localStorage.removeItem("discord_user")
    localStorage.removeItem("webhook_history")

    // Sign out from NextAuth if session exists
    if (session) {
      await signOut({ redirect: false })
    }

    // Redirect to home
    router.push("/")
  }

  // Functions for working with embed fields
  const addEmbedField = () => {
    setEmbedFields([...embedFields, { name: "", value: "", inline: false }])
  }

  const removeEmbedField = (index) => {
    setEmbedFields(embedFields.filter((_, i) => i !== index))
  }

  const updateEmbedField = (index, field, value) => {
    const updatedFields = embedFields.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    setEmbedFields(updatedFields)
  }

  // Add these functions before the sendWebhook function
  const logActivity = (action, description, details = null) => {
    const newActivity = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      description,
      details,
      userId: user.id,
      username: user.username,
    }

    const updatedLog = [newActivity, ...activityLog].slice(0, 100)
    setActivityLog(updatedLog)
    localStorage.setItem("activity_log", JSON.stringify(updatedLog))
  }

  const handleScheduleWebhook = (webhookData) => {
    const newScheduled = {
      ...webhookData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: "pending",
    }

    const updated = [...scheduledWebhooks, newScheduled]
    setScheduledWebhooks(updated)
    localStorage.setItem("scheduled_webhooks", JSON.stringify(updated))

    logActivity("webhook_scheduled", `Scheduled webhook: ${webhookData.name}`, webhookData.message)
    setLastResult({ success: true, message: "Webhook scheduled successfully!" })
  }

  const handleDeleteScheduled = (id) => {
    const updated = scheduledWebhooks.filter((w) => w.id !== id)
    setScheduledWebhooks(updated)
    localStorage.setItem("scheduled_webhooks", JSON.stringify(updated))

    logActivity("config_deleted", "Deleted scheduled webhook")
  }

  const handleTogglePauseScheduled = (id) => {
    const updated = scheduledWebhooks.map((w) =>
      w.id === id ? { ...w, status: w.status === "paused" ? "pending" : "paused" } : w,
    )
    setScheduledWebhooks(updated)
    localStorage.setItem("scheduled_webhooks", JSON.stringify(updated))

    logActivity("settings_changed", "Toggled scheduled webhook status")
  }

  // Update sendWebhook function with stats tracking
  const sendWebhook = async () => {
    if (!webhookUrl || !message) {
      setLastResult({ success: false, message: "Please fill in webhook URL and message" })
      return
    }

    // Check if user is blocked before sending
    const blockedUsers = JSON.parse(localStorage.getItem("blocked_users") || "[]")
    if (blockedUsers.includes(user?.id)) {
      setLastResult({ success: false, message: "Your account has been suspended. Cannot send webhooks." })
      return
    }

    setIsLoading(true)
    setLastResult(null)

    try {
      const embed = {
        title: embedTitle || undefined,
        description: embedDescription || message,
        color: Number.parseInt(color.replace("#", ""), 16),
        timestamp: new Date().toISOString(),
        footer: {
          text: embedFooter || `Sent by ${user?.username || "Unknown User"}`,
        },
        author: embedAuthor ? { name: embedAuthor } : undefined,
        thumbnail: embedThumbnail ? { url: embedThumbnail } : undefined,
        image: embedImage ? { url: embedImage } : undefined,
        url: embedUrl || undefined,
        fields:
          embedFields.filter((f) => f.name && f.value).length > 0
            ? embedFields.filter((f) => f.name && f.value)
            : undefined,
      }

      const payload = {
        content: message,
        username: username || user?.username || "Webhook Bot",
        avatar_url: avatarUrl || undefined,
        embeds: [embed],
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const newWebhook = {
        id: Date.now(),
        message,
        username: username || user?.username,
        timestamp: new Date().toISOString(),
        status: response.ok ? "success" : "failed",
        statusCode: response.status,
        webhookUrl: webhookUrl.split("/").slice(-2).join("/"),
        embedTitle,
        embedDescription,
        color,
      }

      const updatedHistory = [newWebhook, ...webhookHistory].slice(0, 100)
      setWebhookHistory(updatedHistory)
      localStorage.setItem("webhook_history", JSON.stringify(updatedHistory))

      // Update user stats
      const currentStats = JSON.parse(localStorage.getItem(`user_stats_${user.id}`) || "{}")
      const updatedStats = {
        ...currentStats,
        totalWebhooks: updatedHistory.length,
        lastWebhookDate: new Date().toISOString(),
      }
      localStorage.setItem(`user_stats_${user.id}`, JSON.stringify(updatedStats))

      if (response.ok) {
        setLastResult({ success: true, message: "Webhook sent successfully!" })
        setMessage("")
        setEmbedTitle("")
        setEmbedDescription("")
        setEmbedFields([{ name: "", value: "", inline: false }])
        setEmbedThumbnail("")
        setEmbedImage("")
        setEmbedFooter("")
        setEmbedAuthor("")
        setEmbedUrl("")
      } else {
        const errorText = await response.text()
        setLastResult({
          success: false,
          message: `Failed to send webhook: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`,
        })
      }

      // Add this line after successful webhook send
      logActivity("webhook_sent", `Sent webhook: ${message.substring(0, 50)}...`, { status: response.status })
    } catch (error) {
      const newWebhook = {
        id: Date.now(),
        message,
        username: username || user?.username,
        timestamp: new Date().toISOString(),
        status: "error",
        error: error.message,
        webhookUrl: webhookUrl.split("/").slice(-2).join("/"),
      }

      const updatedHistory = [newWebhook, ...webhookHistory].slice(0, 100)
      setWebhookHistory(updatedHistory)
      localStorage.setItem("webhook_history", JSON.stringify(updatedHistory))

      setLastResult({ success: false, message: `Error: ${error.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  // Template functions
  const applyTemplate = (template) => {
    setEmbedTitle(template.data.embedTitle || "")
    setEmbedDescription(template.data.embedDescription || "")
    setColor(template.data.color || "#5865F2")
    setEmbedFields(template.data.embedFields || [{ name: "", value: "", inline: false }])
    setMessage(template.data.embedDescription || "")
    // Add this line at the end of applyTemplate function
    logActivity("template_applied", `Applied template: ${template.name}`)
  }

  // Save webhook configuration
  const saveWebhookConfig = () => {
    const config = {
      id: Date.now(),
      name: embedTitle || "Saved Webhook",
      webhookUrl,
      message,
      username,
      avatarUrl,
      color,
      embedTitle,
      embedDescription,
      embedFields,
      embedThumbnail,
      embedImage,
      embedFooter,
      embedAuthor,
      embedUrl,
      createdAt: new Date().toISOString(),
    }

    const updated = [...savedWebhooks, config]
    setSavedWebhooks(updated)
    localStorage.setItem("saved_webhooks", JSON.stringify(updated))
    setLastResult({ success: true, message: "Webhook configuration saved!" })
    // Add this line after saving config
    logActivity("config_saved", `Saved webhook configuration: ${config.name}`)
  }

  // Load saved webhook
  const loadSavedWebhook = (config) => {
    setWebhookUrl(config.webhookUrl || "")
    setMessage(config.message || "")
    setUsername(config.username || "")
    setAvatarUrl(config.avatarUrl || "")
    setColor(config.color || "#5865F2")
    setEmbedTitle(config.embedTitle || "")
    setEmbedDescription(config.embedDescription || "")
    setEmbedFields(config.embedFields || [{ name: "", value: "", inline: false }])
    setEmbedThumbnail(config.embedThumbnail || "")
    setEmbedImage(config.embedImage || "")
    setEmbedFooter(config.embedFooter || "")
    setEmbedAuthor(config.embedAuthor || "")
    setEmbedUrl(config.embedUrl || "")
  }

  // Delete saved webhook
  const deleteSavedWebhook = (id) => {
    const updated = savedWebhooks.filter((w) => w.id !== id)
    setSavedWebhooks(updated)
    localStorage.setItem("saved_webhooks", JSON.stringify(updated))
  }

  // Bulk send webhooks
  const sendBulkWebhooks = async () => {
    const urls = bulkWebhooks.split("\n").filter((url) => url.trim())
    if (urls.length === 0 || !message) {
      setLastResult({ success: false, message: "Please provide webhook URLs and message" })
      return
    }

    setIsLoading(true)
    let successCount = 0
    let failCount = 0

    for (const url of urls) {
      try {
        const payload = {
          content: message,
          username: username || user?.username || "Webhook Bot",
          avatar_url: avatarUrl || undefined,
        }

        const response = await fetch(url.trim(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          successCount++
        } else {
          failCount++
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        failCount++
      }
    }

    setIsLoading(false)
    setLastResult({
      success: successCount > 0,
      message: `Bulk send completed: ${successCount} successful, ${failCount} failed`,
    })
  }

  // Export data
  const exportData = () => {
    const data = {
      webhookHistory,
      savedWebhooks,
      userStats: JSON.parse(localStorage.getItem(`user_stats_${user.id}`) || "{}"),
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `webhook-data-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Filter history
  const filteredHistory = webhookHistory.filter((webhook) => {
    const matchesSearch =
      webhook.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webhook.username.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || webhook.status === filterStatus

    let matchesDate = true
    if (filterDate !== "all") {
      const webhookDate = new Date(webhook.timestamp)
      const now = new Date()

      switch (filterDate) {
        case "today":
          matchesDate = webhookDate.toDateString() === now.toDateString()
          break
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = webhookDate >= weekAgo
          break
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = webhookDate >= monthAgo
          break
      }
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // Check if blocked
  if (isBlocked) {
    return <BlockedUserMessage />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {(user.id === "808641359006400512" || user.isAdmin) && (
                <Link href="/admin">
                  <Button variant="outline">Admin Panel</Button>
                </Link>
              )}
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <img
                  src={user.avatar || "/placeholder.svg?height=24&width=24"}
                  alt={user.username}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                {user.isAdmin && <Badge variant="secondary">Admin</Badge>}
              </div>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your Discord webhooks with advanced features</p>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 dark:bg-gray-800">
            <TabsTrigger value="send" className="dark:data-[state=active]:bg-gray-700">
              <Send className="mr-2 h-4 w-4" />
              Send
            </TabsTrigger>
            <TabsTrigger value="templates" className="dark:data-[state=active]:bg-gray-700">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="bulk" className="dark:data-[state=active]:bg-gray-700">
              <Users className="mr-2 h-4 w-4" />
              Bulk
            </TabsTrigger>
            <TabsTrigger value="history" className="dark:data-[state=active]:bg-gray-700">
              <History className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="dark:data-[state=active]:bg-gray-700">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="export" className="dark:data-[state=active]:bg-gray-700">
              <Download className="mr-2 h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="dark:data-[state=active]:bg-gray-700">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="activity" className="dark:data-[state=active]:bg-gray-700">
              <Activity className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="dark:text-white">Send Discord Webhook</CardTitle>
                        <CardDescription className="dark:text-gray-400">
                          Send a message to your Discord channel via webhook
                        </CardDescription>
                      </div>
                      <Button onClick={saveWebhookConfig} variant="outline" size="sm">
                        <Star className="h-4 w-4 mr-2" />
                        Save Config
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {lastResult && (
                      <Alert
                        className={
                          lastResult.success
                            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                        }
                      >
                        <AlertDescription
                          className={
                            lastResult.success ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                          }
                        >
                          {lastResult.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="webhook-url" className="dark:text-white">
                        Webhook URL *
                      </Label>
                      <Input
                        id="webhook-url"
                        placeholder="https://discord.com/api/webhooks/..."
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="dark:text-white">
                          Custom Username
                        </Label>
                        <Input
                          id="username"
                          placeholder={user?.username || "Webhook Bot"}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avatar" className="dark:text-white">
                          Avatar URL
                        </Label>
                        <Input
                          id="avatar"
                          placeholder="https://example.com/avatar.png"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color" className="dark:text-white">
                        Embed Color
                      </Label>
                      <Select value={color} onValueChange={setColor}>
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="#5865F2">Discord Blue</SelectItem>
                          <SelectItem value="#57F287">Green</SelectItem>
                          <SelectItem value="#FEE75C">Yellow</SelectItem>
                          <SelectItem value="#ED4245">Red</SelectItem>
                          <SelectItem value="#EB459E">Pink</SelectItem>
                          <SelectItem value="#9B59B6">Purple</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="dark:text-white">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Enter your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    {/* Enhanced embed settings */}
                    <div className="space-y-2">
                      <Label htmlFor="embed-title" className="dark:text-white">
                        Embed Title
                      </Label>
                      <Input
                        id="embed-title"
                        placeholder="Optional embed title"
                        value={embedTitle}
                        onChange={(e) => setEmbedTitle(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="embed-description" className="dark:text-white">
                        Embed Description
                      </Label>
                      <Textarea
                        id="embed-description"
                        placeholder="Optional embed description (if empty, will use main message)"
                        value={embedDescription}
                        onChange={(e) => setEmbedDescription(e.target.value)}
                        rows={3}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="dark:text-white">Embed Fields</Label>
                        <Button type="button" onClick={addEmbedField} variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Field
                        </Button>
                      </div>
                      {embedFields.map((field, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <Input
                            placeholder="Field name"
                            value={field.name}
                            onChange={(e) => updateEmbedField(index, "name", e.target.value)}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                          <Input
                            placeholder="Field value"
                            value={field.value}
                            onChange={(e) => updateEmbedField(index, "value", e.target.value)}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={field.inline}
                              onChange={(e) => updateEmbedField(index, "inline", e.target.checked)}
                              className="rounded"
                            />
                            <span className="text-sm dark:text-white">Inline</span>
                            {embedFields.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => removeEmbedField(index)}
                                variant="outline"
                                size="sm"
                                className="ml-auto text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="embed-author" className="dark:text-white">
                          Embed Author
                        </Label>
                        <Input
                          id="embed-author"
                          placeholder="Optional author name"
                          value={embedAuthor}
                          onChange={(e) => setEmbedAuthor(e.target.value)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="embed-url" className="dark:text-white">
                          Embed URL
                        </Label>
                        <Input
                          id="embed-url"
                          placeholder="Optional embed URL"
                          value={embedUrl}
                          onChange={(e) => setEmbedUrl(e.target.value)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="embed-thumbnail" className="dark:text-white">
                          Thumbnail URL
                        </Label>
                        <Input
                          id="embed-thumbnail"
                          placeholder="Optional thumbnail image URL"
                          value={embedThumbnail}
                          onChange={(e) => setEmbedThumbnail(e.target.value)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="embed-image" className="dark:text-white">
                          Image URL
                        </Label>
                        <Input
                          id="embed-image"
                          placeholder="Optional large image URL"
                          value={embedImage}
                          onChange={(e) => setEmbedImage(e.target.value)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="embed-footer" className="dark:text-white">
                        Footer Text
                      </Label>
                      <Input
                        id="embed-footer"
                        placeholder={`Default: "Sent by ${user?.username || "Unknown User"}"`}
                        value={embedFooter}
                        onChange={(e) => setEmbedFooter(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <Button
                      onClick={sendWebhook}
                      disabled={!webhookUrl || !message || isLoading}
                      className="w-full"
                      size="lg"
                    >
                      {isLoading ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Webhook
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <WebhookPreview
                  message={message}
                  username={username || user?.username || "Webhook Bot"}
                  avatarUrl={avatarUrl}
                  color={color}
                  embedTitle={embedTitle}
                  embedDescription={embedDescription}
                  embedFields={embedFields}
                  embedThumbnail={embedThumbnail}
                  embedImage={embedImage}
                  embedFooter={embedFooter}
                  embedAuthor={embedAuthor}
                  embedUrl={embedUrl}
                />
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Saved Configurations</CardTitle>
                    <CardDescription className="dark:text-gray-400">Your saved webhook configurations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {savedWebhooks.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No saved configurations yet</p>
                    ) : (
                      <div className="space-y-2">
                        {savedWebhooks.slice(0, 5).map((config) => (
                          <div
                            key={config.id}
                            className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {config.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(config.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-1">
                              <Button onClick={() => loadSavedWebhook(config)} variant="outline" size="sm">
                                Load
                              </Button>
                              <Button
                                onClick={() => deleteSavedWebhook(config.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Webhook Templates</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Choose from predefined webhook templates to get started quickly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {WEBHOOK_TEMPLATES.map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-700 dark:border-gray-600"
                      onClick={() => applyTemplate(template)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg dark:text-white">{template.name}</CardTitle>
                        <CardDescription className="dark:text-gray-400">{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: template.data.color }} />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{template.data.color}</span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {template.data.embedDescription}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Bulk Send Webhooks</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Send the same message to multiple webhook URLs at once
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bulk-webhooks" className="dark:text-white">
                    Webhook URLs (one per line)
                  </Label>
                  <Textarea
                    id="bulk-webhooks"
                    placeholder="https://discord.com/api/webhooks/...&#10;https://discord.com/api/webhooks/...&#10;https://discord.com/api/webhooks/..."
                    value={bulkWebhooks}
                    onChange={(e) => setBulkWebhooks(e.target.value)}
                    rows={6}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-message" className="dark:text-white">
                    Message
                  </Label>
                  <Textarea
                    id="bulk-message"
                    placeholder="Enter your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-username" className="dark:text-white">
                      Username
                    </Label>
                    <Input
                      id="bulk-username"
                      placeholder={user?.username || "Webhook Bot"}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulk-avatar" className="dark:text-white">
                      Avatar URL
                    </Label>
                    <Input
                      id="bulk-avatar"
                      placeholder="https://example.com/avatar.png"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={sendBulkWebhooks}
                  disabled={!bulkWebhooks || !message || isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    "Sending to multiple webhooks..."
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Send to All Webhooks
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="dark:text-white">Webhook History</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Your recent webhook activities with advanced filtering
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{filteredHistory.length} results</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="search" className="dark:text-white">
                      Search
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search messages or usernames..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-white">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-white">Date Range</Label>
                    <Select value={filterDate} onValueChange={setFilterDate}>
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filteredHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {webhookHistory.length === 0 ? "No webhooks sent yet" : "No results found"}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredHistory.map((webhook) => (
                      <div
                        key={webhook.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700/50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(webhook.status)}
                            <span className="font-medium text-gray-900 dark:text-white">{webhook.username}</span>
                            <Badge variant={webhook.status === "success" ? "default" : "destructive"}>
                              {webhook.status}
                            </Badge>
                            {webhook.embedTitle && (
                              <Badge variant="outline" className="text-xs">
                                {webhook.embedTitle}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(webhook.timestamp).toLocaleString()}
                            </span>
                            <Button
                              onClick={() => navigator.clipboard.writeText(webhook.message)}
                              variant="outline"
                              size="sm"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">{webhook.message}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <p>Webhook: .../{webhook.webhookUrl}</p>
                          {webhook.statusCode && <p>Status Code: {webhook.statusCode}</p>}
                          {webhook.error && <p className="text-red-600 dark:text-red-400">Error: {webhook.error}</p>}
                          {webhook.color && (
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: webhook.color }} />
                              <span>Color: {webhook.color}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard webhookHistory={webhookHistory} />
          </TabsContent>

          <TabsContent value="export">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Export Data</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Export your webhook data and configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold dark:text-white">Export Options</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium dark:text-white">Webhook History</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{webhookHistory.length} webhooks</p>
                        </div>
                        <Badge variant="secondary">Included</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium dark:text-white">Saved Configurations</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {savedWebhooks.length} configurations
                          </p>
                        </div>
                        <Badge variant="secondary">Included</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium dark:text-white">User Statistics</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Analytics and usage data</p>
                        </div>
                        <Badge variant="secondary">Included</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold dark:text-white">Export Format</h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Data will be exported as a JSON file containing:
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Complete webhook history with timestamps</li>
                        <li>• All saved webhook configurations</li>
                        <li>• User statistics and analytics</li>
                        <li>• Export metadata and date</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button onClick={exportData} className="w-full" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Export All Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="scheduler">
            <WebhookScheduler
              onSchedule={handleScheduleWebhook}
              scheduledWebhooks={scheduledWebhooks}
              onDelete={handleDeleteScheduled}
              onTogglePause={handleTogglePauseScheduled}
            />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLog activities={activityLog} currentUser={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}