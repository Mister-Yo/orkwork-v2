"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import useSWR from "swr"
import { Hash, FolderOpen, Bot, Send, Plus, MessageSquare, Trash2, Reply } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { useUser } from "@/lib/auth"
import { useEvents } from "@/hooks/use-events"
import { cn } from "@/lib/utils"

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return "Today"
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
  return d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
}

function groupMessagesByDate(messages: any[]) {
  const groups: { date: string; messages: any[] }[] = []
  let currentDate = ""

  for (const msg of messages) {
    const date = new Date(msg.createdAt).toDateString()
    if (date !== currentDate) {
      currentDate = date
      groups.push({ date: msg.createdAt, messages: [msg] })
    } else {
      groups[groups.length - 1].messages.push(msg)
    }
  }
  return groups
}

export default function ChatPage() {
  const { user } = useUser()
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [replyTo, setReplyTo] = useState<any>(null)
  const [sending, setSending] = useState(false)
  const [newChannelOpen, setNewChannelOpen] = useState(false)
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelType, setNewChannelType] = useState<string>("general")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: channels, mutate: mutateChannels } = useSWR("/v2/chat", () => api.chat.channels())
  const { data: messages, mutate: mutateMessages } = useSWR(
    activeChannel ? `/v2/chat/${activeChannel}/messages` : null,
    () => activeChannel ? api.chat.messages(activeChannel, { limit: 100 }) : null
  )

  // Auto-select first channel
  useEffect(() => {
    if (channels && channels.length > 0 && !activeChannel) {
      setActiveChannel(channels[0].id)
    }
  }, [channels, activeChannel])

  // SSE for real-time messages
  useEvents({
    onEvent: useCallback((type: string, payload: any) => {
      if (type === "chat.message" && payload.channelId === activeChannel) {
        mutateMessages((prev: any) => {
          if (!prev) return [payload.message]
          // Avoid duplicates
          if (prev.find((m: any) => m.id === payload.message.id)) return prev
          return [...prev, payload.message]
        }, false)
      }
    }, [activeChannel, mutateMessages]),
  })

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!messageInput.trim() || !activeChannel || sending) return
    setSending(true)
    try {
      await api.chat.send(activeChannel, messageInput.trim(), replyTo?.id)
      setMessageInput("")
      setReplyTo(null)
      // SSE will handle adding the message
      // But also mutate to be safe
      mutateMessages()
    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const deleteMessage = async (messageId: string) => {
    if (!activeChannel) return
    try {
      await api.chat.deleteMessage(activeChannel, messageId)
      mutateMessages((prev: any) => prev?.filter((m: any) => m.id !== messageId), false)
    } catch (err) {
      console.error("Failed to delete:", err)
    }
  }

  const createChannel = async () => {
    if (!newChannelName.trim()) return
    try {
      await api.chat.createChannel({ name: newChannelName.trim(), type: newChannelType })
      mutateChannels()
      setNewChannelOpen(false)
      setNewChannelName("")
      setNewChannelType("general")
    } catch (err) {
      console.error("Failed to create channel:", err)
    }
  }

  const activeChannelData = channels?.find((ch: any) => ch.id === activeChannel)
  const isAdmin = user?.role === "owner" || user?.role === "admin"

  // Sort messages oldest first for display
  const sortedMessages = messages ? [...messages].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : []
  const messageGroups = groupMessagesByDate(sortedMessages)

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)]">
      {/* Channel Sidebar */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-sm">Channels</h2>
          {isAdmin && (
            <Dialog open={newChannelOpen} onOpenChange={setNewChannelOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Channel</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="e.g. engineering"
                      onKeyDown={(e) => e.key === "Enter" && createChannel()}
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={newChannelType} onValueChange={setNewChannelType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createChannel} className="w-full">Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {channels?.map((ch: any) => (
            <button
              key={ch.id}
              onClick={() => { setActiveChannel(ch.id); setReplyTo(null) }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-muted transition-colors",
                activeChannel === ch.id && "bg-muted font-medium"
              )}
            >
              {ch.type === "project" ? (
                <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className="truncate">{ch.name}</span>
            </button>
          ))}
          {(!channels || channels.length === 0) && (
            <p className="text-xs text-muted-foreground px-3 py-4">No channels yet</p>
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeChannelData ? (
          <>
            {/* Channel Header */}
            <div className="h-14 border-b px-6 flex items-center gap-2 shrink-0">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <h1 className="font-semibold">{activeChannelData.name}</h1>
              <Badge variant="outline" className="text-xs capitalize">{activeChannelData.type}</Badge>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-4">
              {sortedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                messageGroups.map((group, gi) => (
                  <div key={gi}>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 border-t" />
                      <span className="text-xs text-muted-foreground font-medium">{formatDate(group.date)}</span>
                      <div className="flex-1 border-t" />
                    </div>
                    {group.messages.map((msg: any) => (
                      <div key={msg.id} className="group flex gap-3 py-1.5 hover:bg-muted/30 -mx-2 px-2 rounded">
                        <Avatar className="h-8 w-8 mt-0.5 shrink-0">
                          {msg.authorType === "user" && msg.author?.avatarUrl && (
                            <AvatarImage src={msg.author.avatarUrl} />
                          )}
                          <AvatarFallback className={cn("text-xs", msg.authorType === "agent" && "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300")}>
                            {msg.authorType === "agent" ? <Bot className="h-4 w-4" /> : (msg.author?.displayName || msg.author?.username || "?")[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-sm">
                              {msg.authorType === "agent" ? msg.author?.name : (msg.author?.displayName || msg.author?.username)}
                            </span>
                            {msg.authorType === "agent" && (
                              <Badge variant="secondary" className="text-[10px] px-1 py-0">BOT</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{formatTime(msg.createdAt)}</span>
                          </div>
                          {msg.replyTo && (
                            <div className="text-xs text-muted-foreground border-l-2 border-muted pl-2 mb-1 mt-0.5">
                              Replying to a message
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 flex items-start gap-0.5 shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setReplyTo(msg)}>
                            <Reply className="h-3.5 w-3.5" />
                          </Button>
                          {(msg.authorId === user?.id || isAdmin) && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMessage(msg.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t px-6 py-3 shrink-0">
              {replyTo && (
                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                  <Reply className="h-3 w-3" />
                  <span>Replying to <strong>{replyTo.author?.displayName || replyTo.author?.name}</strong></span>
                  <button onClick={() => setReplyTo(null)} className="ml-auto hover:text-foreground">✕</button>
                </div>
              )}
              <div className="flex gap-2">
                <textarea
                  ref={textareaRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message #${activeChannelData.name}`}
                  rows={1}
                  className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button onClick={sendMessage} disabled={!messageInput.trim() || sending} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Select a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
