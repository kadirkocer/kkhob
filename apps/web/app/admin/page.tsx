import { Suspense } from 'react'
import { EnhancedAdminDashboard } from '@/components/enhanced-admin-dashboard'

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <Suspense fallback={
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      }>
        <EnhancedAdminDashboard />
      </Suspense>
    </div>
  )
}