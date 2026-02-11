"use client"

import { AlertTriangle, Calendar, CheckCircle, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useIntelligenceBrief } from "@/hooks/use-api"
import { cn } from "@/lib/utils"

function StatRow({ icon: Icon, label, value }: { icon: any, label: string, value: number }) {
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

function EventItem({ event }: { event: any }) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="space-y-1 p-2 rounded-lg hover:bg-muted/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{event.description}</p>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(event.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs px-2 py-0">
          {event.type}
        </Badge>
        <span className={cn("text-xs", getImpactColor(event.impact))}>
          {event.impact} impact
        </span>
      </div>
    </div>
  )
}

function RecommendationItem({ recommendation }: { recommendation: any }) {
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

  return (
    <div className="space-y-2 p-2 rounded-lg hover:bg-muted/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-snug">{recommendation.title}</h4>
        <Badge variant={getPriorityVariant(recommendation.priority)} className="text-xs">
          {recommendation.priority}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {recommendation.description}
      </p>
    </div>
  )
}

function RiskItem({ risk }: { risk: any }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-500 bg-red-50 dark:bg-red-950"
      case "high":
        return "border-orange-500 bg-orange-50 dark:bg-orange-950"
      case "medium":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
      default:
        return "border-gray-500 bg-gray-50 dark:bg-gray-950"
    }
  }

  return (
    <div className={cn(
      "space-y-2 p-2 rounded-lg border transition-colors",
      getSeverityColor(risk.severity)
    )}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-snug">{risk.title}</h4>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {Math.round(risk.probability * 100)}%
          </Badge>
          <Badge variant="destructive" className="text-xs">
            {risk.severity}
          </Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {risk.description}
      </p>
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

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Daily Brief</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load daily brief</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!brief) {
    return null
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily Brief</CardTitle>
          <span className="text-xs text-muted-foreground">
            Generated {new Date(brief.generatedAt).toLocaleTimeString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-2 md:grid-cols-4">
          <StatRow 
            icon={TrendingUp} 
            label="Active Agents" 
            value={brief.summary.activeAgents} 
          />
          <StatRow 
            icon={CheckCircle} 
            label="Tasks Completed" 
            value={brief.summary.completedTasks} 
          />
          <StatRow 
            icon={Clock} 
            label="Pending Decisions" 
            value={brief.summary.pendingDecisions} 
          />
          <StatRow 
            icon={Calendar} 
            label="System Health" 
            value={brief.summary.systemHealth} 
          />
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
                {brief.events?.map((event) => (
                  <EventItem key={event.id} event={event} />
                ))}
                {(!brief.events || brief.events.length === 0) && (
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
                {brief.recommendations?.map((rec) => (
                  <RecommendationItem key={rec.id} recommendation={rec} />
                ))}
                {(!brief.recommendations || brief.recommendations.length === 0) && (
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
                {brief.risks?.map((risk) => (
                  <RiskItem key={risk.id} risk={risk} />
                ))}
                {(!brief.risks || brief.risks.length === 0) && (
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