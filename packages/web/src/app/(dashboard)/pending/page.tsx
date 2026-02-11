"use client"

import { useUser } from "@/lib/auth"
import { Clock, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function PendingPage() {
  const { user, logout } = useUser()

  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar_url || user?.avatar} alt={user?.name || user?.display_name || "User"} />
                <AvatarFallback className="text-xl">{getInitials(user?.name || user?.display_name)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-amber-100 dark:bg-amber-900 rounded-full p-1.5">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Account Pending Approval</h1>
            <p className="text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{user?.name || user?.display_name || "there"}</span>!
              Your account is awaiting admin approval. You&apos;ll be able to access the platform once approved.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              An administrator will review your account shortly. You&apos;ll be granted access once approved.
            </p>
          </div>

          <Button variant="outline" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
