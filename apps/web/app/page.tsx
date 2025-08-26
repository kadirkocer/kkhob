import { Suspense } from 'react'
import { RecentEntries } from '@/components/recent-entries'
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

      {/* Recent Entries */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>
              Your latest hobby entries across all categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>}>
              <RecentEntries />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}