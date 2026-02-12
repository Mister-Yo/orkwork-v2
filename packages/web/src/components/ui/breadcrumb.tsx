"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import useSWR from "swr"
import { apiFetch } from "@/lib/api"

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  agents: "Agents",
  team: "Team",
  users: "Users",
  projects: "Projects",
  tasks: "Tasks",
  chat: "Chat",
  workflows: "Workflows",
  costs: "Costs",
  decisions: "Decisions",
  settings: "Settings",
}

function useEntityName(type: string | null, id: string | null) {
  return useSWR(
    type && id ? `/v2/${type}/${id}` : null,
    () => apiFetch<any>(`/v2/${type}/${id}`).then((d: any) => d?.name || d?.title || id?.slice(0, 8)),
    { revalidateOnFocus: false }
  )
}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  // Detect entity: if segments[1] is a UUID
  const isUuid = segments[1] && /^[0-9a-f]{8}-/.test(segments[1])
  const entityType = isUuid ? segments[0] : null
  const entityId = isUuid ? segments[1] : null
  const { data: entityName } = useEntityName(entityType, entityId)

  if (segments.length <= 1) return null

  const crumbs: { label: string; href: string }[] = []
  let path = ""

  for (let i = 0; i < segments.length; i++) {
    path += `/${segments[i]}`
    const seg = segments[i]

    if (isUuid && i === 1) {
      crumbs.push({ label: entityName || seg.slice(0, 8) + "…", href: path })
    } else {
      crumbs.push({ label: LABELS[seg] || seg, href: path })
    }
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {i === crumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
