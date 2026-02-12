"use client"
import { formatCurrency } from "@/lib/utils/currency"

import { Bot, CheckSquare, DollarSign, TrendingUp } from "lucide-react"
import { HealthScore } from "@/components/dashboard/health-score"
import { StatCard } from "@/components/dashboard/stat-card"
import { AgentStatus } from "@/components/dashboard/agent-status"
import { ProjectHealth } from "@/components/dashboard/project-health"
import { DailyBrief } from "@/components/dashboard/daily-brief"
import { DecisionsQueue } from "@/components/dashboard/decisions-queue"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { useAgents, useProjects, useTasks } from "@/hooks/use-api"
import useSWR from 'swr'
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function DashboardStats() {
  const { data: agents, isLoading: agentsLoading } = useAgents()
  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: costs } = useSWR<any>('/v2/costs/summary', () => api.costs.summary(), { refreshInterval: 5 * 60 * 1000 })

  const agentsList = Array.isArray(agents) ? agents : []
  const tasksList = Array.isArray(tasks) ? tasks : []

  const activeAgents = agentsList.filter((a: any) => a.status === 'active').length
  const completedTasks = tasksList.filter((t: any) => t.status === 'completed').length
  const inProgressTasks = tasksList.filter((t: any) => t.status === 'in_progress' || t.status === 'assigned').length
  const totalTasks = tasksList.length
  const totalSpent = costs?.totalSpent ?? costs?.total_spent ?? 0

  if (agentsLoading || tasksLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col items-center justify-center p-6 rounded-xl border bg-card">
        <HealthScore 
          score={totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0} 
          size="lg" 
          showLabel={true}
        />
        <p className="text-sm font-medium mt-2">Task Completion</p>
      </div>

      <StatCard
        title="In Progress"
        value={inProgressTasks}
        icon={CheckSquare}
        subtitle={`${totalTasks} total tasks`}
      />

      <StatCard
        title="Active Agents"
        value={activeAgents}
        icon={Bot}
        subtitle={`${agentsList.length} total agents`}
      />

      <StatCard
        title="Total Spent"
        value={formatCurrency(totalSpent)}
        icon={DollarSign}
        subtitle={`${completedTasks} tasks completed`}
      />
    </div>
  )
}

function RecentTasks() {
  const { data: tasks, isLoading } = useTasks()
  const tasksList = Array.isArray(tasks) ? tasks.slice(0, 8) : []

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />

  const statusColors: Record<string, string> = {
    completed: 'bg-emerald-500',
    in_progress: 'bg-blue-500',
    assigned: 'bg-amber-500',
    blocked: 'bg-red-500',
    created: 'bg-gray-400',
    ready: 'bg-cyan-500',
    review: 'bg-purple-500',
    cancelled: 'bg-gray-300',
    planning: 'bg-indigo-400',
    rejected: 'bg-red-400',
    escalated: 'bg-orange-500',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {tasksList.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet</p>
        ) : (
          <div className="space-y-3">
            {tasksList.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColors[task.status] || 'bg-gray-400'}`} />
                  <span className="text-sm truncate">{task.title}</span>
                </div>
                <span className="text-xs text-muted-foreground capitalize flex-shrink-0 ml-2">
                  {task.status?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your AI Company OS command center
        </p>
      </div>

      <DashboardStats />

      <DailyBrief />

      <div className="grid gap-6 md:grid-cols-2">
        <DecisionsQueue />
        <ActivityFeed />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentTasks />
        <AgentStatus />
      </div>

      <ProjectHealth />
    </div>
  )
}
