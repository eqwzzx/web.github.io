"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Send, Save, Plus, Minus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface EmbedField {
  name: string
  value: string
  inline: boolean
}

interface WebhookEmbed {
  title?: string
  description?: string
  color?: string
  author?: {
    name: string
    icon_url?: string
  }
  fields: EmbedField[]
  footer?: {
    text: string
    icon_url?: string
  }
  timestamp?: boolean
}

export default function EnhancedWebhookSender() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [message, setMessage] = useState("")
  const [username, setUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [useEmbed, setUseEmbed] = useState(false)
  const [embed, setEmbed] = useState<WebhookEmbed>({
    fields: [],
    timestamp: false,
  })
  const { toast } = useToast()

  const addEmbedField = () => {
    setEmbed((prev) => ({
      ...prev,
      fields: [...(prev.fields || []), { name: "", value: "", inline: false }],
    }))
  }

  const updateEmbedField = (index: number, field: Partial<EmbedField>) => {
    setEmbed((prev) => ({
      ...prev,
      fields: (prev.fields || []).map((f, i) => (i === index ? { ...f, ...field } : f)),
    }))
  }

  const removeEmbedField = (index: number) => {
    setEmbed((prev) => ({
      ...prev,
      fields: (prev.fields || []).filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!webhookUrl || (!message && !useEmbed)) {
      toast({
        title: "Error",
        description: "Webhook URL and content are required.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const payload: any = {
        webhookUrl,
        content: message || undefined,
        username: username || undefined,
        avatar_url: avatarUrl || undefined,
      }

      if (useEmbed) {
        const embedData = {
          ...embed,
          color: embed.color ? Number.parseInt(embed.color.replace("#", ""), 16) : undefined,
          timestamp: embed.timestamp ? new Date().toISOString() : undefined,
          fields: embed.fields || [],
        }
        payload.embeds = [embedData]
      }

      const response = await fetch("/api/webhooks/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Webhook sent successfully.",
        })
        setMessage("")
      } else {
        toast({
          title: "Error Sending Webhook",
          description: result.error || "An unknown error occurred.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to send webhook:", error)
      toast({
        title: "Network Error",
        description: "Failed to connect to the server.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveAsTemplate = async () => {
    toast({
      title: "Template Saved",
      description: "Webhook configuration saved as template.",
    })
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Discord Webhook Sender
        </CardTitle>
        <CardDescription>Send messages with embeds, custom styling, and advanced features.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              type="url"
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              required
            />
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="embed">Embed</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message Content</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Custom Username</Label>
                  <Input
                    id="username"
                    placeholder="Bot Name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Custom Avatar URL</Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    placeholder="https://example.com/avatar.png"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="embed" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="use-embed" checked={useEmbed} onCheckedChange={setUseEmbed} />
                <Label htmlFor="use-embed">Enable Rich Embed</Label>
              </div>

              {useEmbed && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Embed Title</Label>
                      <Input
                        placeholder="Embed title"
                        value={embed.title || ""}
                        onChange={(e) => setEmbed((prev) => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={embed.color || "#5865F2"}
                          onChange={(e) => setEmbed((prev) => ({ ...prev, color: e.target.value }))}
                          className="w-16"
                        />
                        <Input
                          placeholder="#5865F2"
                          value={embed.color || ""}
                          onChange={(e) => setEmbed((prev) => ({ ...prev, color: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Embed description"
                      value={embed.description || ""}
                      onChange={(e) => setEmbed((prev) => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Fields</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addEmbedField}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Field
                      </Button>
                    </div>
                    {(embed.fields || []).map((field, index) => (
                      <div key={index} className="p-3 border rounded bg-background space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Field {index + 1}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeEmbedField(index)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Input
                            placeholder="Field name"
                            value={field.name || ""}
                            onChange={(e) => updateEmbedField(index, { name: e.target.value })}
                          />
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={field.inline || false}
                              onCheckedChange={(checked) => updateEmbedField(index, { inline: checked })}
                            />
                            <Label className="text-sm">Inline</Label>
                          </div>
                        </div>
                        <Textarea
                          placeholder="Field value"
                          value={field.value || ""}
                          onChange={(e) => updateEmbedField(index, { value: e.target.value })}
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={embed.timestamp || false}
                      onCheckedChange={(checked) => setEmbed((prev) => ({ ...prev, timestamp: checked }))}
                    />
                    <Label>Add Timestamp</Label>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-3">Webhook Preview</h3>
                <div className="bg-background p-4 rounded border-l-4 border-primary">
                  <div className="flex items-center gap-2 mb-2">
                    {avatarUrl && (
                      <img src={avatarUrl || "/placeholder.svg"} alt="Avatar" className="w-6 h-6 rounded-full" />
                    )}
                    <span className="font-medium">{username || "Webhook Bot"}</span>
                    <Badge variant="secondary" className="text-xs">
                      BOT
                    </Badge>
                  </div>
                  {message && <p className="mb-2 text-sm">{message}</p>}
                  {useEmbed && (
                    <div
                      className="border-l-4 p-3 rounded bg-muted/20 mt-2"
                      style={{ borderLeftColor: embed.color || "#5865F2" }}
                    >
                      {embed.title && <h4 className="font-semibold text-sm mb-1">{embed.title}</h4>}
                      {embed.description && <p className="text-sm text-muted-foreground mb-2">{embed.description}</p>}
                      {(embed.fields || []).map((field, index) => (
                        <div key={index} className={`mt-2 ${field.inline ? "inline-block mr-4" : "block"}`}>
                          <div className="font-medium text-xs">{field.name}</div>
                          <div className="text-xs text-muted-foreground">{field.value}</div>
                        </div>
                      ))}
                      {embed.timestamp && (
                        <div className="text-xs text-muted-foreground mt-2">{new Date().toLocaleString()}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={isLoading} className="flex-1">
            <Send className="mr-2 h-4 w-4" />
            {isLoading ? "Sending..." : "Send Webhook"}
          </Button>
          <Button type="button" variant="outline" onClick={saveAsTemplate}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
