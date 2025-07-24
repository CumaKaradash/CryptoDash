import { type NextRequest, NextResponse } from "next/server"

const CMC_API_BASE = "https://pro-api.coinmarketcap.com/v1"
const API_KEY = process.env.NEXT_PUBLIC_CMC_API_KEY

function generateDemoHistory(basePrice: number, hours = 24) {
  const quotes = []
  const now = new Date()

  for (let i = hours - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
    const variation = (Math.random() - 0.5) * 0.08 // ±4% variation
    const trendFactor = Math.sin((i / hours) * Math.PI * 2) * 0.02 // Slight trend
    const price = basePrice * (1 + variation + trendFactor)

    quotes.push({
      timestamp: timestamp.toISOString(),
      quote: {
        USD: {
          price: Math.max(price, basePrice * 0.8), // Prevent too low prices
          volume_24h: Math.random() * 1000000000 + 500000000,
          market_cap: price * 19750000, // Assuming Bitcoin-like supply
          timestamp: timestamp.toISOString(),
        },
      },
    })
  }

  return { quotes }
}

function getCoinBasePrice(coinId: string): number {
  const priceMap: { [key: string]: number } = {
    "1": 43250, // Bitcoin
    "1027": 2650, // Ethereum
    "825": 1.0001, // USDT
    "1839": 315.5, // BNB
    "5426": 98.75, // Solana
    "2010": 0.485, // Cardano
    "52": 0.52, // XRP
    "74": 0.082, // Dogecoin
    "3408": 35.5, // Avalanche
    "6636": 7.2, // Polkadot
  }
  return priceMap[coinId] || 100 // Default price for unknown coins
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const coinId = params.id
    const searchParams = request.nextUrl.searchParams
    const count = searchParams.get("count") || "24"
    const interval = searchParams.get("interval") || "1h"

    // Always use demo data for historical charts to avoid 403 errors
    // Historical data often requires premium CMC subscription
    const basePrice = getCoinBasePrice(coinId)
    const demoHistory = generateDemoHistory(basePrice, Number.parseInt(count))

    const demoData = {
      data: {
        id: Number.parseInt(coinId),
        name: getCoinName(coinId),
        symbol: getCoinSymbol(coinId),
        quotes: demoHistory.quotes,
      },
      status: {
        timestamp: new Date().toISOString(),
        error_code: 0,
        error_message: null,
        elapsed: 8,
        credit_count: 1,
        notice: API_KEY
          ? "Historical data simulated - CMC historical endpoint requires premium plan"
          : "Demo data - no API key provided",
      },
    }

    return NextResponse.json(demoData)

    // Commented out the actual API call since it often requires premium subscription
    /*
    if (!API_KEY) {
      return NextResponse.json(demoData)
    }

    const params_obj = new URLSearchParams({
      id: coinId,
      count,
      interval,
      convert: "USD",
    })

    const response = await fetch(`${CMC_API_BASE}/cryptocurrency/quotes/historical?${params_obj}`, {
      headers: {
        "X-CMC_PRO_API_KEY": API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 300 }, // 5 minutes cache
    })

    if (!response.ok) {
      console.log(`Historical data API failed with ${response.status}, using demo data`)
      return NextResponse.json(demoData)
    }

    const data = await response.json()
    return NextResponse.json(data)
    */
  } catch (error) {
    console.error("Error fetching coin history:", error)

    // Return demo data on any error
    const coinId = params.id
    const count = request.nextUrl.searchParams.get("count") || "24"
    const basePrice = getCoinBasePrice(coinId)
    const demoHistory = generateDemoHistory(basePrice, Number.parseInt(count))

    const demoData = {
      data: {
        id: Number.parseInt(coinId),
        name: getCoinName(coinId),
        symbol: getCoinSymbol(coinId),
        quotes: demoHistory.quotes,
      },
      status: {
        timestamp: new Date().toISOString(),
        error_code: 0,
        error_message: null,
        elapsed: 8,
        credit_count: 1,
        notice: "Demo data - API error fallback",
      },
    }

    return NextResponse.json(demoData)
  }
}

function getCoinName(coinId: string): string {
  const nameMap: { [key: string]: string } = {
    "1": "Bitcoin",
    "1027": "Ethereum",
    "825": "Tether USDt",
    "1839": "BNB",
    "5426": "Solana",
    "2010": "Cardano",
    "52": "XRP",
    "74": "Dogecoin",
    "3408": "Avalanche",
    "6636": "Polkadot",
  }
  return nameMap[coinId] || "Cryptocurrency"
}

function getCoinSymbol(coinId: string): string {
  const symbolMap: { [key: string]: string } = {
    "1": "BTC",
    "1027": "ETH",
    "825": "USDT",
    "1839": "BNB",
    "5426": "SOL",
    "2010": "ADA",
    "52": "XRP",
    "74": "DOGE",
    "3408": "AVAX",
    "6636": "DOT",
  }
  return symbolMap[coinId] || "CRYPTO"
}
