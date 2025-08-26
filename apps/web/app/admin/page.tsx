import { Suspense } from 'react'
import { AdminStats } from '@/components/admin/admin-stats'
import { DatabaseExplorer } from '@/components/admin/database-explorer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">
          Database management and system monitoring
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="query">Query</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Suspense fallback={<div className="h-32 bg-card rounded-lg animate-pulse" />}>
            <AdminStats />
          </Suspense>
          
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Current system status and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Database Engine:</span> SQLite with WAL mode
                </div>
                <div>
                  <span className="font-medium">Full-text Search:</span> FTS5 enabled
                </div>
                <div>
                  <span className="font-medium">Backend:</span> FastAPI + Python
                </div>
                <div>
                  <span className="font-medium">Frontend:</span> Next.js + TypeScript
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="database">
          <Suspense fallback={<div className="h-64 bg-card rounded-lg animate-pulse" />}>
            <DatabaseExplorer />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="query">
          <Card>
            <CardHeader>
              <CardTitle>SQL Query</CardTitle>
              <CardDescription>
                Execute read-only SQL queries against the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Query interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}