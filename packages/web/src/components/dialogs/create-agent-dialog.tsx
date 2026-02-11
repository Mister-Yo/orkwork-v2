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

export function CreateAgentDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { mutate } = useSWRConfig()

  const [name, setName] = useState("")
  const [type, setType] = useState("assistant")
  const [model, setModel] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [capabilities, setCapabilities] = useState("")

  const reset = () => {
    setName(""); setType("assistant"); setModel(""); setSystemPrompt(""); setCapabilities(""); setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !model.trim() || !systemPrompt.trim()) {
      setError("Name, model, and system prompt are required")
      return
    }
    setLoading(true)
    setError("")
    try {
      await api.agents.create({
        name: name.trim(),
        type,
        model: model.trim(),
        systemPrompt: systemPrompt.trim(),
        capabilities: capabilities ? capabilities.split(",").map(c => c.trim()).filter(Boolean) : [],
      })
      await mutate("/v2/agents")
      reset()
      setOpen(false)
    } catch (err: any) {
      setError(err.message || "Failed to create agent")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Agent</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Agent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="agent-name">Name *</Label>
            <Input id="agent-name" value={name} onChange={e => setName(e.target.value)} placeholder="Agent name" />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="assistant">Assistant</SelectItem>
                <SelectItem value="specialist">Specialist</SelectItem>
                <SelectItem value="researcher">Researcher</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent-model">Model *</Label>
            <Input id="agent-model" value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. gpt-4o" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent-prompt">System Prompt *</Label>
            <textarea id="agent-prompt" value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} placeholder="System prompt..." rows={4} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent-caps">Capabilities</Label>
            <Input id="agent-caps" value={capabilities} onChange={e => setCapabilities(e.target.value)} placeholder="code, search, browse (comma-separated)" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Agent"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
