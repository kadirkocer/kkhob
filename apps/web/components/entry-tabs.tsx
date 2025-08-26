'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RecentEntries } from '@/components/recent-entries'
import { 
  FileText, 
  BookOpen, 
  ExternalLink,
  Plus,
  Search,
  Filter
} from 'lucide-react'

interface EntryTabsProps {
  hobbyId?: number
  className?: string
}

export function EntryTabs({ hobbyId, className }: EntryTabsProps) {
  const { t, ready } = useTranslation()
  const [activeTab, setActiveTab] = useState('entries')

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="entries" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {ready ? t('entries') : 'Entries'}
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {ready ? t('library') : 'Library'}
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              {ready ? t('links') : 'Links'}
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {ready ? t('add_entry') : 'Add Entry'}
            </Button>
          </div>
        </div>

        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {ready ? t('entries') : 'Entries'}
                  </CardTitle>
                  <CardDescription>
                    Personal notes, thoughts, and documented experiences
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  Active entries
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <RecentEntries hobbyId={hobbyId} entryType="entry" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {ready ? t('library') : 'Library'}
                  </CardTitle>
                  <CardDescription>
                    Books, articles, courses, and learning materials
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  Curated collection
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <RecentEntries hobbyId={hobbyId} entryType="resource" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    {ready ? t('links') : 'Links'}
                  </CardTitle>
                  <CardDescription>
                    Useful websites, tools, and external resources
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  External resources
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <RecentEntries hobbyId={hobbyId} entryType="link" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}