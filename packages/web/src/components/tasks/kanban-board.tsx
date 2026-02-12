"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Bot, User, GripVertical, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@/lib/api"
import { mutate } from "swr"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  assigneeId?: string
  assigneeName?: string
  assigneeType?: string
  createdAt?: string
  completedAt?: string
}

const COLUMNS = [
  { key: "created", label: "Backlog", color: "border-t-gray-400" },
  { key: "ready", label: "Ready", color: "border-t-cyan-400" },
  { key: "in_progress", label: "In Progress", color: "border-t-blue-500" },
  { key: "review", label: "Review", color: "border-t-purple-500" },
  { key: "completed", label: "Done", color: "border-t-emerald-500" },
  { key: "blocked", label: "Blocked", color: "border-t-red-500" },
]

const priorityDots: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  normal: "bg-blue-500",
  low: "bg-gray-400",
}

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return "now"
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function KanbanCard({ task, onDragStart }: { task: Task; onDragStart: (e: React.DragEvent, taskId: string) => void }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="group cursor-grab active:cursor-grabbing"
    >
      <Link href={`/tasks/${task.id}`} onClick={(e) => e.stopPropagation()}>
        <Card className="p-3 hover:shadow-md transition-all border hover:border-primary/30">
          <div className="flex items-start gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDots[task.priority] || "bg-gray-400"}`} />
                <p className="text-sm font-medium leading-tight line-clamp-2">{task.title}</p>
              </div>
              {task.description && (
                <p className="text-[11px] text-muted-foreground line-clamp-1">{task.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {task.assigneeName ? (
                    <>
                      {task.assigneeType === "agent" ? (
                        <Bot className="h-3 w-3 text-primary" />
                      ) : (
                        <User className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{task.assigneeName}</span>
                    </>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">—</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {task.createdAt && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {timeAgo(task.createdAt)}
                    </span>
                  )}
                  <Badge variant="outline" className="text-[9px] px-1 py-0">{task.priority}</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  )
}

export function KanbanBoard({ tasks }: { tasks: Task[] }) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", taskId)
  }

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn(columnKey)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    setDragOverColumn(null)
    const taskId = e.dataTransfer.getData("text/plain")
    if (!taskId) return

    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) {
      setDraggedTaskId(null)
      return
    }

    // Optimistic update
    setDraggedTaskId(null)

    try {
      await api.tasks.updateStatus(taskId, newStatus)
      mutate("/v2/tasks")
    } catch (err) {
      console.error("Failed to update task status:", err)
      mutate("/v2/tasks")
    }
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
    setDragOverColumn(null)
  }

  // Group tasks by status, mapping planning/assigned into appropriate columns
  const columnTasks: Record<string, Task[]> = {}
  COLUMNS.forEach(col => { columnTasks[col.key] = [] })

  tasks.forEach(task => {
    let status = task.status
    if (status === "planning" || status === "assigned") status = "in_progress"
    if (status === "cancelled" || status === "rejected") status = "blocked"
    if (columnTasks[status]) {
      columnTasks[status].push(task)
    } else {
      columnTasks["created"].push(task)
    }
  })

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 250px)" }}>
      {COLUMNS.map(column => {
        const colTasks = columnTasks[column.key] || []
        const isOver = dragOverColumn === column.key

        return (
          <div
            key={column.key}
            className={`flex-shrink-0 w-72 flex flex-col rounded-lg border ${column.color} border-t-2 bg-muted/20 ${isOver ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
            onDragOver={(e) => handleDragOver(e, column.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.key)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b">
              <h3 className="text-sm font-semibold">{column.label}</h3>
              <Badge variant="secondary" className="text-[10px] px-1.5">{colTasks.length}</Badge>
            </div>

            {/* Cards */}
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-2">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    onDragEnd={handleDragEnd}
                    className={draggedTaskId === task.id ? "opacity-40" : ""}
                  >
                    <KanbanCard task={task} onDragStart={handleDragStart} />
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    Drop tasks here
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )
      })}
    </div>
  )
}
