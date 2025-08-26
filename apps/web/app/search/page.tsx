import { Suspense } from 'react'
import { SearchResults } from '@/components/search-results'
import { SearchBar } from '@/components/search-bar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SearchPageProps {
  searchParams?: { q?: string }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams?.q || ''
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">
          Search across all your hobby entries
        </p>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-2xl">
        <SearchBar />
      </div>

      {/* Results */}
      <div>
        {query ? (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                Results for "{query}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>}>
                <SearchResults query={query} />
              </Suspense>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Start Searching</CardTitle>
              <CardDescription>
                Enter a search term to find entries across all your hobbies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Search across titles, descriptions, content, and tags
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Try searching for "FastAPI", "photo", or "code"</p>
                  <p>• Results appear as you type in the search bar above</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}