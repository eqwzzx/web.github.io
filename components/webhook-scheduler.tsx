"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Trash2, Play, Pause } from "lucide-react"

interface ScheduledWebhook {
  id: string
  name: string
  webhookUrl: string
  message: string
  scheduledTime: string
  status: "pending" | "sent" | "failed" | "paused"
  repeatType: "none" | "daily" | "weekly" | "monthly"
  createdAt: string
}

interface WebhookSchedulerProps {
  onSchedule: (webhook: Omit<ScheduledWebhook, "id" | "createdAt" | "status">) => void
  scheduledWebhooks: ScheduledWebhook[]
  onDelete: (id: string) => void
  onTogglePause: (id: string) => void
}

export function WebhookScheduler({ onSchedule, scheduledWebhooks, onDelete, onTogglePause }: WebhookSchedulerProps) {
  const [name, setName] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [message, setMessage] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [repeatType, setRepeatType] = useState<"none" | "daily" | "weekly" | "monthly">("none")

  const handleSchedule = () => {
    if (!name || !webhookUrl || !message || !scheduledDate || !scheduledTime) {
      return
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)

    onSchedule({
      name,
      webhookUrl,
      message,
      scheduledTime: scheduledDateTime.toISOString(),
      repeatType,
    })

    // Reset form
    setName("")
    setWebhookUrl("")
    setMessage("")
    setScheduledDate("")
    setScheduledTime("")
    setRepeatType("none")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
      case "sent":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
      case "paused":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200"
    }
  }

  const getRepeatText = (type: string) => {
    switch (type) {
      case "daily":
        return "Daily"
      case "weekly":
        return "Weekly"
      case "monthly":
        return "Monthly"
      default:
        return "Once"
    }
  }

  return (
    <div className="space-y-6">
      {/* Schedule New Webhook */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Webhook
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Schedule webhooks to be sent at specific times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-name" className="dark:text-white">
                Schedule Name
              </Label>
              <Input
                id="schedule-name"
                placeholder="Daily announcement"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-webhook" className="dark:text-white">
                Webhook URL
              </Label>
              <Input
                id="schedule-webhook"
                placeholder="https://discord.com/api/webhooks/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-message" className="dark:text-white">
              Message
            </Label>
            <Input
              id="schedule-message"
              placeholder="Your scheduled message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-date" className="dark:text-white">
                Date
              </Label>
              <Input
                id="schedule-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-time" className="dark:text-white">
                Time
              </Label>
              <Input
                id="schedule-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-white">Repeat</Label>
              <Select value={repeatType} onValueChange={(value: any) => setRepeatType(value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="none">Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleSchedule}
            disabled={!name || !webhookUrl || !message || !scheduledDate || !scheduledTime}
            className="w-full"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Webhook
          </Button>
        </CardContent>
      </Card>

      {/* Scheduled Webhooks List */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Scheduled Webhooks
            </div>
            <Badge variant="secondary">{scheduledWebhooks.length} scheduled</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledWebhooks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">No scheduled webhooks yet</div>
          ) : (
            <div className="space-y-4">
              {scheduledWebhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{webhook.name}</h3>
                        <Badge className={getStatusColor(webhook.status)}>{webhook.status}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {getRepeatText(webhook.repeatType)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{webhook.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>📅 {new Date(webhook.scheduledTime).toLocaleDateString()}</span>
                        <span>🕐 {new Date(webhook.scheduledTime).toLocaleTimeString()}</span>
                        <span>🔗 .../{webhook.webhookUrl.split("/").slice(-2).join("/")}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => onTogglePause(webhook.id)}
                        variant="outline"
                        size="sm"
                        disabled={webhook.status === "sent" || webhook.status === "failed"}
                      >
                        {webhook.status === "paused" ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                      </Button>
                      <Button
                        onClick={() => onDelete(webhook.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}