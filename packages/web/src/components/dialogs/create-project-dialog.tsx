"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { useSWRConfig } from "swr"

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { mutate } = useSWRConfig()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("normal")
  const [budgetUsd, setBudgetUsd] = useState("")
  const [deadline, setDeadline] = useState("")
  const [riskLevel, setRiskLevel] = useState("low")

  const reset = () => {
    setName(""); setDescription(""); setPriority("normal"); setBudgetUsd(""); setDeadline(""); setRiskLevel("low"); setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError("Name is required"); return }
    setLoading(true)
    setError("")
    try {
      await api.projects.create({
        name: name.trim(),
        description: description.trim() || undefined,
        priority,
        budgetUsd: budgetUsd ? Math.round(parseFloat(budgetUsd) * 100) : undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        riskLevel: riskLevel,
      })
      await mutate("/v2/projects")
      reset()
      setOpen(false)
    } catch (err: any) {
      setError(err.message || "Failed to create project")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" /> New Project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="proj-name">Name *</Label>
            <Input id="proj-name" value={name} onChange={e => setName(e.target.value)} placeholder="Project name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proj-desc">Description</Label>
            <textarea id="proj-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Project description..." rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={riskLevel} onValueChange={setRiskLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proj-budget">Budget (USD)</Label>
              <Input id="proj-budget" type="number" min="0" step="0.01" value={budgetUsd} onChange={e => setBudgetUsd(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proj-deadline">Deadline</Label>
              <Input id="proj-deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Project"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
