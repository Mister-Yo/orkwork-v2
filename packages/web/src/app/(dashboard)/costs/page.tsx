"use client"
import { formatCurrency } from "@/lib/utils/currency"

import { DollarSign, TrendingUp, TrendingDown, Bot, FolderKanban, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { useAgents, useProjects } from "@/hooks/use-api"
import useSWR from 'swr'
import { api } from "@/lib/api"

function CostCard({ title, value, subtitle, icon: Icon, trend }: {
  title: string
  value: string
  subtitle?: string
  icon: any
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-emerald-500" />}
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function CostsPage() {
  const { data: costs, isLoading: costsLoading } = useSWR<any>('/v2/costs/summary', () => api.costs.summary(), { refreshInterval: 5 * 60 * 1000 })
  const { data: agents, isLoading: agentsLoading } = useAgents()
  const { data: projects, isLoading: projectsLoading } = useProjects()

  const isLoading = costsLoading || agentsLoading || projectsLoading
  const agentsList = Array.isArray(agents) ? agents : []
  const projectsList = Array.isArray(projects) ? projects : []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  const totalSpent = costs?.totalSpent ?? costs?.total_spent ?? 0
  const dailyBudget = costs?.dailyBudget ?? costs?.daily_budget ?? 0
  const monthlyBudget = costs?.monthlyBudget ?? costs?.monthly_budget ?? 0
  const todaySpent = costs?.todaySpent ?? costs?.today_spent ?? 0

  // Calculate per-agent costs
  const agentCosts = agentsList.map((agent: any) => ({
    name: agent.name,
    spent: (agent.total_spent_usd ?? agent.totalSpentUsd ?? 0),
    budget: (agent.daily_budget_usd ?? agent.dailyBudgetUsd ?? 0),
    status: agent.status,
  })).sort((a: any, b: any) => b.spent - a.spent)

  // Calculate per-project costs
  const projectCosts = projectsList.map((project: any) => ({
    name: project.name,
    spent: (project.spent_usd ?? project.spentUsd ?? 0),
    budget: (project.budget_usd ?? project.budgetUsd ?? 0),
    status: project.status,
  })).sort((a: any, b: any) => b.spent - a.spent)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Costs</h1>
        <p className="text-muted-foreground">Track spending across agents and projects</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CostCard
          title="Total Spent"
          value={`formatCurrency(totalSpent)`}
          subtitle="All time"
          icon={DollarSign}
        />
        <CostCard
          title="Today"
          value={`formatCurrency(todaySpent)`}
          subtitle={dailyBudget > 0 ? `of formatCurrency(dailyBudget) budget` : 'No daily budget set'}
          icon={TrendingUp}
          trend={todaySpent > dailyBudget && dailyBudget > 0 ? 'up' : 'neutral'}
        />
        <CostCard
          title="Daily Budget"
          value={dailyBudget > 0 ? `formatCurrency(dailyBudget)` : 'Not set'}
          subtitle={dailyBudget > 0 ? `${Math.round((todaySpent / dailyBudget) * 100)}% used` : undefined}
          icon={DollarSign}
        />
        <CostCard
          title="Active Agents"
          value={String(agentsList.filter((a: any) => a.status === 'active' || a.status === 'idle').length)}
          subtitle={`${agentsList.length} total`}
          icon={Bot}
        />
      </div>

      {/* Daily Budget Progress */}
      {dailyBudget > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Budget Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Today&apos;s spending</span>
              <span className="font-medium">${Number(todaySpent).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})} / ${Number(dailyBudget).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <Progress
              value={Math.min((todaySpent / dailyBudget) * 100, 100)}
              className="h-3"
            />
            {todaySpent > dailyBudget && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertTriangle className="h-4 w-4" />
                <span>Budget exceeded by ${(todaySpent - dailyBudget).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Agent Costs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Cost by Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agentCosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No agents</p>
            ) : (
              <div className="space-y-4">
                {agentCosts.map((agent: any, i: number) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{agent.name}</span>
                        <Badge variant="outline" className="text-xs">{agent.status}</Badge>
                      </div>
                      <span className="text-sm font-semibold">${Number(agent.spent).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    {agent.budget > 0 && (
                      <Progress
                        value={Math.min((agent.spent / agent.budget) * 100, 100)}
                        className="h-1.5"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Costs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              Cost by Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectCosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No projects</p>
            ) : (
              <div className="space-y-4">
                {projectCosts.map((project: any, i: number) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{project.name}</span>
                        <Badge variant="outline" className="text-xs">{project.status}</Badge>
                      </div>
                      <span className="text-sm font-semibold">${Number(project.spent).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    {project.budget > 0 && (
                      <div className="space-y-1">
                        <Progress
                          value={Math.min((project.spent / project.budget) * 100, 100)}
                          className="h-1.5"
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          ${Number(project.spent).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})} / ${Number(project.budget).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
