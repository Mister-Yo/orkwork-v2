"use client"

import { cn } from "@/lib/utils"

interface HealthScoreProps {
  score: number
  size?: "sm" | "md" | "lg"
  className?: string
  showLabel?: boolean
}

export function HealthScore({ 
  score, 
  size = "md", 
  className,
  showLabel = true 
}: HealthScoreProps) {
  // Ensure score is between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, score))
  
  // Calculate the stroke dash array for the circle
  const radius = size === "sm" ? 30 : size === "lg" ? 50 : 40
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference
  
  // Determine color based on score
  const getColor = (score: number) => {
    if (score >= 80) return "stroke-emerald-500"
    if (score >= 60) return "stroke-yellow-500" 
    return "stroke-red-500"
  }
  
  const getTextColor = (score: number) => {
    if (score >= 80) return "text-emerald-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const svgSize = size === "sm" ? 80 : size === "lg" ? 120 : 100
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl"
  const labelSize = size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-sm"

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={size === "sm" ? 3 : size === "lg" ? 5 : 4}
            fill="transparent"
            className="text-muted-foreground/20"
          />
          {/* Progress circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={size === "sm" ? 3 : size === "lg" ? 5 : 4}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-500 ease-in-out",
              getColor(normalizedScore)
            )}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            "font-bold leading-none",
            textSize,
            getTextColor(normalizedScore)
          )}>
            {Math.round(normalizedScore)}
          </span>
          {showLabel && (
            <span className={cn("text-muted-foreground mt-1", labelSize)}>
              Health
            </span>
          )}
        </div>
      </div>
    </div>
  )
}