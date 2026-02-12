"use client"

import Link from "next/link"
import useSWR from "swr"
import { Bot, Plus, Shield, Zap, TrendingUp, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useAgents, useTasks } from "@/hooks/use-api"
import { CreateAgentDialog } from "@/components/dialogs/create-agent-dialog"
import { api } from "@/lib/api"
import { useMemo } from "react"

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

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 60) return 'text-blue-600 dark:text-blue-400'
  if (score >= 40) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

function scoreLabel(score: number): string {
  if (score >= 90) return '🔥 Excellent'
  if (score >= 80) return '✅ Great'
  if (score >= 60) return '👍 Good'
  if (score >= 40) return '⚠️ Needs work'
  if (score >= 20) return '🐌 Slow'
  return '💤 Inactive'
}

// Calculate efficiency score (0-100) based on task data
function calculateEfficiency(agentId: string, tasks: any[], agentStatus: string): {
  score: number
  completed: number
  inProgress: number
  total: number
  idle: boolean
} {
  const agentTasks = tasks.filter((t: any) => (t.assigneeId) === agentId)
  const completed = agentTasks.filter((t: any) => t.status === 'completed').length
  const inProgress = agentTasks.filter((t: any) => t.status === 'in_progress').length
  const review = agentTasks.filter((t: any) => t.status === 'review').length
  const blocked = agentTasks.filter((t: any) => t.status === 'blocked').length
  const total = agentTasks.length

  if (total === 0) {
    // No tasks assigned = 0 score (not contributing)
    return { score: 0, completed: 0, inProgress: 0, total: 0, idle: true }
  }

  let score = 0

  // Completion rate (40 points max)
  const completionRate = completed / total
  score += completionRate * 40

  // Active work (30 points max) - is the agent actually working?
  if (inProgress > 0) score += 25
  if (review > 0) score += 5
  if (agentStatus === 'active') score += 5 // bonus for being active

  // No blocked tasks (15 points max)
  if (blocked === 0) score += 15
  else score += Math.max(0, 15 - blocked * 5)

  // Task volume (15 points max) - has enough work
  score += Math.min(total * 3, 15)

  // Penalty for idle with assigned tasks
  if (agentStatus === 'idle' && inProgress === 0 && (total - completed) > 0) {
    score = Math.max(score - 20, 5)
  }

  return {
    score: Math.round(Math.min(100, Math.max(0, score))),
    completed,
    inProgress,
    total,
    idle: agentStatus === 'idle' && inProgress === 0,
  }
}

export default function AgentsPage() {
  const { data: agents, isLoading: agentsLoading } = useAgents()
  const { data: tasks, isLoading: tasksLoading } = useTasks()

  const agentsList = Array.isArray(agents) ? agents : []
  const tasksList = useMemo(() => {
    const d = tasks as any
    return d?.tasks || (Array.isArray(d) ? d : [])
  }, [tasks])

  const isLoading = agentsLoading

  // Sort agents by efficiency score (highest first)
  const agentsWithScores = useMemo(() => {
    return agentsList.map((agent: any) => ({
      ...agent,
      efficiency: calculateEfficiency(agent.id, tasksList, agent.status),
    })).sort((a: any, b: any) => b.efficiency.score - a.efficiency.score)
  }, [agentsList, tasksList])

  // Team average
  const teamAvg = useMemo(() => {
    if (agentsWithScores.length === 0) return 0
    return Math.round(agentsWithScores.reduce((sum: number, a: any) => sum + a.efficiency.score, 0) / agentsWithScores.length)
  }, [agentsWithScores])

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

  const activeCount = agentsList.filter((a: any) => a.status === 'active').length
  const idleCount = agentsList.filter((a: any) => a.status === 'idle').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            {agentsList.length} agents · {activeCount} active · {idleCount} idle · Team avg: <span className={scoreColor(teamAvg)}>{teamAvg}/100</span>
          </p>
        </div>
        <CreateAgentDialog />
      </div>

      {/* Summary bar */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card><CardContent className="pt-4 pb-3">
          <p className="text-sm text-muted-foreground">Team Score</p>
          <p className={`text-2xl font-bold ${scoreColor(teamAvg)}`}>{teamAvg}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3">
          <p className="text-sm text-muted-foreground">Idle</p>
          <p className="text-2xl font-bold text-amber-600">{idleCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3">
          <p className="text-sm text-muted-foreground">Total Tasks</p>
          <p className="text-2xl font-bold">{tasksList.length}</p>
        </CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agentsWithScores.map((agent: any) => {
          const name = agent.name || 'Unknown'
          const colorIdx = name.charCodeAt(0) % avatarColors.length
          const autonomy = agent.autonomy_level ?? agent.autonomyLevel ?? 'tool'
          const model = agent.model || 'unknown'
          const dailyBudget = (agent.daily_budget_usd ?? agent.dailyBudgetUsd ?? 0) / 100
          const totalSpent = (agent.total_spent_usd ?? agent.totalSpentUsd ?? 0) / 100
          const eff = agent.efficiency

          return (
            <Link href={`/agents/${agent.id}`} key={agent.id}>
              <Card className={`hover:shadow-md transition-shadow ${eff.idle && eff.total > 0 ? 'border-amber-500/50' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${avatarColors[colorIdx]}`}>
                      {name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{name}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">{agent.type}</p>
                    </div>
                    <Badge variant="outline" className={statusBadgeColors[agent.status] || ''}>
                      {agent.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Efficiency Score */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">Efficiency</span>
                      <span className={`text-sm font-bold ${scoreColor(eff.score)}`}>
                        {eff.score}/100 {scoreLabel(eff.score)}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${scoreBg(eff.score)}`}
                        style={{ width: `${eff.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Task stats */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      {eff.completed} done
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-500" />
                      {eff.inProgress} active
                    </span>
                    <span className="text-muted-foreground">{eff.total} total</span>
                  </div>

                  {/* Warning for idle agents with tasks */}
                  {eff.idle && eff.total > 0 && eff.total > eff.completed && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded px-2 py-1">
                      <AlertTriangle className="h-3 w-3" />
                      Has pending tasks but idle
                    </div>
                  )}

                  {/* Model + autonomy */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {model.replace('claude-', '').replace('-20250514', '')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span className="capitalize">{autonomy}</span>
                    </span>
                  </div>

                  {dailyBudget > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span>Budget</span>
                        <span>${totalSpent.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})} / ${dailyBudget.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                      <Progress value={Math.min((totalSpent / dailyBudget) * 100, 100)} className="h-1" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
