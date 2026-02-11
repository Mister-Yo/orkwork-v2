"use client"

import { AlertTriangle, Calendar, CheckCircle, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useIntelligenceBrief } from "@/hooks/use-api"
import { cn } from "@/lib/utils"

function StatRow({ icon: Icon, label, value }: { icon: any, label: string, value: number | string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

export function DailyBrief() {
  const { data: brief, error, isLoading } = useIntelligenceBrief()

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Daily Brief</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (error || !brief) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Daily Brief</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>{error ? "Failed to load daily brief" : "No brief available"}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle both snake_case and camelCase API responses
  const b: any = brief
  const summary = b.summary || {}
  const activeAgents = summary.activeAgents ?? summary.active_agents ?? 0
  const completedTasks = summary.completedTasks ?? summary.tasks_completed_24h ?? 0
  const pendingDecisions = summary.pendingDecisions ?? summary.decisions_pending ?? b.decisions_pending ?? 0
  const systemHealth = summary.systemHealth ?? b.system_health ?? 0
  const generatedAt = b.generatedAt ?? b.date ?? new Date().toISOString()

  // Normalize events - API returns top_events: [{time, agent, event}]
  const rawEvents = b.events || b.top_events || []
  const events = rawEvents.map((e: any, i: number) => ({
    id: e.id || `event-${i}`,
    description: e.description || e.event || String(e),
    timestamp: e.timestamp || e.time || generatedAt,
    type: e.type || "activity",
    impact: e.impact || "low",
    agent: e.agent,
  }))

  // Normalize recommendations - API may return string[]
  const rawRecs = b.recommendations || []
  const recommendations = rawRecs.map((r: any, i: number) => {
    if (typeof r === "string") {
      return { id: `rec-${i}`, title: r, description: "", priority: "normal" }
    }
    return { id: r.id || `rec-${i}`, title: r.title || r.description || String(r), description: r.description || "", priority: r.priority || "normal" }
  })

  // Normalize risks - API returns [{level, description}]
  const rawRisks = b.risks || []
  const risks = rawRisks.map((r: any, i: number) => {
    if (typeof r === "string") {
      return { id: `risk-${i}`, title: r, description: "", severity: "medium", probability: 0.5 }
    }
    return {
      id: r.id || `risk-${i}`,
      title: r.title || r.description || String(r),
      description: r.description || "",
      severity: r.severity || r.level || "medium",
      probability: r.probability ?? 0.5,
    }
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "border-red-500 bg-red-50 dark:bg-red-950"
      case "high": return "border-orange-500 bg-orange-50 dark:bg-orange-950"
      case "medium": return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
      default: return "border-gray-500 bg-gray-50 dark:bg-gray-950"
    }
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily Brief</CardTitle>
          <span className="text-xs text-muted-foreground">
            {new Date(generatedAt).toLocaleDateString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-2 md:grid-cols-4">
          <StatRow icon={TrendingUp} label="Active Agents" value={activeAgents} />
          <StatRow icon={CheckCircle} label="Tasks Completed" value={completedTasks} />
          <StatRow icon={Clock} label="Pending Decisions" value={pendingDecisions} />
          <StatRow icon={Calendar} label="System Health" value={`${systemHealth}%`} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Recent Events */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Recent Events
            </h3>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {events.length > 0 ? events.map((event: any) => (
                  <div key={event.id} className="space-y-1 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                    <p className="text-sm leading-snug">{event.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {event.agent && <span>{event.agent}</span>}
                      <span>{new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground p-2">No recent events</p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Recommendations */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recommendations
            </h3>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {recommendations.length > 0 ? recommendations.map((rec: any) => (
                  <div key={rec.id} className="p-2 rounded-lg hover:bg-muted/40 transition-colors">
                    <p className="text-sm leading-snug">{rec.title}</p>
                    {rec.description && <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>}
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground p-2">No recommendations</p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Risks */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risks
            </h3>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {risks.length > 0 ? risks.map((risk: any) => (
                  <div key={risk.id} className={cn("p-2 rounded-lg border", getSeverityColor(risk.severity))}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">{risk.title}</p>
                      <Badge variant="destructive" className="text-xs shrink-0">{risk.severity}</Badge>
                    </div>
                    {risk.description && risk.description !== risk.title && (
                      <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>
                    )}
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground p-2">No identified risks</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
