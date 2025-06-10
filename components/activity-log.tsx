"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Activity,
  Search,
  Filter,
  Send,
  Settings,
  Save,
  Trash2,
  Edit,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react"

interface ActivityLogEntry {
  id: string
  timestamp: string
  action:
    | "webhook_sent"
    | "webhook_scheduled"
    | "config_saved"
    | "config_deleted"
    | "settings_changed"
    | "template_applied"
  description: string
  details?: any
  userId: string
  username: string
}

interface ActivityLogProps {
  activities: ActivityLogEntry[]
  currentUser: any
}

export function ActivityLog({ activities, currentUser }: ActivityLogProps) {
  const [filteredActivities, setFilteredActivities] = useState(activities)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterAction, setFilterAction] = useState("all")
  const [filterDate, setFilterDate] = useState("all")

  useEffect(() => {
    let filtered = activities

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.username.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Action filter
    if (filterAction !== "all") {
      filtered = filtered.filter((activity) => activity.action === filterAction)
    }

    // Date filter
    if (filterDate !== "all") {
      const now = new Date()
      let dateThreshold: Date

      switch (filterDate) {
        case "today":
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          dateThreshold = new Date(0)
      }

      filtered = filtered.filter((activity) => new Date(activity.timestamp) >= dateThreshold)
    }

    setFilteredActivities(filtered)
  }, [activities, searchTerm, filterAction, filterDate])

  const getActionIcon = (action: string) => {
    switch (action) {
      case "webhook_sent":
        return <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case "webhook_scheduled":
        return <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      case "config_saved":
        return <Save className="h-4 w-4 text-green-600 dark:text-green-400" />
      case "config_deleted":
        return <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
      case "settings_changed":
        return <Settings className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      case "template_applied":
        return <Edit className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
      default:
        return <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "webhook_sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
      case "webhook_scheduled":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200"
      case "config_saved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
      case "config_deleted":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
      case "settings_changed":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200"
      case "template_applied":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200"
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "webhook_sent":
        return "Webhook Sent"
      case "webhook_scheduled":
        return "Webhook Scheduled"
      case "config_saved":
        return "Config Saved"
      case "config_deleted":
        return "Config Deleted"
      case "settings_changed":
        return "Settings Changed"
      case "template_applied":
        return "Template Applied"
      default:
        return "Unknown Action"
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterAction("all")
    setFilterDate("all")
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="dark:text-white flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Activity Log
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Track all actions and changes in your webhook management
            </CardDescription>
          </div>
          <Badge variant="secondary">{filteredActivities.length} activities</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="search" className="dark:text-white">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="dark:text-white">Action Type</Label>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="webhook_sent">Webhook Sent</SelectItem>
                <SelectItem value="webhook_scheduled">Webhook Scheduled</SelectItem>
                <SelectItem value="config_saved">Config Saved</SelectItem>
                <SelectItem value="config_deleted">Config Deleted</SelectItem>
                <SelectItem value="settings_changed">Settings Changed</SelectItem>
                <SelectItem value="template_applied">Template Applied</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="dark:text-white">Time Period</Label>
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

          <div className="space-y-2">
            <Label className="dark:text-white">Actions</Label>
            <Button onClick={clearFilters} variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Activity List */}
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {activities.length === 0 ? "No activities yet" : "No activities match your filters"}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">{getActionIcon(activity.action)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={getActionColor(activity.action)}>{getActionLabel(activity.action)}</Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-900 dark:text-white mb-1">{activity.description}</p>

                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <User className="h-3 w-3" />
                    <span>{activity.username}</span>
                    {activity.details && (
                      <>
                        <span>•</span>
                        <MessageSquare className="h-3 w-3" />
                        <span className="truncate max-w-xs">
                          {typeof activity.details === "string" ? activity.details : JSON.stringify(activity.details)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}