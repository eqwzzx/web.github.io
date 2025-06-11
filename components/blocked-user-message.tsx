"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Ban, Home, MessageCircle } from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"

export function BlockedUserMessage() {
  const handleLogout = async () => {
    // Clear localStorage
    localStorage.removeItem("discord_user")
    localStorage.removeItem("webhook_history")
    localStorage.removeItem("admin_users")

    // Sign out from NextAuth
    await signOut({ redirect: false })

    // Redirect to home
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200 dark:border-red-800 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <Ban className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-800 dark:text-red-200">Access Restricted</CardTitle>
          <CardDescription className="text-red-600 dark:text-red-400">
            Your account has been temporarily suspended
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-200 mb-1">Account Suspended</p>
                <p className="text-red-700 dark:text-red-300">
                  Your account has been suspended by an administrator. This may be due to a violation of our terms of
                  service or community guidelines.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">What can you do?</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <span>Contact support for assistance</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Review our community guidelines</span>
              </li>
              <li className="flex items-center space-x-2">
                <Home className="h-4 w-4 text-purple-500" />
                <span>Return to the homepage</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link href="/">
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Return to Homepage
              </Button>
            </Link>

            <Button onClick={handleLogout} variant="destructive" className="w-full">
              <Ban className="h-4 w-4 mr-2" />
              Sign Out Completely
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              If you believe this is an error, please contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}