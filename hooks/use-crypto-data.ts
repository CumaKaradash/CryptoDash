"use client"

import { useState, useEffect, useCallback } from "react"
import { coinGeckoAPI, type CryptoData, type GlobalMarketData, type PriceHistoryData } from "@/lib/api"

export function useCryptoData(refreshInterval = 30000) {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [globalData, setGlobalData] = useState<GlobalMarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)

      const [cryptos, global] = await Promise.all([
        coinGeckoAPI.getCryptocurrencies("usd", "market_cap_desc", 50),
        coinGeckoAPI.getGlobalMarketData(),
      ])

      setCryptoData(cryptos)
      setGlobalData(global)
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

export function useCoinHistory(coinId: string, days = 1) {
  const [historyData, setHistoryData] = useState<PriceHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!coinId) return

    const fetchHistory = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await coinGeckoAPI.getCoinHistory(coinId, "usd", days)
        setHistoryData(data)
      } catch (err) {
        console.error("Error fetching coin history:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch history")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [coinId, days])

  return { historyData, loading, error }
}

export function useTrendingCoins() {
  const [trendingData, setTrendingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setError(null)
        const data = await coinGeckoAPI.getTrendingCoins()
        setTrendingData(data)
      } catch (err) {
        console.error("Error fetching trending coins:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch trending data")
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [])

  return { trendingData, loading, error }
}

export function useFearGreedIndex() {
  const [fearGreedData, setFearGreedData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFearGreed = async () => {
      try {
        const data = await coinGeckoAPI.getFearGreedIndex()
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
