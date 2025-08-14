import { useState, useEffect } from 'react'
import { Tool } from '@/types'

interface UseAirtableOptions {
  category?: string
  search?: string
  persona?: string
  featured?: boolean
}

interface UseAirtableReturn {
  tools: Tool[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAirtable(options: UseAirtableOptions = {}): UseAirtableReturn {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTools = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      
      if (options.category) params.append('category', options.category)
      if (options.search) params.append('search', options.search)
      if (options.persona) params.append('persona', options.persona)
      if (options.featured) params.append('featured', 'true')

      const response = await fetch(`/api/tools?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setTools(result.data)
      } else {
        setError(result.error || 'Failed to fetch tools')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTools()
  }, [options.category, options.search, options.persona, options.featured])

  return {
    tools,
    loading,
    error,
    refetch: fetchTools
  }
}

// Hook for categories
export function useCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/categories')
        const result = await response.json()

        if (result.success) {
          setCategories(result.data)
        } else {
          setError(result.error || 'Failed to fetch categories')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}

// Hook for personas
export function usePersonas() {
  const [personas, setPersonas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/personas')
        const result = await response.json()

        if (result.success) {
          setPersonas(result.data)
        } else {
          setError(result.error || 'Failed to fetch personas')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPersonas()
  }, [])

  return { personas, loading, error }
}
