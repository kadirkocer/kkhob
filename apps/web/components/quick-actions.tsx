"use client"

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateEntryDialog } from '@/components/create-entry-dialog'
import { CreateShelfDialog } from '@/components/create-shelf-dialog'
import { FileUpload } from '@/components/file-upload'
import { Plus, Search, Database, Settings, Upload, FolderPlus } from 'lucide-react'

export function QuickActions() {
  const handleFileUpload = (file: any) => {
    console.log('File uploaded:', file)
    // You could create an entry automatically here
  }

  const linkActions = [
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
      <CardContent className="space-y-3">
        {/* Creation Actions */}
        <div className="grid grid-cols-1 gap-2">
          <CreateEntryDialog className="justify-start h-auto p-4" />
          <CreateShelfDialog className="justify-start h-auto p-4" />
        </div>

        {/* File Upload */}
        <div className="pt-2">
          <FileUpload 
            onUploadComplete={handleFileUpload}
            maxSizeMB={5}
            acceptedTypes={['image/*', 'application/pdf', 'text/*']}
            className="w-full"
          />
        </div>

        {/* Link Actions */}
        <div className="grid grid-cols-1 gap-2 pt-2">
          {linkActions.map((action, index) => (
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
        </div>
      </CardContent>
    </Card>
  )
}