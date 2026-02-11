"use client"

import { Bot, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAgents } from "@/hooks/use-api"

function AgentCard({ agent }: { agent: any }) {
  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500',
    idle: 'bg-amber-500',
    error: 'bg-red-500',
    disabled: 'bg-gray-400',
  }

  const statusBadge: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    idle: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    disabled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  }

  const name = agent.name || 'Unknown'
  const status = agent.status || 'idle'
  const type = agent.type || 'assistant'
  const autonomy = agent.autonomy_level ?? agent.autonomyLevel ?? 'tool'
  const initial = name.charAt(0).toUpperCase()

  const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']
  const colorIdx = name.charCodeAt(0) % avatarColors.length

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${avatarColors[colorIdx]}`}>
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{name}</span>
          <div className={`w-2 h-2 rounded-full ${statusColors[status] || 'bg-gray-400'}`} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground capitalize">{type}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground capitalize">{autonomy}</span>
        </div>
      </div>
      <Badge variant="outline" className={statusBadge[status] || ''}>
        {status}
      </Badge>
    </div>
  )
}

export function AgentStatus() {
  const { data: agents, isLoading } = useAgents()
  const agentsList = Array.isArray(agents) ? agents : []

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const activeCount = agentsList.filter((a: any) => a.status === 'active' || a.status === 'idle').length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agents
          </CardTitle>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">
              {activeCount}/{agentsList.length}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {agentsList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No agents configured</p>
          </div>
        ) : (
          <div className="space-y-2">
            {agentsList.map((agent: any) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
