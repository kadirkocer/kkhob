"use client"

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Heart, Eye, Tag } from 'lucide-react'

export function RecentEntries() {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['entries', { recent: true }],
    queryFn: () => api.getEntries({ limit: 10 }),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
            <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No entries yet. Create your first entry to get started!
        </p>
        <Button asChild>
          <Link href="/entries/new">Create Entry</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Link
          key={entry.id}
          href={`/entries/${entry.id}`}
          className="block group"
        >
          <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            {/* Icon/Type indicator */}
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: getTypeColor(entry.type_key) }}
            >
              {getTypeIcon(entry.type_key)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium group-hover:text-primary transition-colors truncate">
                    {entry.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {entry.hobby_name} • {formatRelativeTime(entry.created_at)}
                  </p>
                  {entry.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {entry.description}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-2 ml-4 text-xs text-muted-foreground">
                  {entry.is_favorite && (
                    <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                  )}
                  {entry.view_count > 0 && (
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{entry.view_count}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {entry.tags && (
                <div className="flex items-center space-x-1 mt-2">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.split(',').slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-muted px-1.5 py-0.5 rounded"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                    {entry.tags.split(',').length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{entry.tags.split(',').length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function getTypeColor(type: string): string {
  const colors = {
    article: '#3B82F6',
    photo: '#F59E0B',
    video: '#EF4444',
    code_snippet: '#10B981',
    book: '#8B5CF6',
    general: '#6B7280',
  }
  return colors[type as keyof typeof colors] || colors.general
}

function getTypeIcon(type: string): string {
  const icons = {
    article: '📄',
    photo: '📷',
    video: '🎬',
    code_snippet: '💻',
    book: '📚',
    general: '📝',
  }
  return icons[type as keyof typeof icons] || icons.general
}