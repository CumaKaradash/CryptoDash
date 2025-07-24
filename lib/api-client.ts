// Client-side API functions that call our Next.js API routes
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

class APIClient {
  async getCryptocurrencies(
    start = 1,
    limit = 50,
    convert = "USD",
    sort = "market_cap",
  ): Promise<{ data: CMCCryptoData[]; status: any }> {
    const params = new URLSearchParams({
      start: start.toString(),
      limit: limit.toString(),
      convert,
      sort,
    })

    const response = await fetch(`/api/crypto/listings?${params}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch cryptocurrencies: ${response.statusText}`)
    }
    return response.json()
  }

  async getGlobalMetrics(): Promise<{ data: CMCGlobalMetrics; status: any }> {
    const response = await fetch("/api/crypto/global")
    if (!response.ok) {
      throw new Error(`Failed to fetch global metrics: ${response.statusText}`)
    }
    return response.json()
  }

  async getCoinHistory(coinId: number, count = 24, interval = "1h"): Promise<{ data: any; status: any }> {
    const params = new URLSearchParams({
      count: count.toString(),
      interval,
    })

    const response = await fetch(`/api/crypto/history/${coinId}?${params}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch coin history: ${response.statusText}`)
    }
    return response.json()
  }

  async getTrendingData(): Promise<any> {
    const response = await fetch("/api/crypto/trending")
    if (!response.ok) {
      throw new Error(`Failed to fetch trending data: ${response.statusText}`)
    }
    return response.json()
  }

  async getFearGreedIndex(): Promise<any> {
    try {
      const response = await fetch("https://api.alternative.me/fng/")
      return response.json()
    } catch (error) {
      console.error("Fear & Greed Index API error:", error)
      return { data: [{ value: "50", value_classification: "Neutral" }] }
    }
  }
}

export const apiClient = new APIClient()

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
