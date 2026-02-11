"use client"
import { Scale, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDecisionsPending } from "@/hooks/use-api"

export default function DecisionsPage() {
  const { data: decisions, isLoading } = useDecisionsPending()
  const list = Array.isArray(decisions) ? decisions : []

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 rounded-xl" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Decisions</h1>
      <p className="text-muted-foreground">{list.length} pending decisions</p>
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
          {list.map((d: any) => (
            <Card key={d.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{d.decision_type || d.decisionType}</Badge>
                    <span className="font-medium text-sm">{d.decision || d.context}</span>
                  </div>
                  {d.reasoning && <p className="text-sm text-muted-foreground mt-1">{d.reasoning}</p>}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline" className="text-emerald-600"><CheckCircle className="h-4 w-4 mr-1" /> Approve</Button>
                  <Button size="sm" variant="outline" className="text-red-600"><XCircle className="h-4 w-4 mr-1" /> Deny</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
