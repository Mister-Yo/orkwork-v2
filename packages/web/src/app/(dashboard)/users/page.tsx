"use client"

import { useState } from "react"
import useSWR from "swr"
import { Users, Shield, Trash2, CheckCircle, XCircle, UserPlus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"

const roleColors: Record<string, string> = {
  owner: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  member: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  viewer: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return "today"
  if (days === 1) return "yesterday"
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function UsersPage() {
  const { data, isLoading, mutate } = useSWR("/v2/users-page", () => api.users.list())
  const usersList = Array.isArray(data) ? data : ((data as any)?.users || [])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function handleApprove(id: string) {
    setActionLoading(id)
    try { await api.users.approve(id); mutate() } catch (e: any) { alert(e.message) }
    setActionLoading(null)
  }

  async function handleReject(id: string) {
    setActionLoading(id)
    try { await api.users.reject(id); mutate() } catch (e: any) { alert(e.message) }
    setActionLoading(null)
  }

  async function handleRoleChange(id: string, role: string) {
    setActionLoading(id)
    try { await api.users.updateRole(id, role); mutate() } catch (e: any) { alert(e.message) }
    setActionLoading(null)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    setActionLoading(id)
    try { await api.users.delete(id); mutate() } catch (e: any) { alert(e.message) }
    setActionLoading(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      </div>
    )
  }

  const pending = usersList.filter((u: any) => u.role === "pending")
  const active = usersList.filter((u: any) => u.role !== "pending")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">{usersList.length} users · {pending.length} pending approval</p>
      </div>

      {/* Pending approval */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-600 mb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Pending Approval ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((user: any) => (
              <div key={user.id} className="flex items-center gap-4 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                {user.avatarUrl || user.avatar_url ? (
                  <img src={user.avatarUrl || user.avatar_url} alt="" className="h-10 w-10 rounded-full" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                    {(user.displayName || user.display_name || user.username || "?").charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{user.displayName || user.display_name || user.username}</p>
                  <p className="text-sm text-muted-foreground">@{user.username} · Joined {timeAgo(user.createdAt || user.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(user.id)} disabled={actionLoading === user.id}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(user.id)} disabled={actionLoading === user.id}>
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active users table */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Active Users ({active.length})
        </h2>
        <div className="grid grid-cols-[auto_1fr_100px_100px_120px_80px] gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b">
          <span></span>
          <span>User</span>
          <span>Role</span>
          <span>Department</span>
          <span>Joined</span>
          <span>Actions</span>
        </div>
        <div className="space-y-0.5">
          {active.map((user: any) => {
            const name = user.displayName || user.display_name || user.username
            const role = user.role
            return (
              <div key={user.id} className="grid grid-cols-[auto_1fr_100px_100px_120px_80px] gap-2 items-center px-4 py-3 rounded-lg hover:bg-accent/50 transition-colors">
                {/* Avatar */}
                {user.avatarUrl || user.avatar_url ? (
                  <img src={user.avatarUrl || user.avatar_url} alt="" className="h-9 w-9 rounded-full" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                    {name.charAt(0)}
                  </div>
                )}

                {/* Name */}
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{name}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}{user.title ? ` · ${user.title}` : ""}</p>
                </div>

                {/* Role */}
                <div>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={role === "owner" || actionLoading === user.id}
                    className="text-xs rounded border border-border bg-background px-2 py-1 w-full disabled:opacity-50"
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                {/* Department */}
                <div className="text-xs text-muted-foreground truncate">
                  {user.department || "—"}
                </div>

                {/* Joined */}
                <div className="text-xs text-muted-foreground">
                  {timeAgo(user.createdAt || user.created_at)}
                </div>

                {/* Actions */}
                <div>
                  {role !== "owner" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                      onClick={() => handleDelete(user.id, name)}
                      disabled={actionLoading === user.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
