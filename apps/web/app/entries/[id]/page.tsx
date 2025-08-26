import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface EntryPageProps {
  params: { id: string }
}

export default function EntryPage({ params }: EntryPageProps) {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Entry Details
        </h1>
        <p className="text-muted-foreground">
          Entry ID: {params.id}
        </p>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Entry Information</CardTitle>
          <CardDescription>
            Individual entry pages are under construction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Entry detail pages are coming soon! For now, you can browse all entries on the main dashboard.
          </p>
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Current features:</h4>
            <ul className="text-sm space-y-1">
              <li>• View all entries on the dashboard</li>
              <li>• Search across all entry content</li>
              <li>• Filter entries by hobby or type</li>
              <li>• Explore entry data in the admin panel</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}