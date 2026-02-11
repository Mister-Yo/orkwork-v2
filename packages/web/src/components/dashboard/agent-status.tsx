"use client"

import { Bot, Activity, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAgents } from "@/hooks/use-api"
import { cn } from "@/lib/utils"
import type { Agent } from "@/types"

interface AgentCardProps {
  agent: Agent
}

function AgentCard({ agent }: AgentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500"
      case "idle":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "idle":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-emerald-500"
      case "warning":
        return "text-yellow-500"
      case "critical":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-emerald-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  // Get agent initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Generate a consistent color based on agent name
  const getAvatarColor = (name: string) => {
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

  return (
    <Card className="relative hover:shadow-sm transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className={cn("h-10 w-10", getAvatarColor(agent.name))}>
                <AvatarFallback className="text-white font-semibold text-sm">
                  {getInitials(agent.name)}
                </AvatarFallback>
              </Avatar>
              {/* Status indicator */}
              <div className={cn(
                "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background",
                getStatusColor(agent.status)
              )} />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm leading-none">{agent.name}</h3>
              <p className="text-xs text-muted-foreground">{agent.type}</p>
            </div>
          </div>
          <Badge variant={getStatusVariant(agent.status)} className="text-xs">
            {agent.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Current Task */}
        {agent.currentTask && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Current Task</p>
            <p className="text-sm leading-snug">{agent.currentTask}</p>
          </div>
        )}

        {/* Performance Score */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Performance</span>
          <span className={cn(
            "text-sm font-semibold",
            getPerformanceColor(agent.performance.score)
          )}>
            {agent.performance.score}/100
          </span>
        </div>

        {/* Health Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Health</span>
          <div className="flex items-center gap-1">
            <div className={cn(
              "h-2 w-2 rounded-full",
              agent.health.status === "healthy" ? "bg-emerald-500" :
              agent.health.status === "warning" ? "bg-yellow-500" : "bg-red-500"
            )} />
            <span className={cn(
              "text-xs font-medium",
              getHealthColor(agent.health.status)
            )}>
              {agent.health.status}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Tasks</p>
            <p className="text-sm font-semibold">{agent.performance.tasksCompleted}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="text-sm font-semibold">{Math.round(agent.performance.uptime)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AgentStatus() {
  const { data: agents, error, isLoading } = useAgents()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3 p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full" />
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
            <Bot className="h-5 w-5" />
            Agent Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load agent status</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeAgents = agents?.filter(agent => agent.status === 'active') || []
  const totalAgents = agents?.length || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">
              {activeAgents.length}/{totalAgents} active
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!agents || agents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No agents configured</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}