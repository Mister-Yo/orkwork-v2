"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Bot, CheckSquare, FolderGit2, Scale, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

const typeIcons: Record<string, any> = {
  agent: Bot,
  task: CheckSquare,
  project: FolderGit2,
  decision: Scale,
}

const typeColors: Record<string, string> = {
  agent: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  task: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  project: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  decision: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
}

export function SearchModal() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [selected, setSelected] = useState(0)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
    else { setQuery(""); setResults([]); setSelected(0) }
  }, [open])

  // Debounced search
  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/v2/search?q=${encodeURIComponent(q)}`, { credentials: "include" })
        const data = await res.json()
        setResults(data.results || [])
        setSelected(0)
      } catch { setResults([]) }
      setLoading(false)
    }, 300)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    else if (e.key === "Enter" && results[selected]) {
      e.preventDefault()
      router.push(results[selected].url)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); search(e.target.value) }}
            onKeyDown={handleKeyDown}
            placeholder="Search agents, tasks, projects..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline text-[10px] text-muted-foreground border rounded px-1.5 py-0.5 ml-2">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading && <div className="px-4 py-6 text-center text-sm text-muted-foreground">Searching...</div>}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</div>
          )}
          {!loading && results.map((r, i) => {
            const Icon = typeIcons[r.type] || Search
            return (
              <button
                key={`${r.type}-${r.id}`}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors ${i === selected ? "bg-accent" : ""}`}
                onClick={() => { router.push(r.url); setOpen(false) }}
                onMouseEnter={() => setSelected(i)}
              >
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r.title}</p>
                  {r.subtitle && <p className="text-xs text-muted-foreground truncate">{r.subtitle}</p>}
                </div>
                <Badge variant="secondary" className={`text-[10px] shrink-0 ${typeColors[r.type] || ""}`}>{r.type}</Badge>
              </button>
            )
          })}
          {!loading && query.length < 2 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Type to search across your workspace
              <div className="mt-2 text-xs">
                <kbd className="border rounded px-1.5 py-0.5 mr-1">⌘K</kbd> to open anytime
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
