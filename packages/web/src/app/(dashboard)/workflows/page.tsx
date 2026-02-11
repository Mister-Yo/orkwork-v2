"use client"
import { GitBranch } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
      <p className="text-muted-foreground">Automate multi-step processes</p>
      <Card className="py-12">
        <CardContent className="text-center">
          <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium">Coming Soon</h3>
          <p className="text-sm text-muted-foreground mt-1">Visual workflow builder is in development</p>
        </CardContent>
      </Card>
    </div>
  )
}
