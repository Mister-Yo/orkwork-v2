"use client"

import { FolderKanban, Plus, Calendar, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useProjects } from "@/hooks/use-api"

const riskColors: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  critical: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100',
}

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects()
  const projectsList = Array.isArray(projects) ? projects : []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">{projectsList.length} projects</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> New Project</Button>
      </div>

      {projectsList.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium">No projects yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first project to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projectsList.map((project: any) => {
            const budgetUsd = project.budget_usd ?? project.budgetUsd ?? 0
            const spentUsd = project.spent_usd ?? project.spentUsd ?? 0
            const riskLevel = project.risk_level ?? project.riskLevel ?? 'low'
            const healthScore = project.health_score ?? project.healthScore ?? 0
            const deadline = project.deadline ? new Date(project.deadline).toLocaleDateString() : null
            const budgetPct = budgetUsd > 0 ? Math.round((spentUsd / budgetUsd) * 100) : 0

            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={riskColors[riskLevel] || ''}>{riskLevel} risk</Badge>
                      <Badge variant="secondary">{project.status}</Badge>
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 text-sm">
                    {deadline && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{deadline}</span>
                      </div>
                    )}
                    {healthScore > 0 && (
                      <div className="flex items-center gap-1">
                        <span className={`font-medium ${healthScore >= 70 ? 'text-emerald-500' : healthScore >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                          Health: {healthScore}/100
                        </span>
                      </div>
                    )}
                  </div>
                  {budgetUsd > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-3.5 w-3.5" /> Budget
                        </span>
                        <span>${spentUsd.toLocaleString()} / ${budgetUsd.toLocaleString()}</span>
                      </div>
                      <Progress value={Math.min(budgetPct, 100)} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
