// NewsAPI.org integration for cryptocurrency news
const NEWS_API_BASE = "https://newsapi.org/v2"
const API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY

export interface NewsArticle {
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
}

export interface NewsResponse {
  status: string
  totalResults: number
  articles: NewsArticle[]
}

class NewsAPI {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = NEWS_API_BASE
    this.apiKey = API_KEY || ""
  }

  async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    if (!this.apiKey) {
      throw new Error("NewsAPI key is required. Please set NEXT_PUBLIC_NEWS_API_KEY in your environment variables.")
    }

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            "X-API-Key": this.apiKey,
            "User-Agent": "CryptoDashboard/1.0",
          },
          next: { revalidate: 300 }, // Cache for 5 minutes
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
          throw new Error("Invalid NewsAPI key. Please check your API key.")
        }

        if (response.status === 426) {
          throw new Error("NewsAPI upgrade required. Free tier has limitations.")
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      } catch (error) {
        if (i === retries - 1) throw error
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
    throw new Error("Max retries reached")
  }

  async getCryptoNews(
    query = "cryptocurrency OR bitcoin OR ethereum OR blockchain OR crypto",
    sortBy = "publishedAt",
    pageSize = 20,
    page = 1,
  ): Promise<NewsResponse> {
    const params = new URLSearchParams({
      q: query,
      sortBy,
      pageSize: pageSize.toString(),
      page: page.toString(),
      language: "en",
    })

    const url = `${this.baseUrl}/everything?${params}`
    const response = await this.fetchWithRetry(url)
    return response.json()
  }

  async getTopHeadlines(category = "technology", country = "us", pageSize = 10): Promise<NewsResponse> {
    const params = new URLSearchParams({
      category,
      country,
      pageSize: pageSize.toString(),
    })

    const url = `${this.baseUrl}/top-headlines?${params}`
    const response = await this.fetchWithRetry(url)
    return response.json()
  }

  async searchNews(query: string, sortBy = "publishedAt", pageSize = 20): Promise<NewsResponse> {
    const params = new URLSearchParams({
      q: query,
      sortBy,
      pageSize: pageSize.toString(),
      language: "en",
    })

    const url = `${this.baseUrl}/everything?${params}`
    const response = await this.fetchWithRetry(url)
    return response.json()
  }

  async getNewsBySource(sources: string[], pageSize = 20): Promise<NewsResponse> {
    const params = new URLSearchParams({
      sources: sources.join(","),
      pageSize: pageSize.toString(),
    })

    const url = `${this.baseUrl}/everything?${params}`
    const response = await this.fetchWithRetry(url)
    return response.json()
  }
}

export const newsAPI = new NewsAPI()

// Utility functions
export function categorizeNews(article: NewsArticle): string {
  const title = article.title.toLowerCase()
  const description = (article.description || "").toLowerCase()
  const content = title + " " + description

  if (content.includes("regulation") || content.includes("sec") || content.includes("government")) {
    return "regulation"
  }
  if (content.includes("defi") || content.includes("smart contract") || content.includes("blockchain")) {
    return "technology"
  }
  if (content.includes("adoption") || content.includes("institutional") || content.includes("bank")) {
    return "adoption"
  }
  if (content.includes("price") || content.includes("market") || content.includes("trading")) {
    return "market"
  }
  return "general"
}

export function analyzeSentiment(article: NewsArticle): "positive" | "negative" | "neutral" {
  const content = ((article.title || "") + " " + (article.description || "")).toLowerCase()

  const positiveWords = [
    "surge",
    "rise",
    "gain",
    "bull",
    "growth",
    "adoption",
    "breakthrough",
    "success",
    "positive",
    "up",
    "high",
    "record",
  ]
  const negativeWords = [
    "crash",
    "fall",
    "drop",
    "bear",
    "decline",
    "hack",
    "scam",
    "ban",
    "negative",
    "down",
    "low",
    "loss",
  ]

  const positiveCount = positiveWords.filter((word) => content.includes(word)).length
  const negativeCount = negativeWords.filter((word) => content.includes(word)).length

  if (positiveCount > negativeCount) return "positive"
  if (negativeCount > positiveCount) return "negative"
  return "neutral"
}

export function extractRelatedCoins(article: NewsArticle): string[] {
  const content = ((article.title || "") + " " + (article.description || "")).toLowerCase()
  const coins: string[] = []

  const coinMap = {
    bitcoin: "BTC",
    btc: "BTC",
    ethereum: "ETH",
    eth: "ETH",
    solana: "SOL",
    sol: "SOL",
    cardano: "ADA",
    ada: "ADA",
    polkadot: "DOT",
    dot: "DOT",
    chainlink: "LINK",
    link: "LINK",
    polygon: "MATIC",
    matic: "MATIC",
    avalanche: "AVAX",
    avax: "AVAX",
    dogecoin: "DOGE",
    doge: "DOGE",
    shiba: "SHIB",
    ripple: "XRP",
    xrp: "XRP",
  }

  for (const [keyword, symbol] of Object.entries(coinMap)) {
    if (content.includes(keyword) && !coins.includes(symbol)) {
      coins.push(symbol)
    }
  }

  return coins.slice(0, 3) // Limit to 3 coins
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  return date.toLocaleDateString()
}
