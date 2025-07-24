import { type NextRequest, NextResponse } from "next/server"

const CMC_API_BASE = "https://pro-api.coinmarketcap.com/v1"
const API_KEY = process.env.NEXT_PUBLIC_CMC_API_KEY

function generateDemoListings() {
  const baseData = [
    {
      id: 1,
      name: "Bitcoin",
      symbol: "BTC",
      slug: "bitcoin",
      cmc_rank: 1,
      basePrice: 43250,
      marketCap: 847200000000,
      volume: 28500000000,
    },
    {
      id: 1027,
      name: "Ethereum",
      symbol: "ETH",
      slug: "ethereum",
      cmc_rank: 2,
      basePrice: 2650,
      marketCap: 318400000000,
      volume: 15200000000,
    },
    {
      id: 825,
      name: "Tether USDt",
      symbol: "USDT",
      slug: "tether",
      cmc_rank: 3,
      basePrice: 1.0001,
      marketCap: 95009500000,
      volume: 45000000000,
    },
    {
      id: 1839,
      name: "BNB",
      symbol: "BNB",
      slug: "bnb",
      cmc_rank: 4,
      basePrice: 315.5,
      marketCap: 47200000000,
      volume: 1800000000,
    },
    {
      id: 5426,
      name: "Solana",
      symbol: "SOL",
      slug: "solana",
      cmc_rank: 5,
      basePrice: 98.75,
      marketCap: 42800000000,
      volume: 2100000000,
    },
    {
      id: 2010,
      name: "Cardano",
      symbol: "ADA",
      slug: "cardano",
      cmc_rank: 6,
      basePrice: 0.485,
      marketCap: 17100000000,
      volume: 485000000,
    },
    {
      id: 52,
      name: "XRP",
      symbol: "XRP",
      slug: "ripple",
      cmc_rank: 7,
      basePrice: 0.52,
      marketCap: 28600000000,
      volume: 1200000000,
    },
    {
      id: 74,
      name: "Dogecoin",
      symbol: "DOGE",
      slug: "dogecoin",
      cmc_rank: 8,
      basePrice: 0.082,
      marketCap: 11700000000,
      volume: 892000000,
    },
    {
      id: 3408,
      name: "Avalanche",
      symbol: "AVAX",
      slug: "avalanche",
      cmc_rank: 9,
      basePrice: 35.5,
      marketCap: 13500000000,
      volume: 650000000,
    },
    {
      id: 6636,
      name: "Polkadot",
      symbol: "DOT",
      slug: "polkadot",
      cmc_rank: 10,
      basePrice: 7.2,
      marketCap: 9800000000,
      volume: 320000000,
    },
  ]

  return baseData.map((coin) => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    slug: coin.slug,
    cmc_rank: coin.cmc_rank,
    num_market_pairs: Math.floor(Math.random() * 1000) + 100,
    circulating_supply: coin.marketCap / coin.basePrice,
    total_supply: coin.marketCap / coin.basePrice,
    max_supply: coin.symbol === "BTC" ? 21000000 : null,
    infinite_supply: coin.symbol !== "BTC",
    last_updated: new Date().toISOString(),
    date_added: "2013-04-28T00:00:00.000Z",
    tags: ["cryptocurrency"],
    platform: null,
    self_reported_circulating_supply: 0,
    self_reported_market_cap: 0,
    quote: {
      USD: {
        price: coin.basePrice * (1 + (Math.random() - 0.5) * 0.05), // ±2.5% variation
        volume_24h: coin.volume * (1 + (Math.random() - 0.5) * 0.2),
        volume_change_24h: (Math.random() - 0.5) * 10,
        percent_change_1h: (Math.random() - 0.5) * 4,
        percent_change_24h: (Math.random() - 0.5) * 15,
        percent_change_7d: (Math.random() - 0.5) * 30,
        percent_change_30d: (Math.random() - 0.5) * 50,
        percent_change_60d: (Math.random() - 0.5) * 80,
        percent_change_90d: (Math.random() - 0.5) * 100,
        market_cap: coin.marketCap * (1 + (Math.random() - 0.5) * 0.1),
        market_cap_dominance: coin.cmc_rank === 1 ? 52.4 : Math.random() * 10,
        fully_diluted_market_cap: coin.marketCap * 1.1,
        last_updated: new Date().toISOString(),
      },
    },
  }))
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const start = searchParams.get("start") || "1"
    const limit = searchParams.get("limit") || "50"
    const convert = searchParams.get("convert") || "USD"
    const sort = searchParams.get("sort") || "market_cap"

    if (!API_KEY) {
      // Return demo data if no API key
      const demoData = {
        data: generateDemoListings(),
        status: {
          timestamp: new Date().toISOString(),
          error_code: 0,
          error_message: null,
          elapsed: 10,
          credit_count: 1,
          notice: "Demo data - no API key provided",
        },
      }

      return NextResponse.json(demoData)
    }

    const params = new URLSearchParams({
      start,
      limit,
      convert,
      sort,
      sort_dir: "desc",
    })

    const response = await fetch(`${CMC_API_BASE}/cryptocurrency/listings/latest?${params}`, {
      headers: {
        "X-CMC_PRO_API_KEY": API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      console.log(`Listings API failed with ${response.status}, using demo data`)
      // Return demo data on API failure
      const demoData = {
        data: generateDemoListings(),
        status: {
          timestamp: new Date().toISOString(),
          error_code: 0,
          error_message: null,
          elapsed: 10,
          credit_count: 1,
          notice: "Demo data - API error fallback",
        },
      }
      return NextResponse.json(demoData)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching crypto listings:", error)

    // Return demo data on any error
    const demoData = {
      data: generateDemoListings(),
      status: {
        timestamp: new Date().toISOString(),
        error_code: 0,
        error_message: null,
        elapsed: 10,
        credit_count: 1,
        notice: "Demo data - API error fallback",
      },
    }
    return NextResponse.json(demoData)
  }
}
