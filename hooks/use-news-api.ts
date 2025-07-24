"use client"

import { useState, useEffect, useCallback } from "react"

export interface NewsArticle {
  id: string
  source: {
    id: string | null
    name: string
  }
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
  category: string
  sentiment: "positive" | "negative" | "neutral"
  relatedCoins: string[]
}

export interface NewsResponse {
  status: string
  totalResults: number
  articles: NewsArticle[]
  message?: string
}

export function useNews(
  query = "cryptocurrency OR bitcoin OR ethereum OR blockchain OR crypto",
  category = "all",
  refreshInterval = 300000, // 5 minutes
) {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [totalResults, setTotalResults] = useState(0)

  const fetchNews = useCallback(async () => {
    try {
      setError(null)

      const params = new URLSearchParams({
        q: query,
        category,
        pageSize: "20",
      })

      const response = await fetch(`/api/news?${params}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`)
      }

      const data: NewsResponse = await response.json()

      if (data.status === "error") {
        throw new Error(data.message || "Failed to fetch news")
      }

      setNews(data.articles)
      setTotalResults(data.totalResults)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching news:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch news")
    } finally {
      setLoading(false)
    }
  }, [query, category])

  useEffect(() => {
    fetchNews()

    const interval = setInterval(fetchNews, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchNews, refreshInterval])

  return {
    news,
    loading,
    error,
    lastUpdated,
    totalResults,
    refetch: fetchNews,
  }
}

export function useNewsSearch(searchTerm: string) {
  const [searchResults, setSearchResults] = useState<NewsArticle[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const search = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    setSearchError(null)

    try {
      const params = new URLSearchParams({
        q: `${term} AND (cryptocurrency OR bitcoin OR ethereum OR blockchain OR crypto)`,
        pageSize: "10",
      })

      const response = await fetch(`/api/news?${params}`)

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data: NewsResponse = await response.json()
      setSearchResults(data.articles)
    } catch (err) {
      console.error("Error searching news:", err)
      setSearchError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      search(searchTerm)
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, search])

  return {
    searchResults,
    searching,
    searchError,
  }
}
