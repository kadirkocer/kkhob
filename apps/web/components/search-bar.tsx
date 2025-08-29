"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatRelativeTime } from '@/lib/utils'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()

  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      console.log('Searching for:', query)
      const searchResults = await api.search({ q: query, limit: 5 })
      console.log('Search results:', searchResults)
      return searchResults
    },
    enabled: query.length > 2,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setShowResults(false)
    }
  }

  const handleResultClick = (entryId: number) => {
    router.push(`/entries/${entryId}`)
    setShowResults(false)
    setQuery('')
  }

  return (
    <div className="relative">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Makale, hobi, etiket ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="pl-10 pr-4"
          />
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && query.length > 2 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Aranıyor...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-red-500">
                Arama hatası: {error.message}
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                    onClick={() => handleResultClick(result.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {result.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.hobby_name} • {result.type_key}
                        </p>
                        {result.snippet && (
                          <p 
                            className="text-xs text-muted-foreground mt-1 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: result.snippet }}
                          />
                        )}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground ml-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatRelativeTime(result.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {results.length >= 5 && (
                  <div className="p-3 text-center border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        router.push(`/search?q=${encodeURIComponent(query)}`)
                        setShowResults(false)
                      }}
                    >
                      Tüm sonuçları görüntüle
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                "{query}" için sonuç bulunamadı
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}