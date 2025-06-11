"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface WebhookPreviewProps {
  message: string
  username: string
  avatarUrl: string
  color: string
  embedTitle: string
  embedDescription: string
  embedFields: Array<{ name: string; value: string; inline: boolean }>
  embedThumbnail: string
  embedImage: string
  embedFooter: string
  embedAuthor: string
  embedUrl: string
}

export function WebhookPreview({
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
}: WebhookPreviewProps) {
  const hasEmbed =
    embedTitle ||
    embedDescription ||
    embedFields.some((f) => f.name && f.value) ||
    embedThumbnail ||
    embedImage ||
    embedFooter ||
    embedAuthor

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-[#36393f] p-4 rounded-lg text-white font-['Whitney','Helvetica Neue','Helvetica','Arial',sans-serif]">
          {/* Message Header */}
          <div className="flex items-start space-x-3 mb-2">
            <Avatar className="w-10 h-10">
              <AvatarImage src={avatarUrl || "/placeholder.svg?height=40&width=40"} />
              <AvatarFallback className="bg-blue-600 text-white">
                {username ? username[0].toUpperCase() : "W"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white">{username || "Webhook Bot"}</span>
                <Badge variant="secondary" className="text-xs bg-[#5865f2] text-white">
                  BOT
                </Badge>
                <span className="text-xs text-gray-400">
                  Today at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {/* Main Message */}
              {message && <div className="mt-1 text-[#dcddde] break-words">{message}</div>}

              {/* Embed */}
              {hasEmbed && (
                <div className="mt-2">
                  <div
                    className="border-l-4 bg-[#2f3136] p-4 rounded-r"
                    style={{ borderLeftColor: color || "#5865f2" }}
                  >
                    {/* Embed Author */}
                    {embedAuthor && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-white">{embedAuthor}</span>
                      </div>
                    )}

                    {/* Embed Title */}
                    {embedTitle && (
                      <div className="mb-2">
                        {embedUrl ? (
                          <a
                            href={embedUrl}
                            className="text-[#00b0f4] hover:underline font-semibold"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {embedTitle}
                          </a>
                        ) : (
                          <div className="text-white font-semibold">{embedTitle}</div>
                        )}
                      </div>
                    )}

                    {/* Embed Description */}
                    {embedDescription && (
                      <div className="text-[#dcddde] text-sm mb-3 whitespace-pre-wrap">{embedDescription}</div>
                    )}

                    {/* Embed Fields */}
                    {embedFields.some((f) => f.name && f.value) && (
                      <div
                        className="grid gap-2 mb-3"
                        style={{
                          gridTemplateColumns: embedFields.some((f) => f.inline)
                            ? "repeat(auto-fit, minmax(150px, 1fr))"
                            : "1fr",
                        }}
                      >
                        {embedFields
                          .filter((f) => f.name && f.value)
                          .map((field, index) => (
                            <div key={index} className={field.inline ? "" : "col-span-full"}>
                              <div className="text-white font-semibold text-sm mb-1">{field.name}</div>
                              <div className="text-[#dcddde] text-sm whitespace-pre-wrap">{field.value}</div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Embed Image */}
                    {embedImage && (
                      <div className="mb-3">
                        <img
                          src={embedImage || "/placeholder.svg"}
                          alt="Embed image"
                          className="max-w-full h-auto rounded"
                          style={{ maxHeight: "300px" }}
                        />
                      </div>
                    )}

                    <div className="flex justify-between items-end">
                      {/* Embed Thumbnail */}
                      {embedThumbnail && (
                        <div className="ml-auto">
                          <img
                            src={embedThumbnail || "/placeholder.svg"}
                            alt="Embed thumbnail"
                            className="w-20 h-20 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>

                    {/* Embed Footer */}
                    {embedFooter && (
                      <div className="text-xs text-[#72767d] mt-2 flex items-center">
                        <span>{embedFooter}</span>
                        <span className="mx-1">•</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}