"use client"
import { Settings } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="text-muted-foreground">System configuration</p>
      <Card className="py-12">
        <CardContent className="text-center">
          <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium">Coming Soon</h3>
          <p className="text-sm text-muted-foreground mt-1">SLA rules, autonomy config, notifications, API keys</p>
        </CardContent>
      </Card>
    </div>
  )
}
