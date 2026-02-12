"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useAgents, useTasks, useProjects } from "@/hooks/use-api"
import useSWR from "swr"
import { api } from "@/lib/api"
import "./game-theme.css"

// ============================================================
// TYPES
// ============================================================
type UnitType = "agent" | "human"
type SelectedEntity = 
  | { kind: "unit"; id: string; type: UnitType }
  | { kind: "building"; id: string }
  | null

interface MapPosition { x: number; y: number }

// ============================================================
// HELPERS
// ============================================================
const BUILDING_ICONS: Record<string, string> = {
  active: "🏰", paused: "🏚️", completed: "✅", cancelled: "💀",
}

const AGENT_EMOJIS = ["🧝", "🧝‍♂️", "🧙", "🧙‍♂️", "🗡️", "⚔️", "🛡️", "🏹"]
const HUMAN_EMOJIS = ["👤", "👨‍💻", "👩‍💻", "🧑‍💼"]

function hashToEmoji(id: string, pool: string[]) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0
  return pool[Math.abs(h) % pool.length]
}

// Distribute entities on map in a nice layout
function distributePositions(count: number, area: { w: number; h: number }, seed: number = 0): MapPosition[] {
  const positions: MapPosition[] = []
  const cols = Math.ceil(Math.sqrt(count))
  const cellW = area.w / (cols + 1)
  const cellH = area.h / (Math.ceil(count / cols) + 1)
  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    positions.push({
      x: cellW * (col + 1) + (((seed + i * 7) % 30) - 15),
      y: cellH * (row + 1) + (((seed + i * 13) % 20) - 10),
    })
  }
  return positions
}

// ============================================================
// TOP BAR — Resource counters
// ============================================================
function TopBar({ agents, tasks, projects }: { agents: any[]; tasks: any[]; projects: any[] }) {
  const activeAgents = agents.filter(a => a.status === "active").length
  const activeTasks = tasks.filter(t => t.status === "in_progress").length
  const completedTasks = tasks.filter(t => t.status === "completed").length

  return (
    <div className="game-top-bar">
      <div className="game-resource">
        <span className="game-resource-icon">🏰</span>
        <span>Projects:</span>
        <span className="game-resource-value">{projects.length}</span>
      </div>
      <div className="game-resource">
        <span className="game-resource-icon">⚔️</span>
        <span>Active Agents:</span>
        <span className="game-resource-value">{activeAgents}/{agents.length}</span>
      </div>
      <div className="game-resource">
        <span className="game-resource-icon">📜</span>
        <span>Tasks:</span>
        <span className="game-resource-value">{activeTasks} active / {completedTasks} done</span>
      </div>
      <div className="game-resource" style={{ marginLeft: "auto" }}>
        <span className="game-resource-icon">⏱️</span>
        <span className="game-resource-value">{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  )
}

// ============================================================
// MINIMAP
// ============================================================
function Minimap({ 
  buildings, units, mapSize, selected 
}: { 
  buildings: { id: string; pos: MapPosition }[]
  units: { id: string; type: UnitType; pos: MapPosition }[]
  mapSize: { w: number; h: number }
  selected: SelectedEntity
}) {
  const scale = { x: 180 / mapSize.w, y: 180 / mapSize.h }
  return (
    <div className="game-minimap">
      {buildings.map(b => (
        <div
          key={b.id}
          className="game-minimap-dot building"
          style={{ left: b.pos.x * scale.x, top: b.pos.y * scale.y }}
        />
      ))}
      {units.map(u => (
        <div
          key={u.id}
          className={`game-minimap-dot ${u.type}`}
          style={{ 
            left: u.pos.x * scale.x, top: u.pos.y * scale.y,
            boxShadow: selected?.id === u.id ? "0 0 6px var(--wc3-gold)" : "none"
          }}
        />
      ))}
    </div>
  )
}

// ============================================================
// BUILDING on map
// ============================================================
function Building({ 
  project, pos, isSelected, workers, onClick, onDragOver, onDrop 
}: {
  project: any
  pos: MapPosition
  isSelected: boolean
  workers: number
  onClick: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}) {
  const [isDropTarget, setIsDropTarget] = useState(false)

  return (
    <div
      className={`game-building ${isSelected ? "active" : ""} ${workers > 0 ? "working" : ""} ${isDropTarget ? "drop-target" : ""}`}
      style={{ left: pos.x - 60, top: pos.y - 50 }}
      onClick={onClick}
      onDragOver={(e) => { e.preventDefault(); setIsDropTarget(true); onDragOver(e) }}
      onDragLeave={() => setIsDropTarget(false)}
      onDrop={(e) => { setIsDropTarget(false); onDrop(e) }}
    >
      <div className="game-building-icon">
        {BUILDING_ICONS[project.status] || "🏰"}
      </div>
      <div className="game-building-name">{project.name}</div>
      <div className="game-building-workers">
        {workers > 0 ? `⚒️ ${workers} working` : "empty"}
      </div>
    </div>
  )
}

// ============================================================
// UNIT on map (agent or human)
// ============================================================
function Unit({
  entity, type, pos, isSelected, efficiency, onClick
}: {
  entity: any
  type: UnitType
  pos: MapPosition
  isSelected: boolean
  efficiency: number
  onClick: () => void
}) {
  const emoji = type === "agent" 
    ? hashToEmoji(entity.id, AGENT_EMOJIS) 
    : hashToEmoji(entity.id, HUMAN_EMOJIS)

  const isIdle = type === "agent" && entity.status === "idle"

  return (
    <div
      className={`game-unit ${type} ${isSelected ? "selected" : ""} ${isIdle ? "idle" : ""}`}
      style={{ left: pos.x - 26, top: pos.y - 30 }}
      onClick={onClick}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ id: entity.id, type }))
      }}
    >
      <div className="game-unit-avatar">
        {entity.avatarUrl ? (
          <img src={entity.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : emoji}
      </div>
      <div className="game-unit-hp">
        <div className="game-unit-hp-fill" style={{ width: `${efficiency}%` }} />
      </div>
      <div className="game-unit-name">{entity.name}</div>
    </div>
  )
}

// ============================================================
// PORTRAIT PANEL (bottom-left)
// ============================================================
function PortraitPanel({ selected, agents, projects }: { selected: SelectedEntity; agents: any[]; projects: any[] }) {
  if (!selected) {
    return (
      <div className="game-portrait">
        <div className="game-portrait-frame" style={{ borderColor: "#333" }}>
          <span style={{ opacity: 0.3 }}>❓</span>
        </div>
        <div className="game-portrait-name" style={{ color: "var(--wc3-text-dim)" }}>No Selection</div>
        <div className="game-portrait-type">Click a unit or building</div>
      </div>
    )
  }

  if (selected.kind === "unit") {
    const agent = agents.find(a => a.id === selected.id)
    if (!agent) return null
    const emoji = selected.type === "agent" ? hashToEmoji(agent.id, AGENT_EMOJIS) : hashToEmoji(agent.id, HUMAN_EMOJIS)
    return (
      <div className="game-portrait">
        <div className={`game-portrait-frame ${selected.type}`}>
          {emoji}
        </div>
        <div className="game-portrait-name">{agent.name}</div>
        <div className="game-portrait-type">
          {selected.type === "agent" ? `🧝 ${agent.type || "Agent"}` : "👤 Human"}
        </div>
        <div className="game-portrait-type" style={{ fontSize: "0.62rem" }}>
          {agent.status === "active" ? "🟢 Active" : "🟡 Idle"}
        </div>
      </div>
    )
  }

  if (selected.kind === "building") {
    const project = projects.find(p => p.id === selected.id)
    if (!project) return null
    return (
      <div className="game-portrait">
        <div className="game-portrait-frame building">
          {BUILDING_ICONS[project.status] || "🏰"}
        </div>
        <div className="game-portrait-name">{project.name}</div>
        <div className="game-portrait-type">🏰 {project.status}</div>
        <div className="game-portrait-type" style={{ fontSize: "0.62rem" }}>
          Priority: {project.priority || "normal"}
        </div>
      </div>
    )
  }

  return null
}

// ============================================================
// INFO PANEL (bottom-center) — bars, stats, description
// ============================================================
function InfoPanel({ selected, agents, projects, tasks }: {
  selected: SelectedEntity; agents: any[]; projects: any[]; tasks: any[]
}) {
  if (!selected) {
    return (
      <div className="game-info-panel">
        <p style={{ color: "var(--wc3-text-dim)", fontSize: "0.8rem", textAlign: "center", marginTop: 40 }}>
          Select a unit or building to view details
        </p>
      </div>
    )
  }

  if (selected.kind === "unit") {
    const agent = agents.find(a => a.id === selected.id)
    if (!agent) return null

    const agentTasks = tasks.filter(t => t.assigneeId === agent.id)
    const completed = agentTasks.filter(t => t.status === "completed").length
    const inProgress = agentTasks.filter(t => t.status === "in_progress").length
    const total = agentTasks.length
    const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0

    return (
      <div className="game-info-panel">
        <div className="game-info-bars">
          {/* Efficiency as HP */}
          <div className="wc3-bar">
            <div className="wc3-bar-fill hp" style={{ width: `${efficiency}%` }} />
            <div className="wc3-bar-text">⚡ Efficiency {efficiency}/100</div>
          </div>
          {/* Tasks progress as Mana */}
          <div className="wc3-bar">
            <div className="wc3-bar-fill mana" style={{ width: total > 0 ? `${(inProgress / Math.max(total, 1)) * 100}%` : "0%" }} />
            <div className="wc3-bar-text">📋 Active Tasks {inProgress}/{total}</div>
          </div>
          {/* XP bar - completed tasks */}
          <div className="wc3-bar">
            <div className="wc3-bar-fill xp" style={{ width: `${Math.min(completed * 10, 100)}%` }} />
            <div className="wc3-bar-text">⭐ XP {completed * 10}/100</div>
          </div>
        </div>

        <div className="game-stats">
          <div><b>Model:</b> {agent.model || "—"}</div>
          <div><b>Status:</b> {agent.status}</div>
          <div><b>Type:</b> {agent.type || "worker"}</div>
          <div><b>Tasks Done:</b> {completed}</div>
        </div>

        {agentTasks.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ color: "var(--wc3-gold)", fontSize: "0.75rem", marginBottom: 4 }}>📜 Active Quests:</div>
            {agentTasks.filter(t => t.status !== "completed").slice(0, 4).map((t: any) => (
              <div key={t.id} style={{ fontSize: "0.68rem", color: "var(--wc3-text-dim)", padding: "2px 0" }}>
                • {t.title} <span style={{ color: t.status === "in_progress" ? "var(--wc3-mana-blue)" : "var(--wc3-text-dim)" }}>
                  [{t.status?.replace("_", " ")}]
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (selected.kind === "building") {
    const project = projects.find(p => p.id === selected.id)
    if (!project) return null

    const projectTasks = tasks.filter(t => t.projectId === project.id)
    const completed = projectTasks.filter(t => t.status === "completed").length
    const total = projectTasks.length
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0
    const budget = (project.budgetUsd || 0) / 100
    const spent = (project.spentUsd || 0) / 100
    const budgetPct = budget > 0 ? Math.round((spent / budget) * 100) : 0

    return (
      <div className="game-info-panel">
        <div className="game-info-bars">
          <div className="wc3-bar">
            <div className="wc3-bar-fill hp" style={{ width: `${project.healthScore || 0}%` }} />
            <div className="wc3-bar-text">❤️ Health {project.healthScore || 0}/100</div>
          </div>
          <div className="wc3-bar">
            <div className="wc3-bar-fill progress" style={{ width: `${progress}%` }} />
            <div className="wc3-bar-text">⚒️ Progress {completed}/{total} tasks</div>
          </div>
          <div className="wc3-bar">
            <div className="wc3-bar-fill mana" style={{ width: `${Math.min(budgetPct, 100)}%` }} />
            <div className="wc3-bar-text">💰 Budget ${spent.toLocaleString()} / ${budget.toLocaleString()}</div>
          </div>
        </div>

        <div className="game-stats">
          <div><b>Status:</b> {project.status}</div>
          <div><b>Priority:</b> {project.priority || "normal"}</div>
          <div><b>Risk:</b> {project.riskLevel || "low"}</div>
          <div><b>Deadline:</b> {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}</div>
        </div>

        {project.description && (
          <p style={{ fontSize: "0.7rem", color: "var(--wc3-text-dim)", marginTop: 8 }}>
            {project.description}
          </p>
        )}
      </div>
    )
  }

  return null
}

// ============================================================
// COMMAND CARD (bottom-right) — actions
// ============================================================
function CommandCard({ selected, agents, onAction }: {
  selected: SelectedEntity
  agents: any[]
  onAction: (action: string, target?: string) => void
}) {
  const commands = selected?.kind === "unit" ? [
    { icon: "📋", label: "Tasks", hotkey: "T", action: "view-tasks" },
    { icon: "📊", label: "Stats", hotkey: "S", action: "view-stats" },
    { icon: "🏰", label: "Assign", hotkey: "A", action: "assign-project" },
    { icon: "⚡", label: "Activate", hotkey: "E", action: "activate" },
    { icon: "💬", label: "Chat", hotkey: "C", action: "chat" },
    { icon: "🔧", label: "Config", hotkey: "G", action: "config" },
    { icon: "📝", label: "Prompt", hotkey: "P", action: "prompt" },
    { icon: "🗑️", label: "Remove", hotkey: "R", action: "remove" },
  ] : selected?.kind === "building" ? [
    { icon: "📋", label: "Tasks", hotkey: "T", action: "view-tasks" },
    { icon: "🧝", label: "Hire", hotkey: "H", action: "hire-agent" },
    { icon: "📊", label: "Stats", hotkey: "S", action: "view-stats" },
    { icon: "⚙️", label: "Settings", hotkey: "G", action: "settings" },
    { icon: "🔗", label: "Links", hotkey: "L", action: "links" },
    { icon: "💰", label: "Budget", hotkey: "B", action: "budget" },
  ] : []

  // Pad to 12 slots
  while (commands.length < 12) commands.push({ icon: "", label: "", hotkey: "", action: "" })

  return (
    <div className="game-command-card">
      <div style={{ color: "var(--wc3-gold)", fontSize: "0.72rem", textAlign: "center" }}>
        {selected ? "Commands" : "—"}
      </div>
      <div className="game-command-grid">
        {commands.map((cmd, i) => (
          <div
            key={i}
            className={`game-cmd-btn ${!cmd.action ? "disabled" : ""}`}
            onClick={() => cmd.action && onAction(cmd.action, selected?.id)}
            title={cmd.label}
          >
            {cmd.icon}
            {cmd.hotkey && <span className="game-cmd-btn-hotkey">{cmd.hotkey}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// CHAT LOG (above HUD)
// ============================================================
function ChatLog() {
  // Could hook into real chat API later
  const messages = [
    { type: "system", text: "orkwork v2 Game View loaded" },
    { type: "system", text: "Drag agents to buildings to assign them" },
  ]

  return (
    <div className="game-chat">
      {messages.map((m, i) => (
        <div key={i} className={`game-chat-line ${m.type}`}>{m.text}</div>
      ))}
    </div>
  )
}

// ============================================================
// MAIN GAME PAGE
// ============================================================
export default function GamePage() {
  const { data: agents } = useAgents()
  const { data: tasks } = useTasks()
  const { data: projects } = useProjects()

  const [selected, setSelected] = useState<SelectedEntity>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  const agentsList: any[] = Array.isArray(agents) ? agents : []
  const tasksList: any[] = Array.isArray(tasks) ? tasks : []
  const projectsList: any[] = Array.isArray(projects) ? projects : []

  // Generate stable positions
  const mapSize = { w: 1200, h: 600 }
  const buildingPositions = distributePositions(projectsList.length, { w: mapSize.w * 0.9, h: mapSize.h * 0.7 }, 42)
  const unitPositions = distributePositions(agentsList.length, { w: mapSize.w * 0.8, h: mapSize.h * 0.6 }, 17)

  // Count workers per project
  const workersPerProject: Record<string, number> = {}
  tasksList.forEach((t: any) => {
    if (t.projectId && (String(t.status) === "in_progress" || String(t.status) === "assigned" || String(t.status) === "in-progress")) {
      workersPerProject[t.projectId] = (workersPerProject[t.projectId] || 0) + 1
    }
  })

  // Calculate efficiency per agent
  const efficiencyPerAgent: Record<string, number> = {}
  agentsList.forEach(agent => {
    const at = tasksList.filter(t => t.assigneeId === agent.id)
    const done = at.filter(t => t.status === "completed").length
    efficiencyPerAgent[agent.id] = at.length > 0 ? Math.round((done / at.length) * 100) : (agent.status === "active" ? 50 : 10)
  })

  const handleAction = useCallback((action: string, targetId?: string) => {
    // TODO: wire up real actions
    console.log("Action:", action, "Target:", targetId)
  }, [])

  const handleDrop = useCallback((projectId: string, e: React.DragEvent) => {
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"))
      console.log(`Assign ${data.type} ${data.id} to project ${projectId}`)
      // TODO: API call to assign agent to project
    } catch {}
  }, [])

  // Build minimap data
  const minimapBuildings = projectsList.map((p, i) => ({
    id: p.id,
    pos: buildingPositions[i] || { x: 0, y: 0 },
  }))

  const minimapUnits = agentsList.map((a, i) => ({
    id: a.id,
    type: "agent" as UnitType,
    pos: unitPositions[i] || { x: 0, y: 0 },
  }))

  return (
    <div className="game-view">
      {/* Top resource bar */}
      <TopBar agents={agentsList} tasks={tasksList} projects={projectsList} />

      {/* Map area */}
      <div 
        className="game-map" 
        ref={mapRef}
        style={{ marginTop: 32 }}
        onClick={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("game-map-grid")) {
            setSelected(null)
          }
        }}
      >
        <div className="game-map-grid" />

        {/* Buildings */}
        {projectsList.map((project, i) => (
          <Building
            key={project.id}
            project={project}
            pos={buildingPositions[i] || { x: 100, y: 100 }}
            isSelected={selected?.kind === "building" && selected.id === project.id}
            workers={workersPerProject[project.id] || 0}
            onClick={() => setSelected({ kind: "building", id: project.id })}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(project.id, e)}
          />
        ))}

        {/* Units (agents) */}
        {agentsList.map((agent, i) => (
          <Unit
            key={agent.id}
            entity={agent}
            type="agent"
            pos={unitPositions[i] || { x: 50, y: 50 }}
            isSelected={selected?.kind === "unit" && selected.id === agent.id}
            efficiency={efficiencyPerAgent[agent.id] || 0}
            onClick={() => setSelected({ kind: "unit", id: agent.id, type: "agent" })}
          />
        ))}
      </div>

      {/* Minimap */}
      <Minimap 
        buildings={minimapBuildings}
        units={minimapUnits}
        mapSize={mapSize}
        selected={selected}
      />

      {/* Chat log */}
      <ChatLog />

      {/* Bottom HUD */}
      <div className="game-hud">
        <PortraitPanel selected={selected} agents={agentsList} projects={projectsList} />
        <InfoPanel selected={selected} agents={agentsList} projects={projectsList} tasks={tasksList} />
        <CommandCard selected={selected} agents={agentsList} onAction={handleAction} />
      </div>
    </div>
  )
}
