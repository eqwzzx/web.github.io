"use client"

import { CardContent } from "@/components/ui/card"

import { Card } from "@/components/ui/card"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, UserCheck, UserX, Shield, UserIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SUPER_ADMIN_DISCORD_ID } from "@/lib/config"

type UserType = {
  id: string
  discord_id: string
  username: string | null
  email: string | null
  role: string
  is_blocked: boolean
  created_at: string
}

interface UserManagementClientProps {
  initialUsers: UserType[]
}

export default function UserManagementClient({ initialUsers }: UserManagementClientProps) {
  const [users, setUsers] = useState<UserType[]>(initialUsers)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [actionType, setActionType] = useState<"block" | "unblock" | "makeAdmin" | "makeUser" | null>(null)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleActionConfirm = async () => {
    if (!selectedUser || !actionType) return

    let newRole = selectedUser.role
    let newBlockedStatus = selectedUser.is_blocked

    if (actionType === "block") newBlockedStatus = true
    if (actionType === "unblock") newBlockedStatus = false
    if (actionType === "makeAdmin") newRole = "admin"
    if (actionType === "makeUser") newRole = "user"

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole, is_blocked: newBlockedStatus }),
      })

      const result = await response.json()

      if (response.ok) {
        setUsers(
          users.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole, is_blocked: newBlockedStatus } : u)),
        )
        toast({ title: "Success", description: `User ${selectedUser.username || selectedUser.discord_id} updated.` })
      } else {
        toast({ title: "Error", description: result.error || "Failed to update user.", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" })
    } finally {
      setIsAlertDialogOpen(false)
      setSelectedUser(null)
      setActionType(null)
    }
  }

  const openConfirmationDialog = (user: UserType, type: "block" | "unblock" | "makeAdmin" | "makeUser") => {
    setSelectedUser(user)
    setActionType(type)
    setIsAlertDialogOpen(true)
  }

  const getDialogDescription = () => {
    if (!selectedUser || !actionType) return ""
    const userName = selectedUser.username || selectedUser.discord_id
    if (actionType === "block")
      return `Are you sure you want to block ${userName}? They will not be able to use the application.`
    if (actionType === "unblock")
      return `Are you sure you want to unblock ${userName}? They will regain access to the application.`
    if (actionType === "makeAdmin")
      return `Are you sure you want to make ${userName} an admin? They will gain administrative privileges.`
    if (actionType === "makeUser")
      return `Are you sure you want to demote ${userName} to a regular user? They will lose administrative privileges.`
    return ""
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isSuperAdmin = user.discord_id === SUPER_ADMIN_DISCORD_ID
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.username || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">ID: {user.discord_id}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {isSuperAdmin ? "Super Admin" : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_blocked ? "destructive" : "outline"}>
                        {user.is_blocked ? "Blocked" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={isSuperAdmin}>
                          <Button variant="ghost" size="icon" disabled={isSuperAdmin}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">User Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {user.is_blocked ? (
                            <DropdownMenuItem onClick={() => openConfirmationDialog(user, "unblock")}>
                              <UserCheck className="mr-2 h-4 w-4" /> Unblock User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => openConfirmationDialog(user, "block")}>
                              <UserX className="mr-2 h-4 w-4" /> Block User
                            </DropdownMenuItem>
                          )}
                          {user.role === "user" ? (
                            <DropdownMenuItem onClick={() => openConfirmationDialog(user, "makeAdmin")}>
                              <Shield className="mr-2 h-4 w-4" /> Make Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => openConfirmationDialog(user, "makeUser")}>
                              <UserIcon className="mr-2 h-4 w-4" /> Make User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>{getDialogDescription()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setSelectedUser(null)
                setActionType(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleActionConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}