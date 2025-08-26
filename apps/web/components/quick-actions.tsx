"use client"

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Database, Settings } from 'lucide-react'

export function QuickActions() {
  const actions = [
    {
      title: "New Entry",
      description: "Create a new hobby entry",
      href: "/entries/new",
      icon: Plus,
      variant: "default" as const,
    },
    {
      title: "Search",
      description: "Find existing entries",
      href: "/search",
      icon: Search,
      variant: "outline" as const,
    },
    {
      title: "Admin Panel",
      description: "Database management",
      href: "/admin",
      icon: Database,
      variant: "outline" as const,
    },
    {
      title: "Settings",
      description: "Configure preferences",
      href: "/settings",
      icon: Settings,
      variant: "outline" as const,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            className="justify-start h-auto p-4"
            asChild
          >
            <Link href={action.href}>
              <div className="flex items-center space-x-3">
                <action.icon className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}