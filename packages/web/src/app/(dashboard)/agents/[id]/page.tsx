"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Bot, Shield, Zap, Clock, DollarSign, Activity, Heart, Edit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useAgent, useAgentPerformance, useAgentHealth } from "@/hooks/use-api"

const statusBadgeColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  idle: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  disabled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500']

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: agent, isLoading } = useAgent(id)
  const { data: performance } = useAgentPerformance(id)
  const { data: health } = useAgentHealth(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/agents')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Agents
        </Button>
        <p className="text-muted-foreground">Agent not found.</p>
      </div>
    )
  }

  const a: any = agent
  const name = a.name || 'Unknown'
  const colorIdx = name.charCodeAt(0) % avatarColors.length
  const autonomy = a.autonomy_level ?? a.autonomyLevel ?? 'tool'
  const maxTasks = a.max_concurrent_tasks ?? a.maxConcurrentTasks ?? 1
  const model = a.model || 'unknown'
  const dailyBudget = a.daily_budget_usd ?? a.dailyBudgetUsd ?? 0
  const totalSpent = a.total_spent_usd ?? a.totalSpentUsd ?? 0
  const capabilities = a.capabilities || []
  const createdAt = a.created_at ?? a.createdAt

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/agents')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl ${avatarColors[colorIdx]}`}>
          {name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
            <Badge variant="outline" className={statusBadgeColors[a.status] || ''}>{a.status}</Badge>
          </div>
          <p className="text-muted-foreground capitalize">{a.type} agent • {model}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/agents')}>
          <Edit className="h-4 w-4 mr-2" /> Edit
        </Button>
      </div>

      {/* Details Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" /> Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Autonomy Level</span>
              <span className="font-medium capitalize">{autonomy}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Model</span>
              <span className="font-medium">{model}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Max Concurrent Tasks</span>
              <span className="font-medium">{maxTasks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium capitalize">{a.type}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Daily Budget</span>
              <span className="font-medium">${dailyBudget.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Spent</span>
              <span className="font-medium">${totalSpent.toFixed(2)}</span>
            </div>
            {dailyBudget > 0 && (
              <div className="space-y-1">
                <Progress value={Math.min((totalSpent / dailyBudget) * 100, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {Math.round((totalSpent / dailyBudget) * 100)}% used
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" /> Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {createdAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{new Date(createdAt).toLocaleDateString()}</span>
              </div>
            )}
            {capabilities.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-sm text-muted-foreground">Capabilities</span>
                <div className="flex flex-wrap gap-1">
                  {capabilities.map((cap: string) => (
                    <Badge key={cap} variant="secondary" className="text-xs">{cap}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Prompt */}
      {a.system_prompt && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg max-h-48 overflow-auto">
              {a.system_prompt}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Performance & Health */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" /> Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performance ? (
              <div className="space-y-2">
                {Object.entries(performance).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{typeof value === 'number' ? (value % 1 === 0 ? value : (value as number).toFixed(2)) : String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No performance data available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" /> Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {health ? (
              <div className="space-y-2">
                {Object.entries(health).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium">
                      {typeof value === 'object' ? JSON.stringify(value) : typeof value === 'number' ? (value % 1 === 0 ? value : (value as number).toFixed(2)) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No health data available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
