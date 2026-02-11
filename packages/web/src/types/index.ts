// User types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: string
  createdAt: string
  updatedAt: string
}

// Agent types
export interface Agent {
  id: string
  name: string
  type: string
  status: 'active' | 'idle' | 'error' | 'disabled'
  description?: string
  currentTask?: string
  performance: {
    score: number
    tasksCompleted: number
    averageResponseTime: number
    uptime: number
  }
  health: {
    status: 'healthy' | 'warning' | 'critical'
    lastCheck: string
    issues?: string[]
  }
  createdAt: string
  updatedAt: string
}

// Project types
export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  progress: {
    completed: number
    total: number
    percentage: number
  }
  health: {
    score: number
    status: 'healthy' | 'at-risk' | 'critical'
  }
  budget: {
    allocated: number
    spent: number
    remaining: number
  }
  priority: 'low' | 'normal' | 'high' | 'urgent'
  dueDate?: string
  createdAt: string
  updatedAt: string
}

// Task types
export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  assignedAgent?: string
  projectId?: string
  estimatedDuration?: number
  actualDuration?: number
  dueDate?: string
  createdAt: string
  updatedAt: string
}

// Decision types
export interface Decision {
  id: string
  title: string
  description: string
  context: any
  type: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  requiredBy?: string
  options?: string[]
  impact: 'low' | 'medium' | 'high'
  createdAt: string
}

// Intelligence types
export interface Brief {
  summary: {
    activeAgents: number
    completedTasks: number
    pendingDecisions: number
    systemHealth: number
  }
  events: {
    id: string
    type: string
    description: string
    timestamp: string
    impact: 'low' | 'medium' | 'high'
  }[]
  recommendations: {
    id: string
    type: string
    title: string
    description: string
    priority: 'low' | 'normal' | 'high' | 'urgent'
  }[]
  risks: {
    id: string
    title: string
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    probability: number
  }[]
  generatedAt: string
}

export interface Anomaly {
  id: string
  type: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  detectedAt: string
  resolved: boolean
  affectedSystems: string[]
}

// Cost types
export interface CostSummary {
  current: {
    daily: number
    weekly: number
    monthly: number
  }
  breakdown: {
    category: string
    amount: number
    percentage: number
  }[]
  trends: {
    period: string
    amount: number
    change: number
  }[]
  budget: {
    allocated: number
    spent: number
    remaining: number
    burnRate: number
  }
}

// Health types
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  responseTime: number
  version: string
  services: {
    name: string
    status: 'healthy' | 'degraded' | 'down'
    responseTime?: number
    lastCheck: string
  }[]
  timestamp: string
}

// Activity Feed types
export interface ActivityEvent {
  id: string
  type: 'agent' | 'task' | 'project' | 'decision' | 'system'
  title: string
  description: string
  timestamp: string
  agentName?: string
  metadata?: any
}