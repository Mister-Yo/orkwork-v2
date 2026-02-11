"use client"
import { DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCostsSummary } from "@/hooks/use-api"

export default function CostsPage() {
  const { data: costs, isLoading } = useCostsSummary()
  
  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-40" /><Skeleton className="h-64 rounded-xl" /></div>
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Costs</h1>
      <p className="text-muted-foreground">Track spending across agents and projects</p>
      <Card>
        <CardHeader><CardTitle>Cost Overview</CardTitle></CardHeader>
        <CardContent>
          {costs ? (
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">{JSON.stringify(costs, null, 2)}</pre>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No cost data yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
