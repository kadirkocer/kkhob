import { Suspense } from 'react'
import { EntryTabs } from '@/components/entry-tabs'
import { HobbyStats } from '@/components/hobby-stats'
import { QuickActions } from '@/components/quick-actions'
import { SearchBar } from '@/components/search-bar'
import { ShelvesGrid } from '@/components/shelves-grid'
import { PhotographyGallery } from '@/components/photography-gallery'
import { AddFromUrl } from '@/components/add-from-url'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { FolderOpen, Camera, Link, BarChart3 } from 'lucide-react'

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

      {/* New Features Showcase */}
      <div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Explore New Features
                </CardTitle>
                <CardDescription>
                  Discover the latest additions to Hobby Manager v1.2
                </CardDescription>
              </div>
              <AddFromUrl />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="shelves" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="shelves" className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Shelves
                </TabsTrigger>
                <TabsTrigger value="gallery" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Gallery
                </TabsTrigger>
                <TabsTrigger value="entries" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Entries
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="shelves" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Content Shelves</h3>
                    <Button variant="outline" size="sm">
                      View All Shelves
                    </Button>
                  </div>
                  <Suspense fallback={<div className="h-48 bg-muted rounded-lg animate-pulse" />}>
                    <ShelvesGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
                  </Suspense>
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Photography Gallery</h3>
                    <Button variant="outline" size="sm">
                      Open Gallery
                    </Button>
                  </div>
                  <Suspense fallback={<div className="h-48 bg-muted rounded-lg animate-pulse" />}>
                    <PhotographyGallery hobbyId={2} />
                  </Suspense>
                </div>
              </TabsContent>

              <TabsContent value="entries" className="mt-6">
                <Suspense fallback={<div className="h-96 bg-card rounded-lg animate-pulse" />}>
                  <EntryTabs />
                </Suspense>
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Enhanced Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    View detailed analytics and insights about your content
                  </p>
                  <Button asChild>
                    <a href="/admin">Open Admin Dashboard</a>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}