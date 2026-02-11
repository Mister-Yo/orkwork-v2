"use client"

import useSWR from 'swr'
import { api } from '@/lib/api'
import type { 
  Agent, 
  Project, 
  Task, 
  Decision, 
  Brief, 
  Anomaly, 
  CostSummary, 
  HealthStatus,
  ActivityEvent
} from '@/types'

// Intelligence hooks
export function useIntelligenceBrief() {
  return useSWR<Brief>(
    '/v2/intelligence/brief',
    () => api.intelligence.brief(),
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      revalidateOnFocus: true,
    }
  )
}

export function useIntelligenceAnomalies() {
  return useSWR<Anomaly[]>(
    '/v2/intelligence/anomalies',
    () => api.intelligence.anomalies(),
    {
      refreshInterval: 2 * 60 * 1000, // 2 minutes
    }
  )
}

// Decisions hooks
export function useDecisionsPending() {
  return useSWR<Decision[]>(
    '/v2/decisions/pending',
    () => api.decisions.pending(),
    {
      refreshInterval: 30 * 1000, // 30 seconds
      revalidateOnFocus: true,
    }
  )
}

// Agents hooks
export function useAgents() {
  return useSWR<Agent[]>(
    '/v2/agents',
    () => api.agents.list(),
    {
      refreshInterval: 60 * 1000, // 1 minute
      revalidateOnFocus: true,
    }
  )
}

export function useAgent(id: string) {
  return useSWR<Agent>(
    id ? `/v2/agents/${id}` : null,
    () => api.agents.get(id),
    {
      refreshInterval: 30 * 1000, // 30 seconds
    }
  )
}

export function useAgentPerformance(id: string) {
  return useSWR<any>(
    id ? `/v2/agents/${id}/performance` : null,
    () => api.agents.performance(id),
    {
      refreshInterval: 2 * 60 * 1000, // 2 minutes
    }
  )
}

export function useAgentHealth(id: string) {
  return useSWR<any>(
    id ? `/v2/agents/${id}/health` : null,
    () => api.agents.health(id),
    {
      refreshInterval: 30 * 1000, // 30 seconds
    }
  )
}

// Projects hooks
export function useProjects() {
  return useSWR<Project[]>(
    '/v2/projects',
    () => api.projects.list(),
    {
      refreshInterval: 2 * 60 * 1000, // 2 minutes
      revalidateOnFocus: true,
    }
  )
}

export function useProject(id: string) {
  return useSWR<Project>(
    id ? `/v2/projects/${id}` : null,
    () => api.projects.get(id),
    {
      refreshInterval: 60 * 1000, // 1 minute
    }
  )
}

// Tasks hooks
export function useTasks() {
  return useSWR<Task[]>(
    '/v2/tasks',
    () => api.tasks.list(),
    {
      refreshInterval: 30 * 1000, // 30 seconds
      revalidateOnFocus: true,
    }
  )
}

export function useTask(id: string) {
  return useSWR<Task>(
    id ? `/v2/tasks/${id}` : null,
    () => api.tasks.get(id),
    {
      refreshInterval: 30 * 1000, // 30 seconds
    }
  )
}

export function useTasksGraph() {
  return useSWR<any>(
    '/v2/tasks/graph',
    () => api.tasks.graph(),
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
    }
  )
}

// Costs hooks
export function useCostsSummary() {
  return useSWR<CostSummary>(
    '/v2/costs/summary',
    () => api.costs.summary(),
    {
      refreshInterval: 10 * 60 * 1000, // 10 minutes
      revalidateOnFocus: true,
    }
  )
}

export function useCostsForecast() {
  return useSWR<any>(
    '/v2/costs/forecast',
    () => api.costs.forecast(),
    {
      refreshInterval: 30 * 60 * 1000, // 30 minutes
    }
  )
}

// Health hooks
export function useHealth() {
  return useSWR<HealthStatus>(
    '/health',
    () => api.health(),
    {
      refreshInterval: 30 * 1000, // 30 seconds
      revalidateOnFocus: true,
    }
  )
}

// Generic hook for manual SWR with consistent error handling
export function useApiData<T>(key: string | null, fetcher: () => Promise<T>, options = {}) {
  return useSWR<T>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      ...options,
    }
  )
}