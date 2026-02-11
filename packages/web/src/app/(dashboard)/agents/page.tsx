"use client"

import { Bot, Plus, Shield, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useAgents } from "@/hooks/use-api"

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500',
  idle: 'bg-amber-500',
  error: 'bg-red-500',
  disabled: 'bg-gray-400',
}

const statusBadgeColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  idle: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  disabled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500']

export default function AgentsPage() {
  const { data: agents, isLoading } = useAgents()
  const agentsList = Array.isArray(agents) ? agents : []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">{agentsList.length} agents configured</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Agent</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agentsList.map((agent: any) => {
          const name = agent.name || 'Unknown'
          const colorIdx = name.charCodeAt(0) % avatarColors.length
          const autonomy = agent.autonomy_level ?? agent.autonomyLevel ?? 'tool'
          const maxTasks = agent.max_concurrent_tasks ?? agent.maxConcurrentTasks ?? 1
          const model = agent.model || 'unknown'
          const dailyBudget = agent.daily_budget_usd ?? agent.dailyBudgetUsd ?? 0
          const totalSpent = agent.total_spent_usd ?? agent.totalSpentUsd ?? 0

          return (
            <Card key={agent.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${avatarColors[colorIdx]}`}>
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{name}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">{agent.type}</p>
                  </div>
                  <Badge variant="outline" className={statusBadgeColors[agent.status] || ''}>
                    {agent.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="capitalize">{autonomy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{model}</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Max concurrent tasks: {maxTasks}
                </div>
                {dailyBudget > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Daily budget</span>
                      <span>${totalSpent.toFixed(2)} / ${dailyBudget.toFixed(2)}</span>
                    </div>
                    <Progress value={Math.min((totalSpent / dailyBudget) * 100, 100)} className="h-1.5" />
                  </div>
                )}
                {agent.system_prompt && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{agent.system_prompt.substring(0, 100)}...</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
