"use client"

import { FolderKanban } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useProjects } from "@/hooks/use-api"

export function ProjectHealth() {
  const { data: projects, isLoading } = useProjects()
  const projectsList = Array.isArray(projects) ? projects : []

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-32 w-full" /></CardContent>
      </Card>
    )
  }

  const riskColors: Record<string, string> = {
    low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    critical: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FolderKanban className="h-5 w-5" />
          Project Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projectsList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderKanban className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No projects yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projectsList.map((project: any) => {
              const healthScore = project.health_score ?? project.healthScore ?? 0
              const budgetUsd = (project.budget_usd ?? project.budgetUsd ?? 0) / 100
              const spentUsd = (project.spent_usd ?? project.spentUsd ?? 0) / 100
              const riskLevel = project.risk_level ?? project.riskLevel ?? 'low'
              const budgetPct = budgetUsd > 0 ? Math.round((spentUsd / budgetUsd) * 100) : 0

              return (
                <div key={project.id} className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-md">{project.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={riskColors[riskLevel] || ''}>
                        {riskLevel}
                      </Badge>
                      <Badge variant="secondary">{project.status}</Badge>
                    </div>
                  </div>

                  {budgetUsd > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget</span>
                        <span>${spentUsd.toLocaleString()} / ${budgetUsd.toLocaleString()}</span>
                      </div>
                      <Progress value={Math.min(budgetPct, 100)} className="h-2" />
                    </div>
                  )}

                  {healthScore > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Health:</span>
                      <span className={`text-sm font-medium ${healthScore >= 70 ? 'text-emerald-500' : healthScore >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                        {healthScore}/100
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
