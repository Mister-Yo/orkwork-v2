"use client"

import { useState } from "react"
import { Check, Clock, X, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useDecisionsPending } from "@/hooks/use-api"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { Decision } from "@/types"

interface DecisionCardProps {
  decision: Decision
  onResolve: (id: string, resolution: 'approve' | 'deny') => Promise<void>
}

function DecisionCard({ decision, onResolve }: DecisionCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-red-500 bg-red-50 dark:bg-red-950"
      case "high":
        return "border-orange-500 bg-orange-50 dark:bg-orange-950"
      case "normal":
        return "border-blue-500 bg-blue-50 dark:bg-blue-950"
      default:
        return "border-gray-500 bg-gray-50 dark:bg-gray-950"
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

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-yellow-500"
      default:
        return "text-green-500"
    }
  }

  const handleResolve = async (resolution: 'approve' | 'deny') => {
    setIsLoading(true)
    try {
      await onResolve(decision.id, resolution)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn(
      "space-y-3 p-4 rounded-lg border transition-all hover:shadow-sm",
      getPriorityColor(decision.priority)
    )}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold leading-snug">{decision.title}</h4>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Badge variant={getPriorityVariant(decision.priority)} className="text-xs">
              {decision.priority}
            </Badge>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          {decision.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{new Date(decision.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Impact:</span>
            <span className={getImpactColor(decision.impact)}>
              {decision.impact}
            </span>
          </div>
          {decision.type && (
            <Badge variant="outline" className="text-xs px-2 py-0">
              {decision.type}
            </Badge>
          )}
        </div>

        {decision.requiredBy && (
          <div className="text-xs text-muted-foreground">
            Required by: {new Date(decision.requiredBy).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => handleResolve('approve')}
          disabled={isLoading}
          className="flex-1"
        >
          <Check className="h-3 w-3 mr-1" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleResolve('deny')}
          disabled={isLoading}
          className="flex-1"
        >
          <X className="h-3 w-3 mr-1" />
          Deny
        </Button>
      </div>
    </div>
  )
}

export function DecisionsQueue() {
  const { data: decisions, error, isLoading, mutate } = useDecisionsPending()

  const handleResolve = async (id: string, resolution: 'approve' | 'deny') => {
    try {
      await api.decisions.resolve(id, resolution)
      // Optimistic update - remove the resolved decision
      mutate(
        (current) => current?.filter(d => d.id !== id),
        false
      )
    } catch (error) {
      console.error('Failed to resolve decision:', error)
      // Revalidate on error to get the current state
      mutate()
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Decisions Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 p-4 rounded-lg border">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-8 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
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
            <Clock className="h-5 w-5" />
            Decisions Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load pending decisions</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Decisions Queue
          </CardTitle>
          <Badge variant="outline">
            {decisions?.length || 0} pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!decisions || decisions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No pending decisions</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {decisions.map((decision) => (
                <DecisionCard
                  key={decision.id}
                  decision={decision}
                  onResolve={handleResolve}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}