import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your hobby management preferences
        </p>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Settings page is under construction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings and preferences will be available here soon!
          </p>
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Planned settings:</h4>
            <ul className="text-sm space-y-1">
              <li>• Theme preferences (dark/light mode)</li>
              <li>• Default hobby categories</li>
              <li>• Entry display options</li>
              <li>• Search and filter preferences</li>
              <li>• Export and backup options</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}