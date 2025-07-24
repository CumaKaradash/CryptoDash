// CoinGecko API configuration
const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3"
const COINGECKO_PRO_API_BASE = "https://pro-api.coingecko.com/api/v3"

// API key should be set in environment variables
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY

export interface CryptoData {
  id: string
  name: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
  total_volume: number
  market_cap: number
  image: string
  market_cap_rank: number
  price_change_24h: number
  high_24h: number
  low_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  last_updated: string
}

export interface GlobalMarketData {
  total_market_cap: { [key: string]: number }
  total_volume: { [key: string]: number }
  market_cap_percentage: { [key: string]: number }
  market_cap_change_percentage_24h_usd: number
  updated_at: number
}

export interface PriceHistoryData {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

class CoinGeckoAPI {
  private baseUrl: string
  private headers: HeadersInit

  constructor() {
    this.baseUrl = API_KEY ? COINGECKO_PRO_API_BASE : COINGECKO_API_BASE
    this.headers = {
      "Content-Type": "application/json",
      ...(API_KEY && { "x-cg-pro-api-key": API_KEY }),
    }
  }

  async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: this.headers,
          next: { revalidate: 30 }, // Cache for 30 seconds
        })

        if (response.ok) {
          return response
        }

        if (response.status === 429) {
          // Rate limit hit, wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
          continue
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      } catch (error) {
        if (i === retries - 1) throw error
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
    throw new Error("Max retries reached")
  }

  async getCryptocurrencies(
    vs_currency = "usd",
    order = "market_cap_desc",
    per_page = 100,
    page = 1,
    sparkline = false,
    price_change_percentage = "24h",
  ): Promise<CryptoData[]> {
    const params = new URLSearchParams({
      vs_currency,
      order,
      per_page: per_page.toString(),
      page: page.toString(),
      sparkline: sparkline.toString(),
      price_change_percentage,
    })

    const url = `${this.baseUrl}/coins/markets?${params}`
    const response = await this.fetchWithRetry(url)
    return response.json()
  }

  async getGlobalMarketData(): Promise<GlobalMarketData> {
    const url = `${this.baseUrl}/global`
    const response = await this.fetchWithRetry(url)
    const data = await response.json()
    return data.data
  }

  async getCoinHistory(coinId: string, vs_currency = "usd", days = 1, interval?: string): Promise<PriceHistoryData> {
    const params = new URLSearchParams({
      vs_currency,
      days: days.toString(),
      ...(interval && { interval }),
    })

    const url = `${this.baseUrl}/coins/${coinId}/market_chart?${params}`
    const response = await this.fetchWithRetry(url)
    return response.json()
  }

  async getCoinDetails(coinId: string): Promise<any> {
    const url = `${this.baseUrl}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    const response = await this.fetchWithRetry(url)
    return response.json()
  }

  async getTrendingCoins(): Promise<any> {
    const url = `${this.baseUrl}/search/trending`
    const response = await this.fetchWithRetry(url)
    return response.json()
  }

  async getFearGreedIndex(): Promise<any> {
    try {
      // Alternative Fear & Greed Index API
      const response = await fetch("https://api.alternative.me/fng/")
      return response.json()
    } catch (error) {
      console.error("Fear & Greed Index API error:", error)
      return { data: [{ value: "50", value_classification: "Neutral" }] }
    }
  }
}

export const coinGeckoAPI = new CoinGeckoAPI()

// Utility functions
export function formatPrice(price: number): string {
  if (price < 0.01) {
    return price.toFixed(6)
  } else if (price < 1) {
    return price.toFixed(4)
  } else if (price < 100) {
    return price.toFixed(2)
  } else {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`
  } else {
    return `$${marketCap.toLocaleString()}`
  }
}

export function formatVolume(volume: number): string {
  if (volume >= 1e9) {
    return `$${(volume / 1e9).toFixed(2)}B`
  } else if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(2)}M`
  } else {
    return `$${volume.toLocaleString()}`
  }
}
