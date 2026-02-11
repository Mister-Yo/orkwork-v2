"use client"

import { useState } from "react"
import { Scale, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDecisionsPending } from "@/hooks/use-api"
import { api } from "@/lib/api"

const priorityColors: Record<string, string> = {
  urgent: 'border-red-500 bg-red-50 dark:bg-red-950',
  high: 'border-orange-500 bg-orange-50 dark:bg-orange-950',
  normal: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
  low: 'border-gray-500 bg-gray-50 dark:bg-gray-950',
}

export default function DecisionsPage() {
  const { data: decisions, isLoading, mutate } = useDecisionsPending()
  const list = Array.isArray(decisions) ? decisions : []
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleResolve = async (id: string, resolution: 'approve' | 'deny') => {
    setLoadingId(id)
    try {
      await api.decisions.resolve(id, resolution)
      mutate((current: any) => current?.filter((d: any) => d.id !== id), false)
    } catch (error) {
      console.error('Failed to resolve:', error)
      mutate()
    } finally {
      setLoadingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Decisions</h1>
          <p className="text-muted-foreground">{list.length} pending decisions</p>
        </div>
      </div>

      {list.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium">All clear</h3>
            <p className="text-sm text-muted-foreground mt-1">No decisions pending</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {list.map((d: any) => {
            const priority = d.priority || 'normal'
            const decisionType = d.decision_type || d.decisionType || d.type || 'general'
            const impact = d.impact || 'medium'
            const isProcessing = loadingId === d.id

            return (
              <Card key={d.id} className={`border-l-4 ${priorityColors[priority] || ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">
                          {d.title || d.decision || d.context || 'Decision'}
                        </h3>
                        <Badge variant="outline" className="text-xs">{decisionType}</Badge>
                        <Badge variant={priority === 'urgent' ? 'destructive' : 'secondary'} className="text-xs">
                          {priority}
                        </Badge>
                      </div>

                      {(d.description || d.reasoning) && (
                        <p className="text-sm text-muted-foreground">
                          {d.description || d.reasoning}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(d.created_at || d.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span>Impact: <span className={
                          impact === 'high' ? 'text-red-500' :
                          impact === 'medium' ? 'text-yellow-500' : 'text-green-500'
                        }>{impact}</span></span>
                        {d.required_by && (
                          <span>Due: {new Date(d.required_by).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleResolve(d.id, 'approve')}
                        disabled={isProcessing}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleResolve(d.id, 'deny')}
                        disabled={isProcessing}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Deny
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
