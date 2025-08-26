const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(errorData.error?.message || errorData.message || 'Request failed')
    }

    return response.json()
  }

  // Version
  async getVersion() {
    return this.request<{ version: string }>('/api/version')
  }

  // Hobbies
  async getHobbies() {
    return this.request<Hobby[]>('/api/hobbies/')
  }

  async getHobby(id: number) {
    return this.request<Hobby>(`/api/hobbies/${id}`)
  }

  async createHobby(data: CreateHobbyData) {
    return this.request<Hobby>('/api/hobbies/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Entries
  async getEntries(params: GetEntriesParams = {}) {
    const searchParams = new URLSearchParams()
    
    if (params.hobby_id) searchParams.append('hobby_id', params.hobby_id.toString())
    if (params.type_key) searchParams.append('type_key', params.type_key)
    if (params.is_favorite !== undefined) searchParams.append('is_favorite', params.is_favorite.toString())
    if (params.is_archived !== undefined) searchParams.append('is_archived', params.is_archived.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.offset) searchParams.append('offset', params.offset.toString())
    
    const query = searchParams.toString()
    const endpoint = `/api/entries/${query ? `?${query}` : ''}`
    
    return this.request<Entry[]>(endpoint)
  }

  async getEntry(id: number) {
    return this.request<Entry>(`/api/entries/${id}`)
  }

  async createEntry(data: CreateEntryData) {
    return this.request<Entry>('/api/entries/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateEntry(id: number, data: UpdateEntryData) {
    return this.request<Entry>(`/api/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteEntry(id: number) {
    return this.request(`/api/entries/${id}`, { method: 'DELETE' })
  }

  // Search
  async search(params: SearchParams) {
    const searchParams = new URLSearchParams()
    searchParams.append('q', params.q)
    
    if (params.hobby_id) searchParams.append('hobby_id', params.hobby_id.toString())
    if (params.type_key) searchParams.append('type_key', params.type_key)
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.offset) searchParams.append('offset', params.offset.toString())
    
    return this.request<SearchResult[]>(`/api/search/?${searchParams.toString()}`)
  }

  // Admin
  async getSystemStats() {
    return this.request<SystemStats>('/api/admin/stats')
  }

  async getTables() {
    return this.request<TableInfo[]>('/api/admin/tables')
  }

  async executeQuery(query: string) {
    return this.request<QueryResult>('/api/admin/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    })
  }

  // Media
  async uploadMedia(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    return response.json()
  }
}

// Export singleton instance
export const api = new ApiClient()

// Types
export interface Hobby {
  id: number
  name: string
  slug: string
  icon: string
  color: string
  parent_id: number | null
  position: number
  is_active: boolean
}

export interface CreateHobbyData {
  name: string
  slug: string
  icon?: string
  color?: string
  parent_id?: number | null
  position?: number
}

export interface Entry {
  id: number
  hobby_id: number
  type_key: string
  title: string
  description: string | null
  content_markdown: string | null
  tags: string | null
  is_favorite: boolean
  is_archived: boolean
  view_count: number
  created_at: string
  updated_at: string
  hobby_name?: string
  props: Record<string, any>
}

export interface CreateEntryData {
  hobby_id: number
  type_key: string
  title: string
  description?: string | null
  content_markdown?: string | null
  tags?: string[]
  props?: Record<string, any>
}

export interface UpdateEntryData {
  title?: string
  description?: string | null
  content_markdown?: string | null
  tags?: string[]
  is_favorite?: boolean
  is_archived?: boolean
  props?: Record<string, any>
}

export interface GetEntriesParams {
  hobby_id?: number
  type_key?: string
  is_favorite?: boolean
  is_archived?: boolean
  limit?: number
  offset?: number
}

export interface SearchParams {
  q: string
  hobby_id?: number
  type_key?: string
  limit?: number
  offset?: number
}

export interface SearchResult {
  id: number
  title: string
  description: string | null
  hobby_id: number
  hobby_name: string
  type_key: string
  created_at: string
  snippet?: string
  rank?: number
}

export interface SystemStats {
  total_entries: number
  total_hobbies: number
  database_size: string
  version: string
}

export interface TableInfo {
  name: string
  row_count: number
  columns: string[]
}

export interface QueryResult {
  columns: string[]
  rows: Record<string, any>[]
  row_count: number
}