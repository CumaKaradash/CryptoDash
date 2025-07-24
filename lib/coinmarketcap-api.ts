// CoinMarketCap API configuration
const CMC_API_BASE = "https://pro-api.coinmarketcap.com/v1"

// API key should be set in environment variables
const API_KEY = process.env.NEXT_PUBLIC_CMC_API_KEY

export interface CMCCryptoData {
  id: number
  name: string
  symbol: string
  slug: string
  cmc_rank: number
  num_market_pairs: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  infinite_supply: boolean
  last_updated: string
  date_added: string
  tags: string[]
  platform: any
  self_reported_circulating_supply: number
  self_reported_market_cap: number
  quote: {
    USD: {
      price: number
      volume_24h: number
      volume_change_24h: number
      percent_change_1h: number
      percent_change_24h: number
      percent_change_7d: number
      percent_change_30d: number
      percent_change_60d: number
      percent_change_90d: number
      market_cap: number
      market_cap_dominance: number
      fully_diluted_market_cap: number
      last_updated: string
    }
  }
}

export interface CMCGlobalMetrics {
  active_cryptocurrencies: number
  total_cryptocurrencies: number
  active_market_pairs: number
  active_exchanges: number
  total_exchanges: number
  eth_dominance: number
  btc_dominance: number
  eth_dominance_yesterday: number
  btc_dominance_yesterday: number
  eth_dominance_24h_percentage_change: number
  btc_dominance_24h_percentage_change: number
  defi_volume_24h: number
  defi_volume_24h_reported: number
  defi_market_cap: number
  defi_24h_percentage_change: number
  stablecoin_volume_24h: number
  stablecoin_volume_24h_reported: number
  stablecoin_market_cap: number
  stablecoin_24h_percentage_change: number
  derivatives_volume_24h: number
  derivatives_volume_24h_reported: number
  derivatives_24h_percentage_change: number
  quote: {
    USD: {
      total_market_cap: number
      total_volume_24h: number
      total_volume_24h_reported: number
      altcoin_volume_24h: number
      altcoin_volume_24h_reported: number
      altcoin_market_cap: number
      defi_volume_24h: number
      defi_volume_24h_reported: number
      defi_24h_percentage_change: number
      defi_market_cap: number
      stablecoin_volume_24h: number
      stablecoin_volume_24h_reported: number
      stablecoin_24h_percentage_change: number
      stablecoin_market_cap: number
      derivatives_volume_24h: number
      derivatives_volume_24h_reported: number
      derivatives_24h_percentage_change: number
      total_market_cap_yesterday: number
      total_volume_24h_yesterday: number
      total_market_cap_yesterday_percentage_change: number
      total_volume_24h_yesterday_percentage_change: number
      last_updated: string
    }
  }
}

export interface CMCQuoteHistorical {
  id: number
  name: string
  symbol: string
  quotes: Array<{
    timestamp: string
    quote: {
      USD: {
        price: number
        volume_24h: number
        market_cap: number
        timestamp: string
      }
    }
  }>
}

class CoinMarketCapAPI {
  private baseUrl: string
  private headers: HeadersInit

  constructor() {
    this.baseUrl = CMC_API_BASE
    this.headers = {
      "Content-Type": "application/json",
      "X-CMC_PRO_API_KEY": API_KEY || "",
      Accept: "application/json",
      "Accept-Encoding": "deflate, gzip",
    }
  }

  async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    if (!API_KEY) {
      throw new Error(
        "CoinMarketCap API key is required. Please set NEXT_PUBLIC_CMC_API_KEY in your environment variables.",
      )
    }

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: this.headers,
          next: { revalidate: 60 }, // Cache for 60 seconds
        })

        if (response.ok) {
          return response
        }

        if (response.status === 429) {
          // Rate limit hit, wait before retry
          await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)))
          continue
        }

        if (response.status === 401) {
          throw new Error("Invalid API key. Please check your CoinMarketCap API key.")
        }

        if (response.status === 403) {
          throw new Error("API access forbidden. Please check your CoinMarketCap subscription plan.")
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
    start = 1,
    limit = 100,
    convert = "USD",
    sort = "market_cap",
    sort_dir = "desc",
  ): Promise<{ data: CMCCryptoData[]; status: any }> {
    const params = new URLSearchParams({
      start: start.toString(),
      limit: limit.toString(),
      convert,
      sort,
      sort_dir,
    })

    const url = `${this.baseUrl}/cryptocurrency/listings/latest?${params}`
    const response = await this.fetchWithRetry(url)
    return response.json()
  }

  async getGlobalMetrics(convert = "USD"): Promise<{ data: CMCGlobalMetrics; status: any }> {
    const params = new URLSearchParams({ convert })
    const url = `${this.baseUrl}/global-metrics/quotes/latest?${params}`
    const response = await this.fetchWithRetry(url)
    return response.json()
  }

  async getCryptocurrencyInfo(id: string): Promise<any> {
    const params = new URLSearchParams({ id })
    const url = `${this.baseUrl}/cryptocurrency/info?${params}`
    const response = await this.fetchWithRetry(url)
    return response.json()
  }

  async getQuotesHistorical(
    id: number,
    time_start?: string,
    time_end?: string,
    count = 24,
    interval = "1h",
    convert = "USD",
  ): Promise<{ data: CMCQuoteHistorical; status: any }> {
    const params = new URLSearchParams({
      id: id.toString(),
      count: count.toString(),
      interval,
      convert,
      ...(time_start && { time_start }),
      ...(time_end && { time_end }),
    })

    const url = `${this.baseUrl}/cryptocurrency/quotes/historical?${params}`
    const response = await this.fetchWithRetry(url)
    return response.json()
  }

  async getTrendingMostVisited(): Promise<any> {
    const url = `${this.baseUrl}/cryptocurrency/trending/most-visited`
    const response = await this.fetchWithRetry(url)
    return response.json()
  }

  async getTrendingGainersLosers(time_period = "24h", start = 1, limit = 10, convert = "USD"): Promise<any> {
    const params = new URLSearchParams({
      time_period,
      start: start.toString(),
      limit: limit.toString(),
      convert,
    })

    const url = `${this.baseUrl}/cryptocurrency/trending/gainers-losers?${params}`
    const response = await this.fetchWithRetry(url)
    return response.json()
  }

  async getFearGreedIndex(): Promise<any> {
    try {
      // Alternative Fear & Greed Index API since CMC doesn't provide this
      const response = await fetch("https://api.alternative.me/fng/")
      return response.json()
    } catch (error) {
      console.error("Fear & Greed Index API error:", error)
      return { data: [{ value: "50", value_classification: "Neutral" }] }
    }
  }
}

export const cmcAPI = new CoinMarketCapAPI()

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

export function formatPercentage(percentage: number): string {
  return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`
}

// Get cryptocurrency logo URL
export function getCryptoLogo(id: number, size: 32 | 64 | 128 | 200 = 64): string {
  return `https://s2.coinmarketcap.com/static/img/coins/${size}x${size}/${id}.png`
}
