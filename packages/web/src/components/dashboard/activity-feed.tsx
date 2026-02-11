"use client"

import { Activity, Bot, CheckSquare, FolderKanban, Scale, Settings, AlertTriangle, Key, Brain } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuditLog } from "@/hooks/use-api"
import { cn } from "@/lib/utils"

interface ActivityItemProps {
  entry: any
}

function ActivityItem({ entry }: ActivityItemProps) {
  const getTypeIcon = (resourceType: string) => {
    switch (resourceType) {
      case "agent": return Bot
      case "task": return CheckSquare
      case "project": return FolderKanban
      case "decision": return Scale
      case "api_key": return Key
      case "memory": return Brain
      default: return Settings
    }
  }

  const getTypeColor = (resourceType: string) => {
    switch (resourceType) {
      case "agent": return "text-blue-500 bg-blue-50 dark:bg-blue-950"
      case "task": return "text-green-500 bg-green-50 dark:bg-green-950"
      case "project": return "text-purple-500 bg-purple-50 dark:bg-purple-950"
      case "decision": return "text-orange-500 bg-orange-50 dark:bg-orange-950"
      case "api_key": return "text-yellow-500 bg-yellow-50 dark:bg-yellow-950"
      default: return "text-gray-500 bg-gray-50 dark:bg-gray-950"
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "create": return "Created"
      case "update": return "Updated"
      case "delete": return "Deleted"
      case "resolve": return "Resolved"
      case "assign": return "Assigned"
      case "login": return "Logged in"
      default: return action
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const TypeIcon = getTypeIcon(entry.resource_type || entry.resourceType || '')
  const actorName = entry.actor_type === 'agent' ? (entry.actor_id || 'Agent') : 'User'

  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors">
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        getTypeColor(entry.resource_type || entry.resourceType || '')
      )}>
        <TypeIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium leading-snug">
            {getActionLabel(entry.action)} {entry.resource_type || entry.resourceType}
          </h4>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTimestamp(entry.created_at || entry.createdAt)}
          </span>
        </div>
        {entry.details && (
          <p className="text-xs text-muted-foreground leading-relaxed truncate">
            {typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details)}
          </p>
        )}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-1 py-0">
            {entry.action}
          </Badge>
          <span className="text-xs text-muted-foreground">{actorName}</span>
        </div>
      </div>
    </div>
  )
}

export function ActivityFeed() {
  const { data: auditData, error, isLoading } = useAuditLog(15)
  const entries = auditData?.entries || auditData || []
  const list = Array.isArray(entries) ? entries : []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load activity</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-1">
              {list.map((entry: any, i: number) => (
                <ActivityItem key={entry.id || i} entry={entry} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
