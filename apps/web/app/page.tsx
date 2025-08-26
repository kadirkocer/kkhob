import { Suspense } from 'react'
import { EntryTabs } from '@/components/entry-tabs'
import { HobbyStats } from '@/components/hobby-stats'
import { QuickActions } from '@/components/quick-actions'
import { SearchBar } from '@/components/search-bar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to Hobby Manager
          </h1>
          <p className="text-muted-foreground">
            Manage all your hobbies and interests in one place
          </p>
        </div>
        
        <div className="w-full max-w-2xl">
          <SearchBar />
        </div>
      </div>

      {/* Stats and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="h-32 bg-card rounded-lg animate-pulse" />}>
            <HobbyStats />
          </Suspense>
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Entry Tabs */}
      <div>
        <Suspense fallback={<div className="h-96 bg-card rounded-lg animate-pulse" />}>
          <EntryTabs />
        </Suspense>
      </div>
    </div>
  )
}