"use client"

import { useState, useCallback } from "react"
import useSWR, { useSWRConfig } from "swr"
import { Settings, Copy, Trash2, Plus, AlertTriangle, Shield, Activity, Server, User, Users, Key, Clock, Check, X, ChevronDown } from "lucide-react"
import { useUser } from "@/lib/auth"
import { api } from "@/lib/api"
import { useAgents } from "@/hooks/use-api"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ─── Profile Tab ───────────────────────────────────────────
function ProfileTab() {
  const { user, isLoading } = useUser()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!user) return <p className="text-muted-foreground">Not logged in.</p>

  const fields = [
    { label: "Name", value: user.name || user.display_name || "—" },
    { label: "Email", value: user.email || "—" },
    { label: "Role", value: user.role || "—" },
    { label: "GitHub", value: user.github_username || "—" },
    { label: "Created", value: user.created_at ? new Date(user.created_at).toLocaleDateString() : "—" },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          {user.avatar_url || user.avatar ? (
            <img
              src={user.avatar_url || user.avatar}
              alt="Avatar"
              className="h-16 w-16 rounded-full border"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div>
            <CardTitle>{user.name || user.display_name || "User"}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label}>
              <Label className="text-muted-foreground text-xs">{f.label}</Label>
              <p className="mt-1 font-medium">{f.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── API Keys Tab ──────────────────────────────────────────
function ApiKeysTab() {
  const { data: agents, isLoading: agentsLoading } = useAgents()
  const [selectedAgent, setSelectedAgent] = useState<string>("")
  const { mutate } = useSWRConfig()

  const agentId = selectedAgent || agents?.[0]?.id || ""

  const { data: keys, isLoading: keysLoading } = useSWR(
    agentId ? `/v2/api-keys/${agentId}/keys` : null,
    () => api.apiKeys.list(agentId)
  )

  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyResult, setNewKeyResult] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleCreate = useCallback(async () => {
    if (!agentId || !newKeyName.trim()) return
    setCreating(true)
    try {
      const result = await api.apiKeys.create(agentId, {
        name: newKeyName.trim(),
        scopes: ["*"],
      })
      setNewKeyResult(result.key || result.rawKey || result.token || JSON.stringify(result))
      mutate(`/v2/api-keys/${agentId}/keys`)
      setNewKeyName("")
    } catch (e: any) {
      alert("Failed to create key: " + e.message)
    } finally {
      setCreating(false)
    }
  }, [agentId, newKeyName, mutate])

  const handleDelete = useCallback(async (keyId: string) => {
    if (!agentId || !confirm("Delete this API key?")) return
    setDeleting(keyId)
    try {
      await api.apiKeys.delete(agentId, keyId)
      mutate(`/v2/api-keys/${agentId}/keys`)
    } catch (e: any) {
      alert("Failed to delete key: " + e.message)
    } finally {
      setDeleting(null)
    }
  }, [agentId, mutate])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (agentsLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Select value={agentId} onValueChange={setSelectedAgent}>
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Select agent" />
          </SelectTrigger>
          <SelectContent>
            {(agents || []).map((a: any) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setShowCreate(true)} disabled={!agentId}>
          <Plus className="mr-1 h-4 w-4" /> Generate Key
        </Button>
      </div>

      {keysLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !keys || keys.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Key className="mx-auto mb-2 h-8 w-8 opacity-50" />
            No API keys for this agent.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(keys as any[]).map((k: any) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.name}</TableCell>
                  <TableCell>
                    <code className="text-xs">{k.prefix || k.key_prefix || "—"}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(k.scopes || []).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {k.created_at ? new Date(k.created_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(k.id)}
                      disabled={deleting === k.id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Key Dialog */}
      <Dialog open={showCreate && !newKeyResult} onOpenChange={(o) => { if (!o) setShowCreate(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate API Key</DialogTitle>
            <DialogDescription>Create a new API key for this agent.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Key Name</Label>
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. production-key"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !newKeyName.trim()}>
              {creating ? "Creating…" : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show Key Result */}
      <Dialog open={!!newKeyResult} onOpenChange={(o) => { if (!o) { setNewKeyResult(null); setShowCreate(false) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription className="flex items-center gap-1 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              Copy this key now — it won&apos;t be shown again!
            </DialogDescription>
          </DialogHeader>
          <div className="my-2 flex items-center gap-2 rounded-md bg-muted p-3">
            <code className="flex-1 break-all text-sm">{newKeyResult}</code>
            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(newKeyResult || "")}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => { setNewKeyResult(null); setShowCreate(false) }}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── SLA Rules Tab ─────────────────────────────────────────
function SlaRulesTab() {
  const { data: slaData, isLoading } = useSWR("/v2/sla", () => api.sla.list())
  const { data: violations } = useSWR("/v2/sla/violations", () => api.sla.violations())
  const { mutate } = useSWRConfig()

  const rules = slaData?.rules || (Array.isArray(slaData) ? slaData : [])

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: "", metric: "response_time", threshold: "", window: "1h" })
  const [creating, setCreating] = useState(false)

  const handleCreate = useCallback(async () => {
    setCreating(true)
    try {
      await api.sla.create({
        name: form.name,
        metric: form.metric,
        threshold: Number(form.threshold),
        window: form.window,
        escalation: { notify: true },
      })
      mutate("/v2/sla")
      setShowCreate(false)
      setForm({ name: "", metric: "response_time", threshold: "", window: "1h" })
    } catch (e: any) {
      alert("Failed: " + e.message)
    } finally {
      setCreating(false)
    }
  }, [form, mutate])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this SLA rule?")) return
    try {
      await api.sla.delete(id)
      mutate("/v2/sla")
    } catch (e: any) {
      alert("Failed: " + e.message)
    }
  }, [mutate])

  if (isLoading) return <Skeleton className="h-48 w-full" />

  const violationCount = Array.isArray(violations) ? violations.length : violations?.count || violations?.total || 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-medium">SLA Rules</h3>
          {violationCount > 0 && (
            <Badge variant="destructive">{violationCount} violation{violationCount !== 1 ? "s" : ""}</Badge>
          )}
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" /> New Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Shield className="mx-auto mb-2 h-8 w-8 opacity-50" />
            No SLA rules configured.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Metric</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Window</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.metric}</TableCell>
                  <TableCell>{r.threshold}</TableCell>
                  <TableCell>{r.window}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "violated" ? "destructive" : "secondary"}>
                      {r.status || "active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create SLA Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Response time SLA" />
            </div>
            <div>
              <Label>Metric</Label>
              <Select value={form.metric} onValueChange={(v) => setForm({ ...form, metric: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="response_time">Response Time</SelectItem>
                  <SelectItem value="completion_rate">Completion Rate</SelectItem>
                  <SelectItem value="error_rate">Error Rate</SelectItem>
                  <SelectItem value="throughput">Throughput</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Threshold</Label>
              <Input type="number" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} placeholder="e.g. 5000" />
            </div>
            <div>
              <Label>Window</Label>
              <Select value={form.window} onValueChange={(v) => setForm({ ...form, window: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5m">5 minutes</SelectItem>
                  <SelectItem value="15m">15 minutes</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !form.name || !form.threshold}>
              {creating ? "Creating…" : "Create Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── System Tab ────────────────────────────────────────────
function SystemTab() {
  const { data: health, isLoading: healthLoading } = useSWR("/health", () => api.health())
  const { data: auditStats, isLoading: statsLoading } = useSWR("/v2/audit/stats", () => api.audit.stats())

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-medium">System Health</h3>
        {healthLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : health ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Status</span>
                </div>
                <p className="mt-1 text-2xl font-bold">
                  <Badge variant={health.status === "ok" || health.status === "healthy" ? "default" : "destructive"}>
                    {health.status}
                  </Badge>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Version</span>
                </div>
                <p className="mt-1 text-2xl font-bold">{health.version || "—"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Uptime</span>
                </div>
                <p className="mt-1 text-lg font-bold">
                  {health.uptime ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : health.uptimeFormatted || "—"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Environment</span>
                </div>
                <p className="mt-1 text-2xl font-bold">{health.environment || health.env || "—"}</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p className="text-muted-foreground">Unable to fetch health data.</p>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 font-medium">Audit Activity (Last 7 Days)</h3>
        {statsLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : auditStats ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {auditStats.byAction && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">By Action</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {Object.entries(auditStats.byAction).map(([action, count]: [string, any]) => (
                      <div key={action} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{action}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {auditStats.byResource && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">By Resource</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {Object.entries(auditStats.byResource).map(([resource, count]: [string, any]) => (
                      <div key={resource} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{resource}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {auditStats.byActor && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">By Actor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {Object.entries(auditStats.byActor).map(([actor, count]: [string, any]) => (
                      <div key={actor} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{actor}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {!auditStats.byAction && !auditStats.byResource && !auditStats.byActor && (
              <Card className="sm:col-span-3">
                <CardContent className="py-4">
                  <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(auditStats, null, 2)}</pre>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Unable to fetch audit stats.</p>
        )}
      </div>
    </div>
  )
}


// ─── Team Tab ──────────────────────────────────────────────
function TeamTab() {
  const { user: currentUser } = useUser()
  const { data: usersData, isLoading, mutate: mutateUsers } = useSWR("/v2/users-list", () => api.users.list())
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const usersList = usersData?.users || (Array.isArray(usersData) ? usersData : [])
  const pendingUsers = usersList.filter((u: any) => u.role === "pending")
  const activeUsers = usersList.filter((u: any) => u.role !== "pending")

  const isOwner = currentUser?.role === "owner"

  async function handleApprove(id: string) {
    setActionLoading(id + "-approve")
    try {
      await api.users.approve(id)
      mutateUsers()
    } catch (e: any) {
      alert("Failed: " + e.message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Reject and remove this user?")) return
    setActionLoading(id + "-reject")
    try {
      await api.users.reject(id)
      mutateUsers()
    } catch (e: any) {
      alert("Failed: " + e.message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRoleChange(id: string, role: string) {
    try {
      await api.users.updateRole(id, role)
      mutateUsers()
    } catch (e: any) {
      alert("Failed: " + e.message)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this user?")) return
    setActionLoading(id + "-delete")
    try {
      await api.users.delete(id)
      mutateUsers()
    } catch (e: any) {
      alert("Failed: " + e.message)
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) return <Skeleton className="h-48 w-full" />

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner": return "default"
      case "admin": return "default"
      case "member": return "secondary"
      case "pending": return "outline"
      case "viewer": return "secondary"
      default: return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Pending Approval</h3>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              {pendingUsers.length}
            </Badge>
          </div>
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
            <div className="divide-y">
              {pendingUsers.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {u.avatarUrl || u.avatar_url ? (
                      <img src={u.avatarUrl || u.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{u.displayName || u.display_name || u.username}</p>
                      <p className="text-xs text-muted-foreground">{u.email || u.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(u.id)}
                      disabled={actionLoading === u.id + "-approve"}
                      className="gap-1"
                    >
                      <Check className="h-3 w-3" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(u.id)}
                      disabled={actionLoading === u.id + "-reject"}
                      className="gap-1"
                    >
                      <X className="h-3 w-3" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Active Team */}
      <div className="space-y-3">
        <h3 className="font-medium">Team Members</h3>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeUsers.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {u.avatarUrl || u.avatar_url ? (
                        <img src={u.avatarUrl || u.avatar_url} alt="" className="h-6 w-6 rounded-full" />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                          <User className="h-3 w-3" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{u.displayName || u.display_name || u.username}</p>
                        <p className="text-xs text-muted-foreground">{u.email || ""}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isOwner && u.id !== currentUser?.id ? (
                      <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v)}>
                        <SelectTrigger className="w-[110px] h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={roleBadgeVariant(u.role)}>{u.role}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.title || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.department || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.createdAt || u.created_at ? new Date(u.createdAt || u.created_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    {isOwner && u.id !== currentUser?.id && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(u.id)} disabled={actionLoading === u.id + "-delete"}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {activeUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No team members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}

// ─── Main Settings Page ────────────────────────────────────
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your profile, API keys, SLA rules, and system configuration.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="sla-rules">SLA Rules</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <TeamTab />
        </TabsContent>

        <TabsContent value="api-keys" className="mt-4">
          <ApiKeysTab />
        </TabsContent>

        <TabsContent value="sla-rules" className="mt-4">
          <SlaRulesTab />
        </TabsContent>

        <TabsContent value="system" className="mt-4">
          <SystemTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
