"use client"

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  change?: {
    value: number
    period: string
  }
  trend?: "up" | "down" | "neutral"
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  trend,
  className,
}: StatCardProps) {
  const getTrendColor = (trend?: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "text-emerald-500"
      case "down":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getTrendIcon = () => {
    if (trend === "up") return TrendingUp
    if (trend === "down") return TrendingDown
    return null
  }

  const TrendIcon = getTrendIcon()

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-2xl font-bold leading-none">{value}</p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {change && (
              <div className={cn("flex items-center gap-1", getTrendColor(trend))}>
                {TrendIcon && <TrendIcon className="h-3 w-3" />}
                <span>
                  {change.value > 0 && trend !== "down" ? "+" : ""}
                  {change.value}
                  {change.value !== 0 && "%"}
                </span>
              </div>
            )}
            {change && <span>from {change.period}</span>}
            {!change && subtitle && <span>{subtitle}</span>}
          </div>
          
          {change && subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}