"use client"

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import Link from 'next/link'

interface SearchResultsProps {
  query: string
}

export function SearchResults({ query }: SearchResultsProps) {
  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ['search', query],
    queryFn: () => api.search({ q: query, limit: 50 }),
    enabled: !!query && query.length > 1,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error searching: {error.message}</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No results found for "{query}"
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Try a different search term or check your spelling
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Found {results.length} result{results.length !== 1 ? 's' : ''}
      </p>
      
      {results.map((result) => (
        <Link key={result.id} href={`/entries/${result.id}`}>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate hover:text-primary transition-colors">
                    {result.title}
                  </h3>
                  
                  <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                    <span>{result.hobby_name}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {result.type_key}
                    </Badge>
                  </div>
                  
                  {result.snippet && (
                    <p 
                      className="text-sm text-muted-foreground mt-2 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: result.snippet }}
                    />
                  )}
                </div>

                <div className="flex items-center text-xs text-muted-foreground ml-4">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatRelativeTime(result.created_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}