"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FolderKanban, Calendar, DollarSign, AlertTriangle, CheckSquare, Activity, User, Crown, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useProject } from "@/hooks/use-api"
import useSWR from "swr"
import { apiFetch } from "@/lib/api"

const riskColors: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  critical: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100',
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  paused: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

const taskStatusColors: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  assigned: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  created: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

function useProjectTasks(projectId: string) {
  return useSWR<any[]>(
    projectId ? `/v2/projects/${projectId}/tasks` : null,
    () => apiFetch<any[]>(`/v2/projects/${projectId}/tasks`),
    { refreshInterval: 30000 }
  )
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: project, isLoading } = useProject(id)
  const { data: tasks } = useProjectTasks(id)
  const tasksList = Array.isArray(tasks) ? tasks : []

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

  if (!project) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/projects')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Button>
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    )
  }

  const p: any = project
  const budgetUsd = (p.budget_usd ?? p.budgetUsd ?? 0) / 100
  const spentUsd = (p.spent_usd ?? p.spentUsd ?? 0) / 100
  const riskLevel = p.risk_level ?? p.riskLevel ?? 'low'
  const healthScore = p.health_score ?? p.healthScore ?? 0
  const deadline = p.deadline ? new Date(p.deadline).toLocaleDateString() : null
  const createdAt = p.created_at ?? p.createdAt
  const budgetPct = budgetUsd > 0 ? Math.round((spentUsd / budgetUsd) * 100) : 0

  const ownerName = p.ownerName || p.owner_name || null
  const ownerAvatar = p.ownerAvatar || p.owner_avatar || null
  const createdByName = p.createdByName || p.created_by_name || null
  const createdByAvatar = p.createdByAvatar || p.created_by_avatar || null
  const githubUrl = p.githubUrl || p.github_url || null
  const skillsUrl = p.skillsUrl || p.skills_url || null
  const strategyUrl = p.strategyUrl || p.strategy_url || null
  const promptUrl = p.promptUrl || p.prompt_url || null

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push('/projects')}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{p.name}</h1>
            <Badge variant="outline" className={statusColors[p.status] || ''}>{p.status}</Badge>
            <Badge variant="outline" className={riskColors[riskLevel] || ''}>{riskLevel} risk</Badge>
          </div>
          {p.description && <p className="text-muted-foreground mt-1">{p.description}</p>}
        </div>
      </div>

      {/* Owner & Creator */}
      <div className="flex items-center gap-6">
        {ownerName && (
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">Owner:</span>
            <Avatar className="h-6 w-6">
              <AvatarImage src={ownerAvatar || undefined} />
              <AvatarFallback className="text-xs">{ownerName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{ownerName}</span>
          </div>
        )}
        {createdByName && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Created by:</span>
            <Avatar className="h-6 w-6">
              <AvatarImage src={createdByAvatar || undefined} />
              <AvatarFallback className="text-xs">{createdByName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{createdByName}</span>
          </div>
        )}
      </div>

      {/* Links */}
      {(githubUrl || skillsUrl || strategyUrl || promptUrl) && (
        <div className="flex items-center gap-4 flex-wrap">
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              🔗 GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {skillsUrl && (
            <a href={skillsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              📚 Skills
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {strategyUrl && (
            <a href={strategyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              🎯 Strategy
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {promptUrl && (
            <a href={promptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              📝 Prompt
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" /> Budget
            </div>
            <p className="text-2xl font-bold">${spentUsd.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ ${budgetUsd.toLocaleString()}</span></p>
            {budgetUsd > 0 && <Progress value={Math.min(budgetPct, 100)} className="h-2 mt-2" />}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Activity className="h-4 w-4" /> Health Score
            </div>
            <p className={`text-2xl font-bold ${healthScore >= 70 ? 'text-emerald-500' : healthScore >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
              {healthScore}<span className="text-sm font-normal text-muted-foreground">/100</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <AlertTriangle className="h-4 w-4" /> Priority
            </div>
            <p className="text-2xl font-bold capitalize">{p.priority || 'normal'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" /> Deadline
            </div>
            <p className="text-2xl font-bold">{deadline || 'None'}</p>
            {createdAt && <p className="text-xs text-muted-foreground mt-1">Created {new Date(createdAt).toLocaleDateString()}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" /> Tasks
            <Badge variant="secondary">{tasksList.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasksList.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks for this project.</p>
          ) : (
            <div className="space-y-2">
              {tasksList.map((task: any) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/tasks/${task.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    {task.description && <p className="text-xs text-muted-foreground truncate">{task.description}</p>}
                  </div>
                  <Badge variant="outline" className={`text-xs ${taskStatusColors[task.status] || ''}`}>
                    {task.status?.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs capitalize text-muted-foreground">{task.priority}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
