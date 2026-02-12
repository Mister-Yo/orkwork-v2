"use client"

import { useState } from "react"
import useSWR from "swr"
import { Bot, User, Users, ChevronDown, ChevronRight, Circle } from "lucide-react"
import { api } from "@/lib/api"
import { useAgents, useTasks } from "@/hooks/use-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const statusColor: Record<string, string> = {
  active: "bg-emerald-500",
  idle: "bg-amber-400",
  error: "bg-red-500",
  disabled: "bg-gray-400",
  pending: "bg-gray-300",
}

const roleColors: Record<string, string> = {
  owner: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  member: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  viewer: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
}

function PersonCard({ person, type, currentTask }: { person: any; type: "agent" | "user"; currentTask?: string }) {
  const name = type === "agent" ? person.name : (person.displayName || person.display_name || person.username)
  const subtitle = type === "agent" ? person.type : person.role
  const status = type === "agent" ? person.status : (person.role === "pending" ? "pending" : "active")
  const dept = person.department || "—"
  const title = person.title || (type === "agent" ? person.model : "")

  return (
    <div className="bg-card border rounded-lg p-3 w-56 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          {type === "agent" ? (
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
          ) : person.avatarUrl || person.avatar_url ? (
            <img src={person.avatarUrl || person.avatar_url} alt="" className="h-9 w-9 rounded-full" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${statusColor[status] || "bg-gray-300"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{name}</p>
          <p className="text-xs text-muted-foreground truncate">{title || subtitle}</p>
          {dept !== "—" && <p className="text-xs text-muted-foreground">{dept}</p>}
        </div>
      </div>
      {currentTask && (
        <div className="mt-2 pt-2 border-t">
          <p className="text-xs text-muted-foreground truncate">
            <span className="text-emerald-600">●</span> {currentTask}
          </p>
        </div>
      )}
      <div className="mt-2">
        <Badge className={`text-[10px] px-1.5 py-0 ${roleColors[subtitle] || ""}`} variant="secondary">
          {subtitle}
        </Badge>
      </div>
    </div>
  )
}

function OrgTree({ agents, users: usersList, tasks }: { agents: any[]; users: any[]; tasks: any[] }) {
  // Group by department
  const departments = new Map<string, { agents: any[]; users: any[] }>()

  for (const a of agents) {
    const dept = a.department || "Unassigned"
    if (!departments.has(dept)) departments.set(dept, { agents: [], users: [] })
    departments.get(dept)!.agents.push(a)
  }

  for (const u of usersList) {
    if (u.role === "pending") continue
    const dept = u.department || "Unassigned"
    if (!departments.has(dept)) departments.set(dept, { agents: [], users: [] })
    departments.get(dept)!.users.push(u)
  }

  // Map tasks to agents
  const agentTasks = new Map<string, string>()
  for (const t of tasks) {
    const assigneeId = t.assignee_id || t.assigneeId
    if (assigneeId && (t.status === "in_progress" || t.status === "assigned")) {
      if (!agentTasks.has(assigneeId)) {
        agentTasks.set(assigneeId, t.title)
      }
    }
  }

  const sortedDepts = Array.from(departments.entries()).sort(([a], [b]) => {
    if (a === "Unassigned") return 1
    if (b === "Unassigned") return -1
    return a.localeCompare(b)
  })

  if (sortedDepts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="mx-auto mb-3 h-10 w-10 opacity-40" />
        <p>No team members or agents yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sortedDepts.map(([dept, members]) => (
        <div key={dept}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            {dept}
            <span className="text-xs font-normal">({members.users.length + members.agents.length})</span>
          </h3>
          <div className="flex flex-wrap gap-3 pl-4 border-l-2 border-muted">
            {members.users.map((u: any) => (
              <PersonCard key={u.id} person={u} type="user" />
            ))}
            {members.agents.map((a: any) => (
              <PersonCard key={a.id} person={a} type="agent" currentTask={agentTasks.get(a.id)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function TeamPage() {
  const { data: agentsData, isLoading: agentsLoading } = useAgents()
  const { data: usersData, isLoading: usersLoading } = useSWR("/v2/users-team", () => api.users.list())
  const { data: tasksData, isLoading: tasksLoading } = useTasks()

  const agents = (agentsData as any)?.agents || (Array.isArray(agentsData) ? agentsData : [])
  const usersList = (usersData as any)?.users || (Array.isArray(usersData) ? usersData : [])
  const tasks = (tasksData as any)?.tasks || (Array.isArray(tasksData) ? tasksData : [])

  const isLoading = agentsLoading || usersLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  const activeAgents = agents.filter((a: any) => a.status === "active").length
  const idleAgents = agents.filter((a: any) => a.status === "idle").length
  const pendingUsers = usersList.filter((u: any) => u.role === "pending").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">Your organization structure — humans and AI agents.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-sm text-muted-foreground">Team Members</p>
            <p className="text-2xl font-bold">{usersList.filter((u: any) => u.role !== "pending").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-sm text-muted-foreground">AI Agents</p>
            <p className="text-2xl font-bold">{agents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-sm text-muted-foreground">Active Agents</p>
            <p className="text-2xl font-bold text-emerald-600">{activeAgents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-sm text-muted-foreground">Pending Approval</p>
            <p className="text-2xl font-bold text-amber-600">{pendingUsers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Org Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <OrgTree agents={agents} users={usersList} tasks={tasks} />
        </CardContent>
      </Card>
    </div>
  )
}
