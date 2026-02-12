"use client"

import { useState, useMemo, useCallback } from "react"
import useSWR, { mutate } from "swr"
import { Bot, User, Users, X, Save, Plus, ChevronDown, ChevronRight } from "lucide-react"
import { api } from "@/lib/api"
import { useAgents, useTasks } from "@/hooks/use-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const statusColor: Record<string, string> = {
  active: "bg-emerald-500",
  idle: "bg-amber-400",
  error: "bg-red-500",
  disabled: "bg-gray-400",
  pending: "bg-gray-300",
}

const statusLabel: Record<string, string> = {
  active: "Active",
  idle: "Idle",
  error: "Error",
  disabled: "Disabled",
  pending: "Pending",
}

// ─── Types ───
interface OrgNode {
  id: string
  name: string
  subtitle: string
  department: string
  status: string
  type: "agent" | "user"
  avatarUrl?: string
  currentTask?: string
  raw: any
  children: OrgNode[]
}

// ─── Build tree from flat data ───
function buildTree(agents: any[], users: any[], tasks: any[]): OrgNode {
  const taskMap = new Map<string, string>()
  for (const t of tasks) {
    const aid = t.assignee_id || t.assigneeId
    if (aid && (t.status === "in_progress" || t.status === "assigned") && !taskMap.has(aid)) {
      taskMap.set(aid, t.title)
    }
  }

  // Find CEO user (owner)
  const ceo = users.find((u: any) => u.role === "owner") || users[0]

  // Build agent nodes
  const agentNodes = new Map<string, OrgNode>()
  for (const a of agents) {
    agentNodes.set(a.id, {
      id: a.id,
      name: a.name,
      subtitle: a.type || "agent",
      department: a.department || "",
      status: a.status || "idle",
      type: "agent",
      currentTask: taskMap.get(a.id),
      raw: a,
      children: [],
    })
  }

  // Find root agent (reports_to = null)
  let rootAgentId: string | null = null
  for (const a of agents) {
    const reportsTo = a.reports_to || a.reportsTo
    if (!reportsTo) {
      rootAgentId = a.id
    } else if (agentNodes.has(reportsTo)) {
      agentNodes.get(reportsTo)!.children.push(agentNodes.get(a.id)!)
    }
  }

  // CEO node at the top
  const ceoNode: OrgNode = {
    id: ceo?.id || "ceo",
    name: ceo?.displayName || ceo?.display_name || ceo?.username || "CEO",
    subtitle: ceo?.title || ceo?.role || "CEO",
    department: ceo?.department || "Executive",
    status: "active",
    type: "user",
    avatarUrl: ceo?.avatarUrl || ceo?.avatar_url,
    raw: ceo,
    children: [],
  }

  if (rootAgentId && agentNodes.has(rootAgentId)) {
    ceoNode.children.push(agentNodes.get(rootAgentId)!)
  } else {
    // No root agent, attach all agents directly
    for (const a of agents) {
      const reportsTo = a.reports_to || a.reportsTo
      if (!reportsTo) ceoNode.children.push(agentNodes.get(a.id)!)
    }
  }

  return ceoNode
}

// ─── Tree Node Component ───
function TreeNode({ node, onSelect, selectedId, isRoot }: {
  node: OrgNode
  onSelect: (n: OrgNode) => void
  selectedId: string | null
  isRoot?: boolean
}) {
  const isSelected = node.id === selectedId
  const hasChildren = node.children.length > 0

  return (
    <div className="flex flex-col items-center">
      {/* The card */}
      <button
        onClick={() => onSelect(node)}
        className={`relative bg-card border-2 rounded-xl px-4 py-3 w-48 shadow-sm hover:shadow-lg transition-all cursor-pointer text-left
          ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"}
          ${isRoot ? "bg-gradient-to-b from-emerald-500/10 to-transparent border-emerald-500/50" : ""}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative flex-shrink-0">
            {node.type === "agent" ? (
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            ) : node.avatarUrl ? (
              <img src={node.avatarUrl} alt="" className="h-9 w-9 rounded-full" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${statusColor[node.status] || "bg-gray-300"}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">{node.name}</p>
            <p className="text-xs text-muted-foreground truncate">{node.subtitle}</p>
            {node.department && <p className="text-[10px] text-muted-foreground/70">{node.department}</p>}
          </div>
        </div>
        {node.currentTask && (
          <div className="mt-2 pt-1.5 border-t border-border/50">
            <p className="text-[11px] text-muted-foreground truncate">
              <span className="text-emerald-500">●</span> {node.currentTask}
            </p>
          </div>
        )}
      </button>

      {/* Children with connectors */}
      {hasChildren && (
        <>
          {/* Vertical line down from parent */}
          <div className="w-px h-6 bg-border" />

          {/* Horizontal bar + children */}
          <div className="relative flex">
            {/* Horizontal connector bar */}
            {node.children.length > 1 && (
              <div className="absolute top-0 bg-border h-px"
                style={{
                  left: `calc(${100 / (node.children.length * 2)}% )`,
                  right: `calc(${100 / (node.children.length * 2)}% )`,
                }}
              />
            )}

            {/* Child nodes */}
            <div className="flex gap-4">
              {node.children.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  {/* Vertical line from horizontal bar to child */}
                  <div className="w-px h-6 bg-border" />
                  <TreeNode node={child} onSelect={onSelect} selectedId={selectedId} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Side Panel ───
function DetailPanel({ node, onClose, agents, projects, tasks, onRefresh }: {
  node: OrgNode
  onClose: () => void
  agents: any[]
  projects: any[]
  tasks: any[]
  onRefresh: () => void
}) {
  const [dept, setDept] = useState(node.department)
  const [reportsTo, setReportsTo] = useState(node.raw?.reports_to || node.raw?.reportsTo || "")
  const [systemPrompt, setSystemPrompt] = useState(node.raw?.system_prompt || node.raw?.systemPrompt || "")
  const [saving, setSaving] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState("normal")

  const nodeTasks = tasks.filter((t: any) => {
    const aid = t.assignee_id || t.assigneeId
    return aid === node.id
  })

  const otherAgents = agents.filter((a: any) => a.id !== node.id)

  async function handleSave() {
    if (node.type !== "agent") return
    setSaving(true)
    try {
      await api.agents.update(node.id, {
        department: dept,
        reportsTo: reportsTo || null,
        systemPrompt,
      })
      onRefresh()
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  async function handleCreateTask() {
    if (!newTaskTitle.trim()) return
    try {
      await api.tasks.create({
        title: newTaskTitle,
        assigneeId: node.id,
        priority: newTaskPriority,
      })
      setNewTaskTitle("")
      onRefresh()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {node.type === "agent" ? (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
          ) : node.avatarUrl ? (
            <img src={node.avatarUrl} alt="" className="h-10 w-10 rounded-full" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg">{node.name}</h3>
            <p className="text-sm text-muted-foreground">{node.subtitle}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${statusColor[node.status]}`} />
          <span className="text-sm">{statusLabel[node.status] || node.status}</span>
          {node.type === "agent" && (
            <Badge variant="secondary" className="text-xs ml-auto">{node.raw?.model || ""}</Badge>
          )}
        </div>

        {/* Department */}
        {node.type === "agent" && (
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</label>
            <Input value={dept} onChange={(e) => setDept(e.target.value)} className="mt-1" />
          </div>
        )}

        {/* Reports To */}
        {node.type === "agent" && (
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reports To</label>
            <select
              value={reportsTo}
              onChange={(e) => setReportsTo(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">— None (top level) —</option>
              {otherAgents.map((a: any) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* System Prompt */}
        {node.type === "agent" && (
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">System Prompt</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-y min-h-[80px]"
            />
          </div>
        )}

        {/* Save button */}
        {node.type === "agent" && (
          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        )}

        {/* Assigned Tasks */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Tasks ({nodeTasks.length})
          </h4>
          {nodeTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks assigned</p>
          ) : (
            <div className="space-y-1.5">
              {nodeTasks.map((t: any) => (
                <div key={t.id} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
                    t.status === "completed" ? "bg-emerald-500" :
                    t.status === "in_progress" ? "bg-blue-500" :
                    "bg-gray-400"
                  }`} />
                  <span className="truncate flex-1">{t.title}</span>
                  <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Task */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Add Task</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs w-20"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <Button onClick={handleCreateTask} size="sm" variant="outline" className="mt-2 w-full">
            <Plus className="h-3 w-3 mr-1" /> Create Task
          </Button>
        </div>

        {/* Projects */}
        {node.type === "agent" && projects.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Projects</h4>
            <div className="space-y-1">
              {projects.map((p: any) => (
                <div key={p.id} className="text-sm p-2 rounded bg-muted/50 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${p.status === "active" ? "bg-emerald-500" : "bg-gray-400"}`} />
                  <span className="truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ───
export default function TeamPage() {
  const { data: agentsData, isLoading: agentsLoading, mutate: mutateAgents } = useAgents()
  const { data: usersData, isLoading: usersLoading } = useSWR("/v2/users-team", () => api.users.list())
  const { data: tasksData, mutate: mutateTasks } = useTasks()
  const { data: projectsData } = useSWR("/v2/projects-team", () => api.projects.list())

  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null)

  const agents = useMemo(() => {
    const d = agentsData as any
    return d?.agents || (Array.isArray(d) ? d : [])
  }, [agentsData])

  const usersList = useMemo(() => {
    const d = usersData as any
    return d?.users || (Array.isArray(d) ? d : [])
  }, [usersData])

  const tasks = useMemo(() => {
    const d = tasksData as any
    return d?.tasks || (Array.isArray(d) ? d : [])
  }, [tasksData])

  const projects = useMemo(() => {
    const d = projectsData as any
    return d?.projects || (Array.isArray(d) ? d : [])
  }, [projectsData])

  const tree = useMemo(() => {
    if (!agents.length && !usersList.length) return null
    return buildTree(agents, usersList, tasks)
  }, [agents, usersList, tasks])

  const handleRefresh = useCallback(() => {
    mutateAgents()
    mutateTasks()
  }, [mutateAgents, mutateTasks])

  const isLoading = agentsLoading || usersLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  const activeAgents = agents.filter((a: any) => a.status === "active").length
  const pendingUsers = usersList.filter((u: any) => u.role === "pending").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">Interactive organization chart — humans and AI agents.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card><CardContent className="pt-4 pb-3">
          <p className="text-sm text-muted-foreground">Team Members</p>
          <p className="text-2xl font-bold">{usersList.filter((u: any) => u.role !== "pending").length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3">
          <p className="text-sm text-muted-foreground">AI Agents</p>
          <p className="text-2xl font-bold">{agents.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3">
          <p className="text-sm text-muted-foreground">Active Agents</p>
          <p className="text-2xl font-bold text-emerald-600">{activeAgents}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3">
          <p className="text-sm text-muted-foreground">Pending Approval</p>
          <p className="text-2xl font-bold text-amber-600">{pendingUsers}</p>
        </CardContent></Card>
      </div>

      {/* Org Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Organization Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-8">
            <div className="flex justify-center min-w-fit py-4">
              {tree ? (
                <TreeNode
                  node={tree}
                  onSelect={setSelectedNode}
                  selectedId={selectedNode?.id || null}
                  isRoot
                />
              ) : (
                <p className="text-muted-foreground">No team members found.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side Panel */}
      {selectedNode && (
        <DetailPanel
          key={selectedNode.id}
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          agents={agents}
          projects={projects}
          tasks={tasks}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  )
}
