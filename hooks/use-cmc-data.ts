"use client"

import { useState, useEffect, useCallback } from "react"
import { cmcAPI, type CMCCryptoData, type CMCGlobalMetrics } from "@/lib/coinmarketcap-api"
import { demoGlobalData, demoCryptoData, generateDemoHistory } from "@/lib/demo-data"

export function useCMCData(refreshInterval = 60000, useDemoData = false) {
  const [cryptoData, setCryptoData] = useState<CMCCryptoData[]>([])
  const [globalData, setGlobalData] = useState<CMCGlobalMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)

      if (useDemoData) {
        // Use demo data
        setCryptoData(demoCryptoData as CMCCryptoData[])
        setGlobalData(demoGlobalData as CMCGlobalMetrics)
        setLastUpdated(new Date())
        setLoading(false)
        return
      }

      const [cryptosResponse, globalResponse] = await Promise.all([
        cmcAPI.getCryptocurrencies(1, 50, "USD", "market_cap"),
        cmcAPI.getGlobalMetrics("USD"),
      ])

      if (cryptosResponse.status.error_code === 0) {
        setCryptoData(cryptosResponse.data)
      } else {
        throw new Error(cryptosResponse.status.error_message)
      }

      if (globalResponse.status.error_code === 0) {
        setGlobalData(globalResponse.data)
      } else {
        throw new Error(globalResponse.status.error_message)
      }

      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching CMC data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }, [useDemoData])

  useEffect(() => {
    fetchData()

    if (!useDemoData) {
      const interval = setInterval(fetchData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, refreshInterval, useDemoData])

  return {
    cryptoData,
    globalData,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  }
}

export function useCMCCoinHistory(coinId: number, interval = "1h", count = 24, useDemoData = false) {
  const [historyData, setHistoryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!coinId) return

    const fetchHistory = async () => {
      try {
        setLoading(true)
        setError(null)

        if (useDemoData) {
          // Generate demo history data
          const demoHistory = generateDemoHistory(43250, count) // Bitcoin price as base
          setHistoryData(demoHistory)
          setLoading(false)
          return
        }

        const response = await cmcAPI.getQuotesHistorical(coinId, undefined, undefined, count, interval)

        if (response.status.error_code === 0) {
          setHistoryData(response.data)
        } else {
          throw new Error(response.status.error_message)
        }
      } catch (err) {
        console.error("Error fetching coin history:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch history")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [coinId, interval, count, useDemoData])

  return { historyData, loading, error }
}

export function useCMCTrending() {
  const [trendingData, setTrendingData] = useState<any>(null)
  const [gainersLosersData, setGainersLosersData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setError(null)

        const [trendingResponse, gainersLosersResponse] = await Promise.all([
          cmcAPI.getTrendingMostVisited().catch(() => null),
          cmcAPI.getTrendingGainersLosers("24h", 1, 5).catch(() => null),
        ])

        if (trendingResponse && trendingResponse.status.error_code === 0) {
          setTrendingData(trendingResponse.data)
        }

        if (gainersLosersResponse && gainersLosersResponse.status.error_code === 0) {
          setGainersLosersData(gainersLosersResponse.data)
        }
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

  return { trendingData, gainersLosersData, loading, error }
}

export function useFearGreedIndex() {
  const [fearGreedData, setFearGreedData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFearGreed = async () => {
      try {
        const data = await cmcAPI.getFearGreedIndex()
        setFearGreedData(data)
      } catch (err) {
        console.error("Error fetching Fear & Greed Index:", err)
        // Set default data on error
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
