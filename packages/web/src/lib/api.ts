const API_BASE = '/api';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 
      'Content-Type': 'application/json', 
      ...options?.headers 
    },
  });
  
  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API Error');
  }
  
  const json = await res.json();
  // API wraps responses in {data: ...} or {user: ...} — unwrap
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    if ('data' in json) return json.data;
    if ('user' in json) return json.user;
  }
  return json;
}

export const api = {
  // Auth
  auth: {
    me: () => apiFetch<any>('/auth/me'),
    logout: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
  },
  
  // Agents
  agents: {
    list: () => apiFetch<any[]>('/v2/agents'),
    get: (id: string) => apiFetch<any>(`/v2/agents/${id}`),
    create: (data: any) => apiFetch<any>('/v2/agents', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiFetch<any>(`/v2/agents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<void>(`/v2/agents/${id}`, { method: 'DELETE' }),
    performance: (id: string) => apiFetch<any>(`/v2/agents/${id}/performance`),
    health: (id: string) => apiFetch<any>(`/v2/agents/${id}/health`),
  },
  
  // Projects
  projects: {
    list: () => apiFetch<any[]>('/v2/projects'),
    get: (id: string) => apiFetch<any>(`/v2/projects/${id}`),
    create: (data: any) => apiFetch<any>('/v2/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiFetch<any>(`/v2/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<void>(`/v2/projects/${id}`, { method: 'DELETE' }),
  },
  
  // Tasks
  tasks: {
    list: () => apiFetch<any[]>('/v2/tasks'),
    get: (id: string) => apiFetch<any>(`/v2/tasks/${id}`),
    create: (data: any) => apiFetch<any>('/v2/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiFetch<any>(`/v2/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<void>(`/v2/tasks/${id}`, { method: 'DELETE' }),
    graph: () => apiFetch<any>('/v2/tasks/graph'),
  },
  
  // Intelligence
  intelligence: {
    brief: () => apiFetch<any>('/v2/intelligence/brief'),
    anomalies: () => apiFetch<any[]>('/v2/intelligence/anomalies'),
    leaderboard: () => apiFetch<any[]>('/v2/intelligence/leaderboard'),
    forecast: () => apiFetch<any>('/v2/intelligence/forecast'),
  },
  
  // Costs
  costs: {
    summary: () => apiFetch<any>('/v2/costs/summary'),
    forecast: () => apiFetch<any>('/v2/costs/forecast'),
  },
  
  // Decisions
  decisions: {
    pending: () => apiFetch<any[]>('/v2/decisions/pending'),
    resolve: (id: string, decision: 'approve' | 'deny', reason?: string) => 
      apiFetch<any>(`/v2/decisions/${id}/resolve`, { 
        method: 'POST', 
        body: JSON.stringify({ decision, reason }) 
      }),
  },
  
  // Health
  // API Keys
  apiKeys: {
    list: (agentId: string) => apiFetch<any[]>(`/v2/api-keys/${agentId}/keys`),
    create: (agentId: string, data: any) => apiFetch<any>(`/v2/api-keys/${agentId}/keys`, { method: "POST", body: JSON.stringify(data) }),
    delete: (agentId: string, keyId: string) => apiFetch<void>(`/v2/api-keys/${agentId}/keys/${keyId}`, { method: "DELETE" }),
    scopes: () => apiFetch<any>("/v2/api-keys/scopes"),
  },

  // SLA
  sla: {
    list: () => apiFetch<any>("/v2/sla"),
    create: (data: any) => apiFetch<any>("/v2/sla", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiFetch<any>(`/v2/sla/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<void>(`/v2/sla/${id}`, { method: "DELETE" }),
    violations: () => apiFetch<any>("/v2/sla/violations"),
  },

  health: () => apiFetch<any>('/health'),

  // Audit
  audit: {
    list: (params?: { limit?: number; page?: number }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.page) q.set('page', String(params.page));
      const qs = q.toString();
      return apiFetch<any>(`/v2/audit${qs ? '?' + qs : ''}`);
    },
    stats: (days?: number) => apiFetch<any>(`/v2/audit/stats${days ? '?days=' + days : ''}`),
  },
};