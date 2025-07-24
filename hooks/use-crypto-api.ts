"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient, type CMCCryptoData, type CMCGlobalMetrics } from "@/lib/api-client"

export function useCryptoData(refreshInterval = 60000) {
  const [cryptoData, setCryptoData] = useState<CMCCryptoData[]>([])
  const [globalData, setGlobalData] = useState<CMCGlobalMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)

      const [cryptosResponse, globalResponse] = await Promise.all([
        apiClient.getCryptocurrencies(1, 50, "USD", "market_cap"),
        apiClient.getGlobalMetrics(),
      ])

      if (cryptosResponse.status.error_code === 0) {
        setCryptoData(cryptosResponse.data)
      } else {
        throw new Error(cryptosResponse.status.error_message || "Failed to fetch crypto data")
      }

      if (globalResponse.status.error_code === 0) {
        setGlobalData(globalResponse.data)
      } else {
        throw new Error(globalResponse.status.error_message || "Failed to fetch global data")
      }

      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching crypto data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  return {
    cryptoData,
    globalData,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  }
}

export function useCoinHistory(coinId: number, interval = "1h", count = 24) {
  const [historyData, setHistoryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!coinId) return

    const fetchHistory = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.getCoinHistory(coinId, count, interval)

        if (response.status.error_code === 0) {
          setHistoryData(response.data)
        } else {
          throw new Error(response.status.error_message || "Failed to fetch history")
        }
      } catch (err) {
        console.error("Error fetching coin history:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch history")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [coinId, interval, count])

  return { historyData, loading, error }
}

export function useTrendingData() {
  const [trendingData, setTrendingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setError(null)
        const data = await apiClient.getTrendingData()
        setTrendingData(data)
      } catch (err) {
        console.error("Error fetching trending data:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch trending data")
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()

    // Update every 5 minutes
    const interval = setInterval(fetchTrending, 300000)
    return () => clearInterval(interval)
  }, [])

  return { trendingData, loading, error }
}

export function useFearGreedIndex() {
  const [fearGreedData, setFearGreedData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFearGreed = async () => {
      try {
        const data = await apiClient.getFearGreedIndex()
        setFearGreedData(data)
      } catch (err) {
        console.error("Error fetching Fear & Greed Index:", err)
        setFearGreedData({ data: [{ value: "50", value_classification: "Neutral" }] })
      } finally {
        setLoading(false)
      }
    }

    fetchFearGreed()

    // Update every hour
    const interval = setInterval(fetchFearGreed, 3600000)
    return () => clearInterval(interval)
  }, [])

  return { fearGreedData, loading }
}
