"use client"

import { CheckSquare, Plus, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTasks } from "@/hooks/use-api"

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
  urgent: 'text-red-600 dark:text-red-400',
  high: 'text-orange-600 dark:text-orange-400',
  normal: 'text-blue-600 dark:text-blue-400',
  low: 'text-gray-500',
}

const priorityDots: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  normal: 'bg-blue-500',
  low: 'bg-gray-400',
}

export default function TasksPage() {
  const { data: tasks, isLoading } = useTasks()
  const tasksList = Array.isArray(tasks) ? tasks : []

  // Group by status
  const grouped: Record<string, any[]> = {}
  tasksList.forEach((t: any) => {
    const s = t.status || 'created'
    if (!grouped[s]) grouped[s] = []
    grouped[s].push(t)
  })

  const statusOrder = ['in_progress', 'assigned', 'ready', 'review', 'planning', 'created', 'blocked', 'escalated', 'completed', 'rejected', 'cancelled']

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">{tasksList.length} tasks total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
          <Button><Plus className="h-4 w-4 mr-2" /> New Task</Button>
        </div>
      </div>

      {tasksList.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium">No tasks yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first task to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {statusOrder.filter(s => grouped[s]?.length).map(status => (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {status.replace('_', ' ')}
                </h2>
                <Badge variant="secondary" className="text-xs">{grouped[status].length}</Badge>
              </div>
              <div className="space-y-2">
                {grouped[status].map((task: any) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDots[task.priority] || 'bg-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className={`text-xs ${statusColors[task.status] || ''}`}>
                      {task.status?.replace('_', ' ')}
                    </Badge>
                    <span className={`text-xs font-medium capitalize ${priorityColors[task.priority] || ''}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
