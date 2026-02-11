"use client"

import { useEffect, useRef, useCallback, useState } from 'react'
import { useSWRConfig } from 'swr'

type EventHandler = (type: string, payload: any) => void

interface UseEventsOptions {
  onEvent?: EventHandler
  enabled?: boolean
}

export function useEvents({ onEvent, enabled = true }: UseEventsOptions = {}) {
  const { mutate } = useSWRConfig()
  const eventSourceRef = useRef<EventSource | null>(null)
  const [connected, setConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<{ type: string; payload: any } | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>(null)
  const reconnectAttempts = useRef(0)

  const invalidateCache = useCallback((type: string) => {
    // Map event types to SWR cache keys to invalidate
    switch (type) {
      case 'task.created':
      case 'task.updated':
      case 'task.completed':
      case 'task.blocked':
        mutate('/v2/tasks')
        mutate((key: string) => typeof key === 'string' && key.startsWith('/v2/tasks/'), undefined, { revalidate: true })
        break
      case 'agent.status_changed':
        mutate('/v2/agents')
        mutate((key: string) => typeof key === 'string' && key.startsWith('/v2/agents/'), undefined, { revalidate: true })
        break
      case 'decision.needed':
        mutate('/v2/decisions/pending')
        break
      case 'cost.recorded':
        mutate('/v2/costs/summary')
        break
      case 'notification.new':
        // Could invalidate notification count
        break
      case 'workflow.started':
      case 'workflow.completed':
        mutate((key: string) => typeof key === 'string' && key.startsWith('/v2/workflows'), undefined, { revalidate: true })
        break
    }
    // Always refresh audit log on any event
    mutate((key: string) => typeof key === 'string' && key.startsWith('/v2/audit'), undefined, { revalidate: true })
  }, [mutate])

  const connect = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const es = new EventSource('/api/v2/events/stream', { withCredentials: true })
    eventSourceRef.current = es

    es.onopen = () => {
      console.log('[SSE] Connected')
      setConnected(true)
      reconnectAttempts.current = 0
    }

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        const { type, payload } = data

        if (type === 'heartbeat') return
        if (type === 'connection.opened') {
          console.log('[SSE] Connection acknowledged')
          return
        }

        console.log(`[SSE] Event: ${type}`, payload)
        setLastEvent({ type, payload })

        // Invalidate relevant SWR caches
        invalidateCache(type)

        // Custom handler
        onEvent?.(type, payload)
      } catch (err) {
        console.error('[SSE] Parse error:', err)
      }
    }

    es.onerror = () => {
      console.log('[SSE] Connection error, reconnecting...')
      setConnected(false)
      es.close()

      // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
      reconnectAttempts.current++

      reconnectTimeoutRef.current = setTimeout(connect, delay)
    }
  }, [enabled, invalidateCache, onEvent])

  useEffect(() => {
    connect()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connect])

  return { connected, lastEvent }
}
