"use client"

import { FolderKanban, Calendar, DollarSign, AlertTriangle, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useProjects } from "@/hooks/use-api"
import { cn } from "@/lib/utils"
import type { Project } from "@/types"

interface ProjectCardProps {
  project: Project
}

function ProjectCard({ project }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500"
      case "paused":
        return "bg-yellow-500"
      case "completed":
        return "bg-blue-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "paused":
        return "secondary"
      case "completed":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-emerald-500"
      case "at-risk":
        return "text-yellow-500"
      case "critical":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-500 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
      case "high":
        return "text-orange-500 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800"
      case "normal":
        return "text-blue-500 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800"
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "default"
      case "normal":
        return "secondary"
      default:
        return "outline"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const budgetUsedPercentage = (project.budget.spent / project.budget.allocated) * 100

  return (
    <Card className={cn(
      "transition-all hover:shadow-sm",
      project.priority === "urgent" ? "border-red-200 dark:border-red-800" : ""
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="font-semibold text-sm leading-snug">{project.name}</h3>
            {project.description && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={getStatusVariant(project.status)} className="text-xs">
              {project.status}
            </Badge>
            <Badge variant={getPriorityVariant(project.priority)} className="text-xs">
              {project.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{project.progress.percentage}%</span>
          </div>
          <Progress value={project.progress.percentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{project.progress.completed} completed</span>
            <span>{project.progress.total} total tasks</span>
          </div>
        </div>

        {/* Health Score */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Health Score</span>
          <div className="flex items-center gap-1">
            <div className={cn(
              "h-2 w-2 rounded-full",
              project.health.status === "healthy" ? "bg-emerald-500" :
              project.health.status === "at-risk" ? "bg-yellow-500" : "bg-red-500"
            )} />
            <span className={cn(
              "text-xs font-medium",
              getHealthColor(project.health.status)
            )}>
              {project.health.score}/100
            </span>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Budget
            </span>
            <span className="font-medium">
              {formatCurrency(project.budget.spent)} / {formatCurrency(project.budget.allocated)}
            </span>
          </div>
          <Progress 
            value={budgetUsedPercentage} 
            className={cn(
              "h-1",
              budgetUsedPercentage > 90 ? "bg-red-100 dark:bg-red-950" : ""
            )}
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {Math.round(budgetUsedPercentage)}% used
            </span>
            <span className={cn(
              "font-medium",
              project.budget.remaining > 0 ? "text-emerald-500" : "text-red-500"
            )}>
              {formatCurrency(project.budget.remaining)} remaining
            </span>
          </div>
        </div>

        {/* Due Date */}
        {project.dueDate && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Due Date
            </span>
            <span className={cn(
              "font-medium",
              isOverdue(project.dueDate) ? "text-red-500" : "text-muted-foreground"
            )}>
              {formatDate(project.dueDate)}
              {isOverdue(project.dueDate) && " (Overdue)"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ProjectHealth() {
  const { data: projects, error, isLoading } = useProjects()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Project Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3 p-4 rounded-lg border">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
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
            <FolderKanban className="h-5 w-5" />
            Project Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load project data</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeProjects = projects?.filter(project => project.status === 'active') || []
  const atRiskProjects = projects?.filter(project => project.health.status === 'at-risk' || project.health.status === 'critical') || []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Project Health
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span>{activeProjects.length} active</span>
            </div>
            {atRiskProjects.length > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>{atRiskProjects.length} at risk</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!projects || projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderKanban className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No projects found</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}