"use client"

import Link from "next/link"
import { useState } from "react"
import { CheckSquare, Plus, Filter, Clock, User, Bot, Calendar, ArrowUpDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTasks } from "@/hooks/use-api"
import { CreateTaskDialog } from "@/components/dialogs/create-task-dialog"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { LayoutList, Columns3 } from "lucide-react"

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
}

const priorityDots: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  normal: 'bg-blue-500',
  low: 'bg-gray-400',
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function duration(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 1) {
    const mins = Math.floor(diff / 60000)
    return `${mins}m`
  }
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d ${hrs % 24}h`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

type FilterStatus = 'all' | 'active' | 'completed' | 'blocked'

export default function TasksPage() {
  const { data: tasks, isLoading } = useTasks()
  const tasksList = Array.isArray(tasks) ? tasks : []
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [view, setView] = useState<'list' | 'kanban'>('list')

  const filtered = tasksList.filter((t: any) => {
    if (filter === 'all') return true
    if (filter === 'active') return ['in_progress', 'assigned', 'ready', 'review', 'planning'].includes(t.status)
    if (filter === 'completed') return t.status === 'completed'
    if (filter === 'blocked') return ['blocked', 'cancelled', 'rejected'].includes(t.status)
    return true
  })

  // Group by status
  const grouped: Record<string, any[]> = {}
  filtered.forEach((t: any) => {
    const s = t.status || 'created'
    if (!grouped[s]) grouped[s] = []
    grouped[s].push(t)
  })

  const statusOrder = ['in_progress', 'assigned', 'ready', 'review', 'planning', 'created', 'blocked', 'escalated', 'completed', 'rejected', 'cancelled']

  const activeCount = tasksList.filter((t: any) => ['in_progress', 'assigned', 'ready', 'review'].includes(t.status)).length
  const completedCount = tasksList.filter((t: any) => t.status === 'completed').length
  const blockedCount = tasksList.filter((t: any) => ['blocked', 'cancelled', 'rejected'].includes(t.status)).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            {tasksList.length} total · {activeCount} active · {completedCount} done · {blockedCount} blocked
          </p>
        </div>
        <CreateTaskDialog />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {([
          ['all', `All (${tasksList.length})`],
          ['active', `Active (${activeCount})`],
          ['completed', `Done (${completedCount})`],
          ['blocked', `Blocked (${blockedCount})`],
        ] as [FilterStatus, string][]).map(([key, label]) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
        <div className="flex gap-1 border rounded-lg p-0.5 ml-auto">
          <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setView('list')}>
            <LayoutList className="h-3.5 w-3.5 mr-1" />List
          </Button>
          <Button variant={view === 'kanban' ? 'default' : 'ghost'} size="sm" className="h-7 px-2" onClick={() => setView('kanban')}>
            <Columns3 className="h-3.5 w-3.5 mr-1" />Board
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium">No tasks</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'all' ? 'Create your first task to get started' : 'No tasks match this filter'}
            </p>
          </CardContent>
        </Card>
      ) : view === 'kanban' ? (
        <KanbanBoard tasks={filtered} />
      ) : (
        <div className="space-y-6">
          {statusOrder.filter(s => grouped[s]?.length).map(status => (
            <div key={status}>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {status.replace('_', ' ')}
                </h2>
                <Badge variant="secondary" className="text-[10px] px-1.5">{grouped[status].length}</Badge>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[1fr_120px_140px_80px_80px_70px] gap-2 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground border-b">
                <span>Task</span>
                <span>Assignee</span>
                <span>Created</span>
                <span>Running</span>
                <span>Estimate</span>
                <span>Priority</span>
              </div>

              <div className="space-y-0.5">
                {grouped[status].map((task: any) => (
                  <Link href={`/tasks/${task.id}`} key={task.id}>
                    <div className="grid grid-cols-[1fr_120px_140px_80px_80px_70px] gap-2 items-center px-3 py-2.5 rounded-lg border border-transparent hover:border-border hover:bg-accent/50 transition-colors group">
                      {/* Task title + description */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDots[task.priority] || 'bg-gray-400'}`} />
                          <p className="font-medium text-sm truncate">{task.title}</p>
                        </div>
                        {task.description && (
                          <p className="text-[11px] text-muted-foreground truncate ml-4 mt-0.5">{task.description}</p>
                        )}
                      </div>

                      {/* Assignee */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        {task.assigneeName ? (
                          <>
                            {task.assigneeType === 'agent' ? (
                              <Bot className="h-3 w-3 text-primary flex-shrink-0" />
                            ) : (
                              <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="text-xs truncate">{task.assigneeName}</span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unassigned</span>
                        )}
                      </div>

                      {/* Created */}
                      <div className="text-xs text-muted-foreground" title={task.createdAt ? formatDate(task.createdAt) : ''}>
                        {task.createdAt ? timeAgo(task.createdAt) : '—'}
                      </div>

                      {/* Running time */}
                      <div className="text-xs">
                        {task.status === 'in_progress' && task.createdAt ? (
                          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {duration(task.createdAt)}
                          </span>
                        ) : task.status === 'completed' && task.completedAt && task.createdAt ? (
                          <span className="text-emerald-600 dark:text-emerald-400">{duration(task.createdAt)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>

                      {/* Estimate */}
                      <div className="text-xs text-muted-foreground">
                        {task.estimatedHours ? `${task.estimatedHours}h` : '—'}
                      </div>

                      {/* Priority */}
                      <Badge variant="outline" className={`text-[10px] justify-center ${statusColors[task.status] || ''}`}>
                        {task.priority}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
