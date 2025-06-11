"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export function DatabaseStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error" | "not-configured">("checking")
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const checkDatabaseConnection = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/health/database")
      const data = await response.json()

      if (response.ok && data.connected) {
        setStatus("connected")
        setError("")
      } else {
        setStatus("error")
        setError(data.error || "Database connection failed")
      }
    } catch (err) {
      setStatus("not-configured")
      setError("DATABASE_URL not configured")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkDatabaseConnection()
  }, [])

  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      case "not-configured":
        return <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      default:
        return <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
      case "not-configured":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Connected"
      case "error":
        return "Error"
      case "not-configured":
        return "Not Configured"
      default:
        return "Checking..."
    }
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Database Status
        </CardTitle>
        <CardDescription className="dark:text-gray-400">Neon PostgreSQL connection status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium dark:text-white">Database Connection</span>
          </div>
          <Badge className={getStatusColor()}>{getStatusText()}</Badge>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {status === "not-configured" && (
          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <div className="space-y-2">
                <p>Database not configured. To enable database features:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>
                    Create a Neon database at{" "}
                    <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="underline">
                      neon.tech
                    </a>
                  </li>
                  <li>Add DATABASE_URL to your environment variables</li>
                  <li>Run the SQL scripts in the /scripts folder</li>
                  <li>Restart your application</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={checkDatabaseConnection} disabled={isLoading} variant="outline" className="w-full">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Check Connection
        </Button>
      </CardContent>
    </Card>
  )
}