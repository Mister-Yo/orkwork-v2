"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Check, CheckCheck, Clock, AlertTriangle, Info, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@/lib/api"
import { useEvents } from "@/hooks/use-events"

interface Notification {
  id: string
  recipientType: string
  recipientId: string
  channel: string
  priority: "urgent" | "high" | "normal" | "low"
  title: string
  body: string
  status: "pending" | "sent" | "read" | "failed"
  readAt: string | null
  metadata: Record<string, any>
  createdAt: string
}

function timeAgo(date: string): string {
  const ms = Date.now() - new Date(date).getTime()
  const s = Math.floor(ms / 1000)
  if (s < 60) return "just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function priorityIcon(p: string) {
  switch (p) {
    case "urgent": return <AlertTriangle className="h-4 w-4 text-red-400" />
    case "high": return <AlertTriangle className="h-4 w-4 text-orange-400" />
    case "normal": return <Info className="h-4 w-4 text-blue-400" />
    default: return <Info className="h-4 w-4 text-muted-foreground" />
  }
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { lastEvent } = useEvents()

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await api.notifications.unreadCount()
      setUnreadCount(result?.unreadCount ?? (result as any)?.count ?? 0)
    } catch {
      // Silently fail - notifications are not critical
    }
  }, [])

  // Fetch notifications list
  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.notifications.list({ limit: 20 })
      setNotifications(Array.isArray(result) ? result : [])
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch count on mount
  useEffect(() => {
    fetchUnreadCount()
    // Poll every 30s as backup
    const iv = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(iv)
  }, [fetchUnreadCount])

  // Listen for SSE notification events
  useEffect(() => {
    if (lastEvent?.type === "notification.new") {
      setUnreadCount((prev) => prev + 1)
      if (open) fetchNotifications()
    }
  }, [lastEvent, open, fetchNotifications])

  // Fetch list when opened
  useEffect(() => {
    if (open) fetchNotifications()
  }, [open, fetchNotifications])

  // Mark one as read
  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "read" as const } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {}
  }

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead()
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: "read" as const }))
      )
      setUnreadCount(0)
    } catch {}
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest("[data-notification-center]")) {
        setOpen(false)
      }
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [open])

  return (
    <div className="relative" data-notification-center>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(v => !v)
        }}
      >
        <Bell className="h-4 w-4" />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </Button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 border rounded-lg bg-popover p-0 shadow-lg animate-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h4 className="text-sm font-semibold">Notifications</h4>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleMarkAllRead}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="max-h-80 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors ${n.status !== "read" ? "bg-muted/10" : ""}`}
                    onClick={() => n.status !== "read" && handleMarkRead(n.id)}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {priorityIcon(n.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.status !== "read" ? "font-medium" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {n.body}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(n.createdAt)}
                        </span>
                        {n.priority !== "normal" && n.priority !== "low" && (
                          <Badge variant={n.priority === "urgent" ? "destructive" : "outline"} className="text-[10px] px-1 py-0">
                            {n.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {n.status !== "read" && (
                      <div className="mt-1.5 flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}