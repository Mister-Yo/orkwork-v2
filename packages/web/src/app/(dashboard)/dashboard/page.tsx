"use client"

import { Activity, Bot, CheckSquare, DollarSign, Heart, TrendingUp } from "lucide-react"
import { HealthScore } from "@/components/dashboard/health-score"
import { StatCard } from "@/components/dashboard/stat-card"
import { DailyBrief } from "@/components/dashboard/daily-brief"
import { DecisionsQueue } from "@/components/dashboard/decisions-queue"
import { AgentStatus } from "@/components/dashboard/agent-status"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { ProjectHealth } from "@/components/dashboard/project-health"
import { useHealth, useAgents, useTasks, useCostsSummary } from "@/hooks/use-api"

function DashboardStats() {
  const { data: health } = useHealth()
  const { data: agents } = useAgents()
  const { data: tasks } = useTasks()
  const { data: costs } = useCostsSummary()

  // Calculate derived metrics
  const activeAgents = agents?.filter(agent => agent.status === 'active').length || 0
  const tasksToday = tasks?.filter(task => {
    const today = new Date().toDateString()
    return new Date(task.createdAt).toDateString() === today
  }).length || 0
  
  const systemHealth = health?.services ? 
    health.services.reduce((total, service) => {
      const score = service.status === 'healthy' ? 100 : service.status === 'degraded' ? 60 : 0
      return total + score
    }, 0) / health.services.length : 75

  const budgetSpent = costs?.current?.monthly || 0
  const budgetChange = costs?.trends?.[0]?.change || 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* System Health */}
      <div className="flex flex-col items-center justify-center p-6 rounded-xl border bg-card">
        <HealthScore 
          score={systemHealth} 
          size="lg" 
          showLabel={true}
        />
        <p className="text-sm font-medium mt-2">System Health</p>
      </div>

      {/* Budget Status */}
      <StatCard
        title="Monthly Budget"
        value={`$${budgetSpent.toLocaleString()}`}
        icon={DollarSign}
        change={{
          value: budgetChange,
          period: "last month"
        }}
        trend={budgetChange > 0 ? "up" : budgetChange < 0 ? "down" : "neutral"}
      />

      {/* Active Agents */}
      <StatCard
        title="Active Agents"
        value={activeAgents}
        icon={Bot}
        subtitle={`${agents?.length || 0} total agents`}
        change={{
          value: 12,
          period: "last week"
        }}
        trend="up"
      />

      {/* Tasks Today */}
      <StatCard
        title="Tasks Today"
        value={tasksToday}
        icon={CheckSquare}
        subtitle="New tasks created"
        change={{
          value: 8,
          period: "yesterday"
        }}
        trend="up"
      />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your AI Company OS command center
        </p>
      </div>

      {/* Top Stats Grid */}
      <DashboardStats />

      {/* Daily Brief - Full Width */}
      <DailyBrief />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Decisions Queue */}
        <DecisionsQueue />

        {/* Activity Feed */}
        <ActivityFeed />

        {/* Placeholder for additional component */}
        <div className="space-y-6">
          {/* You could add another component here, or extend one of the existing ones */}
        </div>
      </div>

      {/* Agent Status - Full Width */}
      <AgentStatus />

      {/* Project Health - Full Width */}
      <ProjectHealth />
    </div>
  )
}