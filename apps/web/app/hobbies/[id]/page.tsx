import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface HobbyPageProps {
  params: { id: string }
  searchParams?: { tab?: string }
}

export default function HobbyPage({ params, searchParams }: HobbyPageProps) {
  const tab = searchParams?.tab || 'entries'
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Hobby Details
        </h1>
        <p className="text-muted-foreground">
          Hobby ID: {params.id}
        </p>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Hobby Information</CardTitle>
          <CardDescription>
            This hobby page is under construction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Individual hobby pages are coming soon! For now, you can explore hobbies through the main dashboard.
          </p>
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">What's available:</h4>
            <ul className="text-sm space-y-1">
              <li>• View all hobbies in the sidebar</li>
              <li>• Browse entries on the main dashboard</li>
              <li>• Use search to find specific content</li>
              <li>• Explore the admin panel for data insights</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}