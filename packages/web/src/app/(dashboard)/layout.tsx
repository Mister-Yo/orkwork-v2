"use client"
import { SearchModal } from "@/components/search-modal"
import { Breadcrumb } from "@/components/ui/breadcrumb"

import { useRouter, usePathname } from "next/navigation"
import { useUser } from "@/lib/auth"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, error } = useUser()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <div className="w-60 border-r bg-muted/40 hidden lg:block">
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-32" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="h-14 border-b px-4 flex items-center">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const router = useRouter()
  const pathname = usePathname()

  // If user is pending, only allow the pending page
  if (user && user.role === 'pending' && pathname !== '/pending') {
    router.push('/pending')
    return null
  }

  // If user is pending and on the pending page, show it without sidebar
  if (user && user.role === 'pending' && pathname === '/pending') {
    return <><Breadcrumb />
            {children}</>
  }

  // If there's an error or no user, the middleware should have redirected to login
  // But we'll handle it gracefully here just in case
  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold">Authentication Error</h2>
          <p className="text-muted-foreground">Please try logging in again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />
            <SearchModal />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}