import { type NextRequest, NextResponse } from "next/server"
import { newsAPI, categorizeNews, analyzeSentiment, extractRelatedCoins } from "@/lib/news-api"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || "cryptocurrency OR bitcoin OR ethereum OR blockchain OR crypto"
    const category = searchParams.get("category") || "all"
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")

    // If no API key, return demo data
    if (!process.env.NEXT_PUBLIC_NEWS_API_KEY) {
      const demoNews = {
        status: "ok",
        totalResults: 5,
        articles: [
          {
            source: { id: null, name: "CryptoNews" },
            author: "John Doe",
            title: "Bitcoin Reaches New All-Time High as Institutional Adoption Grows",
            description:
              "Bitcoin surged to a new record high today, driven by increased institutional investment and growing mainstream acceptance.",
            url: "#",
            urlToImage: "/placeholder.svg?height=200&width=400&text=Bitcoin+News",
            publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            content: "Bitcoin has reached unprecedented levels...",
          },
          {
            source: { id: null, name: "EthereumDaily" },
            author: "Jane Smith",
            title: "Ethereum 2.0 Staking Rewards Hit Record Levels",
            description:
              "Ethereum staking rewards have reached unprecedented levels as more validators join the network.",
            url: "#",
            urlToImage: "/placeholder.svg?height=200&width=400&text=Ethereum+Staking",
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            content: "Ethereum staking has become increasingly popular...",
          },
          {
            source: { id: null, name: "RegulationWatch" },
            author: "Mike Johnson",
            title: "New Cryptocurrency Regulations Proposed by Financial Authorities",
            description:
              "Financial regulators have announced new proposed regulations for cryptocurrency exchanges and trading platforms.",
            url: "#",
            urlToImage: "/placeholder.svg?height=200&width=400&text=Crypto+Regulation",
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            content: "New regulations aim to provide clearer guidelines...",
          },
        ],
      }

      return NextResponse.json(demoNews)
    }

    let newsResponse

    if (category === "headlines") {
      newsResponse = await newsAPI.getTopHeadlines("technology", "us", pageSize)
    } else {
      let searchQuery = query
      if (category !== "all") {
        searchQuery = `${query} AND ${category}`
      }
      newsResponse = await newsAPI.getCryptoNews(searchQuery, "publishedAt", pageSize, page)
    }

    // Process articles to add metadata
    const processedArticles = newsResponse.articles.map((article) => ({
      ...article,
      category: categorizeNews(article),
      sentiment: analyzeSentiment(article),
      relatedCoins: extractRelatedCoins(article),
      id: Buffer.from(article.url).toString("base64").slice(0, 16), // Generate unique ID
    }))

    const response = {
      ...newsResponse,
      articles: processedArticles,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching news:", error)

    // Return demo data on error
    const demoNews = {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to fetch news",
      totalResults: 3,
      articles: [
        {
          id: "demo1",
          source: { id: null, name: "CryptoNews" },
          author: "Demo Author",
          title: "Demo: Bitcoin Market Analysis",
          description: "This is demo news data. Please check your NewsAPI configuration.",
          url: "#",
          urlToImage: "/placeholder.svg?height=200&width=400&text=Demo+News",
          publishedAt: new Date().toISOString(),
          content: "Demo content...",
          category: "market",
          sentiment: "neutral" as const,
          relatedCoins: ["BTC"],
        },
      ],
    }

    return NextResponse.json(demoNews)
  }
}
