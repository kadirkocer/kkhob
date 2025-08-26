"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Database, Users, FileText, Tags, Folder, Calendar, Settings } from 'lucide-react'

export function DatabaseExplorer() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['admin', 'tables'],
    queryFn: () => api.getTables(),
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedTableData = selectedTable 
    ? tables.find(t => t.name === selectedTable)
    : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tables List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Database Tables</span>
          </CardTitle>
          <CardDescription>
            Click a table to view its structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tables.map((table) => (
              <Button
                key={table.name}
                variant={selectedTable === table.name ? "default" : "ghost"}
                className="w-full justify-between"
                onClick={() => setSelectedTable(table.name)}
              >
                <div className="flex items-center space-x-2">
                  {getTableIcon(table.name)}
                  <span className="font-mono text-sm">{table.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {table.row_count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table Details */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedTableData ? `Table: ${selectedTableData.name}` : 'Select a Table'}
          </CardTitle>
          <CardDescription>
            {selectedTableData 
              ? `${selectedTableData.row_count} rows, ${selectedTableData.columns.length} columns`
              : 'Choose a table from the list to view its structure'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedTableData ? (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTableData.columns.map((column, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{column}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getColumnType(column)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {getColumnDescription(selectedTableData.name, column)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Total rows: <strong>{selectedTableData.row_count}</strong>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Select a table to explore its structure and data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function getTableIcon(tableName: string) {
  const icons = {
    users: <Users className="h-4 w-4" />,
    hobbies: <Folder className="h-4 w-4" />,
    entries: <FileText className="h-4 w-4" />,
    tags: <Tags className="h-4 w-4" />,
    activity_logs: <Calendar className="h-4 w-4" />,
    app_settings: <Settings className="h-4 w-4" />,
  }
  return icons[tableName as keyof typeof icons] || <Database className="h-4 w-4" />
}

function getColumnType(columnName: string): string {
  if (columnName.includes('id')) return 'INTEGER'
  if (columnName.includes('_at')) return 'TIMESTAMP'
  if (columnName.includes('json')) return 'JSON'
  if (columnName.includes('count') || columnName.includes('bytes') || columnName.includes('position')) return 'INTEGER'
  if (columnName.includes('is_')) return 'BOOLEAN'
  if (columnName === 'title' || columnName === 'name') return 'VARCHAR'
  if (columnName.includes('_markdown') || columnName.includes('description')) return 'TEXT'
  return 'TEXT'
}

function getColumnDescription(tableName: string, columnName: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    entries: {
      title: 'Entry title or name',
      description: 'Brief description or summary',
      content_markdown: 'Full content in Markdown format',
      tags: 'Comma-separated tags for categorization',
      view_count: 'Number of times viewed',
      is_favorite: 'Whether entry is marked as favorite',
      is_archived: 'Whether entry is archived',
    },
    hobbies: {
      name: 'Display name of the hobby',
      slug: 'URL-friendly identifier',
      icon: 'Emoji or icon representation',
      color: 'Theme color in hex format',
      config_json: 'Configuration settings as JSON',
      parent_id: 'Reference to parent hobby (for hierarchies)',
    },
    users: {
      username: 'Unique username for authentication',
      password_hash: 'Hashed password for security',
      settings_json: 'User preferences as JSON',
    },
  }
  
  return descriptions[tableName]?.[columnName] || 'Database field'
}