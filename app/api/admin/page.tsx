"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { Shield, Users, Settings, BarChart3, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
// Добавить импорт для BlockedUserMessage
import { BlockedUserMessage } from "@/components/blocked-user-message"

export default function AdminPage() {
  const { data: session } = useSession()
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWebhooks: 0,
    activeUsers: 0,
  })
  const [newUserId, setNewUserId] = useState("")
  const [newUsername, setNewUsername] = useState("")
  const [message, setMessage] = useState(null)
  const router = useRouter()
  const [blockedUsers, setBlockedUsers] = useState([])
  // Добавить состояние для проверки блокировки
  const [isBlocked, setIsBlocked] = useState(false)

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

      // Check admin access
      if (!userData.isAdmin) {
        router.push("/dashboard")
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

      // Check admin access
      if (parsedUser.id !== "808641359006400512" && !parsedUser.isAdmin) {
        router.push("/dashboard")
        return
      }

      setUser(parsedUser)
    }

    loadUsers()
  }, [session, router])

  const loadUsers = () => {
    const savedUsers = localStorage.getItem("admin_users")
    const savedBlockedUsers = localStorage.getItem("blocked_users")

    let usersList = []
    let blocked = []

    if (savedUsers) {
      usersList = JSON.parse(savedUsers)
    } else {
      usersList = [
        {
          id: "808641359006400512",
          username: "SuperAdmin",
          isAdmin: true,
          lastActive: new Date().toISOString(),
          webhooksSent: 0,
          createdAt: new Date().toISOString(),
          isBlocked: false,
        },
      ]
    }

    if (savedBlockedUsers) {
      blocked = JSON.parse(savedBlockedUsers)
    }

    setUsers(usersList)
    setBlockedUsers(blocked)

    const totalWebhooks = usersList.reduce((sum, u) => sum + (u.webhooksSent || 0), 0)
    const activeUsers = usersList.filter(
      (u) => new Date(u.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && !blocked.includes(u.id),
    ).length

    setStats({
      totalUsers: usersList.length,
      totalWebhooks,
      activeUsers,
    })
  }

  const saveUsers = (usersList) => {
    localStorage.setItem("admin_users", JSON.stringify(usersList))
    setUsers(usersList)
  }

  const toggleUserAdmin = (userId) => {
    if (userId === "808641359006400512") {
      setMessage({ type: "error", text: "Cannot modify super admin privileges" })
      return
    }

    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u))
    saveUsers(updatedUsers)
    setMessage({ type: "success", text: "User privileges updated" })
  }

  const toggleUserBlock = (userId) => {
    if (userId === "808641359006400512") {
      setMessage({ type: "error", text: "Cannot block super admin" })
      return
    }

    let updatedBlockedUsers
    if (blockedUsers.includes(userId)) {
      updatedBlockedUsers = blockedUsers.filter((id) => id !== userId)
      setMessage({ type: "success", text: "User unblocked successfully" })
    } else {
      updatedBlockedUsers = [...blockedUsers, userId]
      setMessage({ type: "success", text: "User blocked successfully" })
    }

    setBlockedUsers(updatedBlockedUsers)
    localStorage.setItem("blocked_users", JSON.stringify(updatedBlockedUsers))
    loadUsers()
  }

  const addUser = () => {
    if (!newUserId || !newUsername) {
      setMessage({ type: "error", text: "Please fill in both User ID and Username" })
      return
    }

    if (users.find((u) => u.id === newUserId)) {
      setMessage({ type: "error", text: "User with this ID already exists" })
      return
    }

    const newUser = {
      id: newUserId,
      username: newUsername,
      isAdmin: false,
      lastActive: new Date().toISOString(),
      webhooksSent: 0,
      createdAt: new Date().toISOString(),
    }

    const updatedUsers = [...users, newUser]
    saveUsers(updatedUsers)
    setNewUserId("")
    setNewUsername("")
    setMessage({ type: "success", text: "User added successfully" })
    loadUsers()
  }

  const deleteUser = (userId) => {
    if (userId === "808641359006400512") {
      setMessage({ type: "error", text: "Cannot delete super admin" })
      return
    }

    const updatedUsers = users.filter((u) => u.id !== userId)
    saveUsers(updatedUsers)
    setMessage({ type: "success", text: "User deleted successfully" })
    loadUsers()
  }

  // Добавить проверку блокировки в начале return
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
            <Link href="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Badge variant="secondary">
                <Shield className="mr-1 h-3 w-3" />
                Admin Panel
              </Badge>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <img
                  src={user.avatar || "/placeholder.svg?height=24&width=24"}
                  alt={user.username}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Shield className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage users and system settings</p>
        </div>

        {message && (
          <Alert
            className={`mb-6 ${
              message.type === "success"
                ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
            }`}
          >
            <AlertDescription
              className={
                message.type === "success" ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
              }
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Webhooks</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalWebhooks}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 dark:bg-gray-800">
            <TabsTrigger value="users" className="dark:data-[state=active]:bg-gray-700">
              <Users className="mr-2 h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="settings" className="dark:data-[state=active]:bg-gray-700">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="space-y-6">
              {/* Add User */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Add New User</CardTitle>
                  <CardDescription className="dark:text-gray-400">Manually add users to the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-id" className="dark:text-white">
                        Discord User ID
                      </Label>
                      <Input
                        id="user-id"
                        placeholder="123456789012345678"
                        value={newUserId}
                        onChange={(e) => setNewUserId(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="dark:text-white">
                        Username
                      </Label>
                      <Input
                        id="username"
                        placeholder="Username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addUser} className="w-full">
                        Add User
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Users Table */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">User Management</CardTitle>
                  <CardDescription className="dark:text-gray-400">Manage user accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="dark:border-gray-700">
                        <TableHead className="dark:text-gray-300">User</TableHead>
                        <TableHead className="dark:text-gray-300">Discord ID</TableHead>
                        <TableHead className="dark:text-gray-300">Admin</TableHead>
                        <TableHead className="dark:text-gray-300">Blocked</TableHead>
                        <TableHead className="dark:text-gray-300">Webhooks Sent</TableHead>
                        <TableHead className="dark:text-gray-300">Last Active</TableHead>
                        <TableHead className="dark:text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} className="dark:border-gray-700">
                          <TableCell className="font-medium text-gray-900 dark:text-white">{u.username}</TableCell>
                          <TableCell className="font-mono text-sm text-gray-700 dark:text-gray-300">{u.id}</TableCell>
                          <TableCell>
                            {u.isAdmin ? <Badge>Admin</Badge> : <Badge variant="secondary">User</Badge>}
                          </TableCell>
                          <TableCell>
                            {blockedUsers.includes(u.id) ? (
                              <Badge variant="destructive">Blocked</Badge>
                            ) : (
                              <Badge variant="secondary">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">{u.webhooksSent || 0}</TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300">
                            {new Date(u.lastActive).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={u.isAdmin}
                                  onCheckedChange={() => toggleUserAdmin(u.id)}
                                  disabled={u.id === "808641359006400512"}
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400">Admin</span>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={blockedUsers.includes(u.id)}
                                  onCheckedChange={() => toggleUserBlock(u.id)}
                                  disabled={u.id === "808641359006400512"}
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400">Blocked</span>
                              </div>

                              {u.id !== "808641359006400512" && (
                                <Button
                                  onClick={() => deleteUser(u.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">System Settings</CardTitle>
                <CardDescription className="dark:text-gray-400">Configure application-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Rate Limiting</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enable rate limiting for webhook requests
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">User Registration</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Allow new user registrations</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Webhook Logging</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Log all webhook activities</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-4 text-gray-900 dark:text-white">System Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Version: 1.0.0</p>
                      <p className="text-gray-600 dark:text-gray-400">Environment: Development</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Uptime: 24h 15m</p>
                      <p className="text-gray-600 dark:text-gray-400">Status: Operational</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}