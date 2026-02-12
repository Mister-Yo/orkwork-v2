"use client"

import { useState, useMemo } from "react"
import { Bot, User, Users, Circle, Plus, Edit3, UserPlus } from "lucide-react"
import { api } from "@/lib/api"
import { useAgents, useTasks } from "@/hooks/use-api"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// Textarea component not available - using HTML textarea
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface OrgNode {
  id: string
  name: string
  type: "user" | "agent"
  role: string
  department: string
  title?: string
  status: string
  reports_to?: string
  system_prompt?: string
  model?: string
  avatarUrl?: string
  currentTask?: string
  children: OrgNode[]
}

function OrgNode({ node, level = 0, onNodeClick }: { node: OrgNode; level?: number; onNodeClick: (node: OrgNode) => void }) {
  const hasChildren = node.children.length > 0
  
  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div 
        className="relative bg-card border rounded-xl p-4 w-64 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:scale-105 z-10"
        onClick={() => onNodeClick(node)}
      >
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            {node.type === "agent" ? (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
            ) : node.avatarUrl ? (
              <img src={node.avatarUrl} alt="" className="h-12 w-12 rounded-full" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-card ${statusColor[node.status] || "bg-gray-300"}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm truncate">{node.name}</h4>
            <p className="text-xs text-muted-foreground truncate">{node.title || node.role}</p>
            <p className="text-xs text-muted-foreground">{node.department}</p>
          </div>
        </div>
        
        {node.currentTask && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground truncate">
              <span className="text-emerald-600">●</span> {node.currentTask}
            </p>
          </div>
        )}
        
        <div className="mt-3 flex gap-1">
          <Badge className={`text-[10px] px-1.5 py-0 ${roleColors[node.role] || ""}`} variant="secondary">
            {node.type === "agent" ? node.model : node.role}
          </Badge>
          {node.type === "agent" && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {node.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Connecting Lines and Children */}
      {hasChildren && (
        <div className="relative">
          {/* Vertical line down */}
          <div className="w-px bg-border h-8 mx-auto" />
          
          {/* Horizontal line across children */}
          {node.children.length > 1 && (
            <div className="relative h-px bg-border" style={{ width: `${(node.children.length - 1) * 280 + 64}px`, left: `${-((node.children.length - 1) * 140)}px` }} />
          )}
          
          {/* Children container */}
          <div className="flex gap-6 mt-0">
            {node.children.map((child, index) => (
              <div key={child.id} className="relative">
                {/* Vertical line up to child */}
                {node.children.length > 1 && (
                  <div className="w-px bg-border h-8 mx-auto -mt-px" />
                )}
                <div className={node.children.length === 1 ? "mt-0" : "mt-0"}>
                  <OrgNode node={child} level={level + 1} onNodeClick={onNodeClick} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NodeDetailPanel({ 
  node, 
  isOpen, 
  onClose, 
  agents, 
  projects, 
  onUpdateNode,
  onCreateTask
}: { 
  node: OrgNode | null
  isOpen: boolean
  onClose: () => void
  agents: any[]
  projects: any[]
  onUpdateNode: (id: string, data: any) => Promise<void>
  onCreateTask: (data: any) => Promise<void>
}) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [newTask, setNewTask] = useState({ title: "", priority: "medium" })
  const [assignProject, setAssignProject] = useState("")
  
  const { data: tasksData } = useTasks()
  const tasks = Array.isArray(tasksData) ? tasksData : (tasksData as any)?.tasks || []
  const nodeTasks = node ? tasks.filter((t: any) => t.assignee_id === node.id || t.assigneeId === node.id) : []

  if (!node) return null

  const potentialParents = agents.filter(a => a.id !== node.id && a.type === node.type)

  const handleSaveField = async (field: string) => {
    try {
      await onUpdateNode(node.id, { [field]: formData[field] })
      setEditingField(null)
    } catch (error) {
      console.error("Failed to update:", error)
    }
  }

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return
    try {
      await onCreateTask({
        title: newTask.title,
        priority: newTask.priority,
        assignee_id: node.id,
        status: "assigned"
      })
      setNewTask({ title: "", priority: "medium" })
    } catch (error) {
      console.error("Failed to create task:", error)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {node.type === "agent" ? (
              <Bot className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
            {node.name}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-medium text-sm mb-3">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Name</label>
                {editingField === "name" ? (
                  <div className="flex gap-2 mt-1">
                    <Input 
                      value={formData.name || ""} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={() => handleSaveField("name")}>Save</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm">{node.name}</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditingField("name")
                        setFormData({...formData, name: node.name})
                      }}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Department</label>
                {editingField === "department" ? (
                  <div className="flex gap-2 mt-1">
                    <Input 
                      value={formData.department || ""} 
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={() => handleSaveField("department")}>Save</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm">{node.department}</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditingField("department")
                        setFormData({...formData, department: node.department})
                      }}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${statusColor[node.status] || "bg-gray-300"}`} />
                  <span className="text-sm capitalize">{node.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reports To (Agents only) */}
          {node.type === "agent" && (
            <div>
              <h3 className="font-medium text-sm mb-3">Reporting Structure</h3>
              <div>
                <label className="text-xs text-muted-foreground">Reports To</label>
                <Select 
                  value={node.reports_to || ""} 
                  onValueChange={(value) => onUpdateNode(node.id, { reports_to: value || null })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select parent agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No parent</SelectItem>
                    {potentialParents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* System Prompt (Agents only) */}
          {node.type === "agent" && (
            <div>
              <h3 className="font-medium text-sm mb-3">Configuration</h3>
              <div>
                <label className="text-xs text-muted-foreground">System Prompt</label>
                {editingField === "system_prompt" ? (
                  <div className="space-y-2 mt-1">
                    <textarea
                      value={formData.system_prompt || ""} 
                      onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveField("system_prompt")}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded text-xs">
                        {node.system_prompt || "No system prompt set"}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="ml-2"
                        onClick={() => {
                          setEditingField("system_prompt")
                          setFormData({...formData, system_prompt: node.system_prompt || ""})
                        }}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assign to Project */}
          <div>
            <h3 className="font-medium text-sm mb-3">Project Assignment</h3>
            <div className="flex gap-2">
              <Select value={assignProject} onValueChange={setAssignProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                size="sm" 
                disabled={!assignProject}
                onClick={() => {
                  // This would need project assignment API
                  console.log("Assign to project:", assignProject)
                  setAssignProject("")
                }}
              >
                Assign
              </Button>
            </div>
          </div>

          {/* Add Task */}
          <div>
            <h3 className="font-medium text-sm mb-3">Add Task</h3>
            <div className="space-y-3">
              <Input 
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              />
              <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleCreateTask} 
                disabled={!newTask.title.trim()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          </div>

          {/* Current Tasks */}
          {nodeTasks.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-3">Current Tasks ({nodeTasks.length})</h3>
              <div className="space-y-2">
                {nodeTasks.slice(0, 5).map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                    <span className="truncate">{task.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {task.status}
                    </Badge>
                  </div>
                ))}
                {nodeTasks.length > 5 && (
                  <p className="text-xs text-muted-foreground">+{nodeTasks.length - 5} more tasks</p>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function TeamPage() {
  const { data: agentsData, isLoading: agentsLoading, mutate: mutateAgents } = useAgents()
  const { data: usersData, isLoading: usersLoading } = useSWR("/v2/users-team", () => api.users.list())
  const { data: tasksData, isLoading: tasksLoading, mutate: mutateTasks } = useTasks()
  const { data: projectsData, isLoading: projectsLoading } = useSWR("/v2/projects", () => api.projects.list())
  
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const agents = (agentsData as any)?.agents || (Array.isArray(agentsData) ? agentsData : [])
  const usersList = (usersData as any)?.users || (Array.isArray(usersData) ? usersData : [])
  const tasks = (tasksData as any)?.tasks || (Array.isArray(tasksData) ? tasksData : [])
  const projects = (projectsData as any)?.projects || (Array.isArray(projectsData) ? projectsData : [])

  const isLoading = agentsLoading || usersLoading

  // Build org tree
  const orgTree = useMemo(() => {
    if (isLoading) return null

    // Map tasks to agents/users
    const taskMap = new Map<string, string>()
    tasks.forEach((task: any) => {
      const assigneeId = task.assignee_id || task.assigneeId
      if (assigneeId && (task.status === "in_progress" || task.status === "assigned")) {
        if (!taskMap.has(assigneeId)) {
          taskMap.set(assigneeId, task.title)
        }
      }
    })

    // Create nodes
    const nodeMap = new Map<string, OrgNode>()
    
    // Add CEO user
    const ceo = usersList.find((u: any) => u.id === "09670672-bfeb-455c-9e32-ab6aaea194ef")
    if (ceo) {
      nodeMap.set(ceo.id, {
        id: ceo.id,
        name: ceo.display_name || ceo.displayName || ceo.username,
        type: "user",
        role: ceo.role,
        department: ceo.department || "Executive",
        title: ceo.title,
        status: "active",
        avatarUrl: ceo.avatar_url || ceo.avatarUrl,
        children: []
      })
    }

    // Add all agents
    agents.forEach((agent: any) => {
      nodeMap.set(agent.id, {
        id: agent.id,
        name: agent.name,
        type: "agent",
        role: agent.type,
        department: agent.department || "AI",
        title: agent.model,
        status: agent.status,
        reports_to: agent.reports_to,
        system_prompt: agent.system_prompt,
        model: agent.model,
        currentTask: taskMap.get(agent.id),
        children: []
      })
    })

    // Build hierarchy
    const roots: OrgNode[] = []
    
    nodeMap.forEach((node) => {
      if (node.type === "user" || !node.reports_to) {
        roots.push(node)
      } else {
        const parent = nodeMap.get(node.reports_to)
        if (parent) {
          parent.children.push(node)
        } else {
          roots.push(node)
        }
      }
    })

    // Sort children by department then name
    const sortNodes = (nodes: OrgNode[]) => {
      nodes.sort((a, b) => {
        if (a.department !== b.department) {
          return a.department.localeCompare(b.department)
        }
        return a.name.localeCompare(b.name)
      })
      nodes.forEach(node => sortNodes(node.children))
    }
    
    sortNodes(roots)
    roots.forEach(root => sortNodes(root.children))

    return roots
  }, [agents, usersList, tasks, isLoading])

  const handleNodeClick = (node: OrgNode) => {
    setSelectedNode(node)
    setIsPanelOpen(true)
  }

  const handleUpdateNode = async (id: string, data: any) => {
    try {
      await api.agents.update(id, data)
      await mutateAgents()
    } catch (error) {
      console.error("Failed to update node:", error)
      throw error
    }
  }

  const handleCreateTask = async (data: any) => {
    try {
      await api.tasks.create(data)
      await mutateTasks()
    } catch (error) {
      console.error("Failed to create task:", error)
      throw error
    }
  }

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
  const pendingUsers = usersList.filter((u: any) => u.role === "pending").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">Interactive organization chart — humans and AI agents.</p>
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

      {/* Organization Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Organization Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!orgTree || orgTree.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p>No team members or agents yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="flex flex-col items-center gap-8 min-w-max p-4">
                {orgTree.map((root) => (
                  <OrgNode key={root.id} node={root} onNodeClick={handleNodeClick} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Side Panel */}
      <NodeDetailPanel
        node={selectedNode}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        agents={agents}
        projects={projects}
        onUpdateNode={handleUpdateNode}
        onCreateTask={handleCreateTask}
      />
    </div>
  )
}