"use client"

import { Activity, Bot, CheckSquare, FolderKanban, Scale, Settings, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Mock data hook - replace with real data fetching
function useActivityFeed() {
  // This would be replaced with actual API call
  const isLoading = false
  const error = null
  const data = [
    {
      id: "1",
      type: "agent",
      title: "Agent Alpha completed task",
      description: "Successfully processed 15 customer inquiries",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      agentName: "Alpha",
      metadata: { tasksCompleted: 15 }
    },
    {
      id: "2", 
      type: "task",
      title: "New high priority task created",
      description: "Optimize database query performance",
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      agentName: "Beta",
      metadata: { priority: "high" }
    },
    {
      id: "3",
      type: "project",
      title: "Project milestone reached",
      description: "Website redesign - Phase 1 completed",
      timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      agentName: "Gamma",
      metadata: { completion: 25 }
    },
    {
      id: "4",
      type: "decision",
      title: "Decision approved",
      description: "Budget allocation for Q2 marketing campaign",
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      metadata: { amount: 50000 }
    },
    {
      id: "5",
      type: "system",
      title: "System update completed",
      description: "Security patches applied successfully",
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
      metadata: { version: "2.1.3" }
    },
    {
      id: "6",
      type: "agent",
      title: "Agent Delta started task",
      description: "Analyzing sales data for monthly report",
      timestamp: new Date(Date.now() - 75 * 60000).toISOString(),
      agentName: "Delta",
      metadata: { taskType: "analysis" }
    }
  ]

  return { data, isLoading, error }
}

interface ActivityItemProps {
  activity: any
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "agent":
        return Bot
      case "task":
        return CheckSquare
      case "project":
        return FolderKanban
      case "decision":
        return Scale
      case "system":
        return Settings
      default:
        return Activity
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "agent":
        return "text-blue-500 bg-blue-50 dark:bg-blue-950"
      case "task":
        return "text-green-500 bg-green-50 dark:bg-green-950"
      case "project":
        return "text-purple-500 bg-purple-50 dark:bg-purple-950"
      case "decision":
        return "text-orange-500 bg-orange-50 dark:bg-orange-950"
      case "system":
        return "text-gray-500 bg-gray-50 dark:bg-gray-950"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getAgentInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAgentColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500", 
      "bg-green-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-pink-500",
    ]
    
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
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

  const TypeIcon = getTypeIcon(activity.type)

  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors">
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        getTypeColor(activity.type)
      )}>
        <TypeIcon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <h4 className="text-sm font-medium leading-snug">{activity.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activity.description}
            </p>
          </div>
          {activity.agentName && (
            <Avatar className={cn("h-6 w-6 flex-shrink-0", getAgentColor(activity.agentName))}>
              <AvatarFallback className="text-white text-xs">
                {getAgentInitials(activity.agentName)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-1 py-0">
              {activity.type}
            </Badge>
            {activity.metadata?.priority && (
              <Badge 
                variant={activity.metadata.priority === "high" ? "destructive" : "secondary"}
                className="text-xs px-1 py-0"
              >
                {activity.metadata.priority}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTimestamp(activity.timestamp)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function ActivityFeed() {
  const { data: activities, error, isLoading } = useActivityFeed()

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
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
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
            <span>Failed to load activity feed</span>
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
        {!activities || activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-1">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}