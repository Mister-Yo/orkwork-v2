"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CheckSquare, Clock, Calendar, User, FolderKanban, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTask } from "@/hooks/use-api"
import { api } from "@/lib/api"
import { mutate } from "swr"

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  assigned: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  created: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  ready: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  planning: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  escalated: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

const priorityColors: Record<string, string> = {
  urgent: 'text-red-600',
  high: 'text-orange-600',
  normal: 'text-blue-600',
  low: 'text-gray-500',
}

const statusTransitions: Record<string, string[]> = {
  created: ['planning', 'ready', 'cancelled'],
  planning: ['ready', 'cancelled'],
  ready: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'cancelled'],
  in_progress: ['review', 'blocked', 'completed', 'cancelled'],
  blocked: ['in_progress', 'cancelled'],
  review: ['completed', 'rejected', 'in_progress'],
  rejected: ['in_progress', 'cancelled'],
  escalated: ['in_progress', 'cancelled'],
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: task, isLoading } = useTask(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/tasks')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tasks
        </Button>
        <p className="text-muted-foreground">Task not found.</p>
      </div>
    )
  }

  const t: any = task
  const dueDate = t.due_date ?? t.dueDate
  const estimatedHours = t.estimated_hours ?? t.estimatedHours
  const actualHours = t.actual_hours ?? t.actualHours
  const reviewRequired = t.review_required ?? t.reviewRequired
  const retryCount = t.retry_count ?? t.retryCount ?? 0
  const maxRetries = t.max_retries ?? t.maxRetries ?? 0
  const acceptanceCriteria = t.acceptance_criteria ?? t.acceptanceCriteria
  const createdAt = t.created_at ?? t.createdAt
  const updatedAt = t.updated_at ?? t.updatedAt
  const projectName = t.project_name ?? t.projectName ?? t.project?.name
  const assigneeName = t.assignee_name ?? t.assigneeName ?? t.assignee?.name ?? t.assigned_agent

  const nextStatuses = statusTransitions[t.status] || []

  async function changeStatus(newStatus: string) {
    try {
      await api.tasks.update(id, { status: newStatus })
      mutate(`/v2/tasks/${id}`)
    } catch (e) {
      console.error('Failed to update status:', e)
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push('/tasks')}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
          <Badge variant="outline" className={statusColors[t.status] || ''}>{t.status?.replace('_', ' ')}</Badge>
          <span className={`text-sm font-semibold capitalize ${priorityColors[t.priority] || ''}`}>{t.priority} priority</span>
        </div>
        {t.description && <p className="text-muted-foreground mt-2">{t.description}</p>}
      </div>

      {/* Status Actions */}
      {nextStatuses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Change Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => changeStatus(s)}>
                  {s.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectName && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><FolderKanban className="h-3.5 w-3.5" /> Project</span>
                <span className="font-medium">{projectName}</span>
              </div>
            )}
            {assigneeName && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><User className="h-3.5 w-3.5" /> Assignee</span>
                <span className="font-medium">{assigneeName}</span>
              </div>
            )}
            {dueDate && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Due Date</span>
                <span className="font-medium">{new Date(dueDate).toLocaleDateString()}</span>
              </div>
            )}
            {reviewRequired !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Review Required</span>
                <span className="font-medium">{reviewRequired ? 'Yes' : 'No'}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Time & Effort</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {estimatedHours !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Estimated Hours</span>
                <span className="font-medium">{estimatedHours}h</span>
              </div>
            )}
            {actualHours !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Actual Hours</span>
                <span className="font-medium">{actualHours}h</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" /> Retries</span>
              <span className="font-medium">{retryCount} / {maxRetries}</span>
            </div>
            {createdAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{new Date(createdAt).toLocaleString()}</span>
              </div>
            )}
            {updatedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium">{new Date(updatedAt).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acceptance Criteria */}
      {acceptanceCriteria && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Acceptance Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">{acceptanceCriteria}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
