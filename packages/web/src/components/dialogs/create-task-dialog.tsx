"use client"

import { useState } from "react"
import { Plus, Bot, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import useSWR, { useSWRConfig } from "swr"
import { useProjects, useAgents } from "@/hooks/use-api"

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { mutate } = useSWRConfig()
  const { data: projects } = useProjects()
  const projectsList = Array.isArray(projects) ? projects : []
  const { data: agentsData } = useAgents()
  const agentsList = (agentsData as any)?.agents || (Array.isArray(agentsData) ? agentsData : [])
  const { data: usersData } = useSWR("/v2/users-team", () => api.users.list())
  const usersList = (usersData as any)?.users || (Array.isArray(usersData) ? usersData : [])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [projectId, setProjectId] = useState("")
  const [priority, setPriority] = useState("normal")
  const [estimatedHours, setEstimatedHours] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [reviewRequired, setReviewRequired] = useState(false)
  const [assigneeId, setAssigneeId] = useState("")

  const reset = () => {
    setTitle(""); setDescription(""); setProjectId(""); setPriority("normal"); setEstimatedHours(""); setDueDate(""); setReviewRequired(false); setAssigneeId(""); setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError("Title is required"); return }
    setLoading(true)
    setError("")
    try {
      await api.tasks.create({
        title: title.trim(),
        description: description.trim() || undefined,
        projectId: projectId || undefined,
        priority,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
        dueDate: dueDate || undefined,
        reviewRequired: reviewRequired,
        assigneeId: assigneeId || undefined,
      })
      await mutate("/v2/tasks")
      reset()
      setOpen(false)
    } catch (err: any) {
      setError(err.message || "Failed to create task")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" /> New Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="task-title">Title *</Label>
            <Input id="task-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <textarea id="task-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Task description..." rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projectsList.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger><SelectValue placeholder="Select person or agent (optional)" /></SelectTrigger>
              <SelectContent>
                {usersList.filter((u: any) => u.role !== "pending").map((u: any) => (
                  <SelectItem key={u.id} value={u.id}>
                    <span className="flex items-center gap-2"><User className="h-3 w-3" /> {u.displayName || u.display_name || u.username}</span>
                  </SelectItem>
                ))}
                {agentsList.map((a: any) => (
                  <SelectItem key={a.id} value={a.id}>
                    <span className="flex items-center gap-2"><Bot className="h-3 w-3" /> {a.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-hours">Estimated Hours</Label>
              <Input id="task-hours" type="number" min="0" step="0.5" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-due">Due Date</Label>
              <Input id="task-due" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="task-review" type="checkbox" checked={reviewRequired} onChange={e => setReviewRequired(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
            <Label htmlFor="task-review" className="text-sm font-normal">Review required</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Task"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
