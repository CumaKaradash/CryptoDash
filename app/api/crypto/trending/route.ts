import { NextResponse } from "next/server"

const CMC_API_BASE = "https://pro-api.coinmarketcap.com/v1"
const API_KEY = process.env.NEXT_PUBLIC_CMC_API_KEY

export async function GET() {
  try {
    if (!API_KEY) {
      // Return demo trending data
      const demoData = {
        gainers: [
          {
            id: 5426,
            name: "Solana",
            symbol: "SOL",
            quote: { USD: { percent_change_24h: 12.5 } },
          },
          {
            id: 3408,
            name: "Avalanche",
            symbol: "AVAX",
            quote: { USD: { percent_change_24h: 8.3 } },
          },
          {
            id: 6636,
            name: "Polkadot",
            symbol: "DOT",
            quote: { USD: { percent_change_24h: 6.7 } },
          },
        ],
        losers: [
          {
            id: 4172,
            name: "Terra Classic",
            symbol: "LUNC",
            quote: { USD: { percent_change_24h: -8.2 } },
          },
          {
            id: 2010,
            name: "Cardano",
            symbol: "ADA",
            quote: { USD: { percent_change_24h: -5.1 } },
          },
          {
            id: 52,
            name: "XRP",
            symbol: "XRP",
            quote: { USD: { percent_change_24h: -3.9 } },
          },
        ],
        trending: [
          { id: 1, name: "Bitcoin", symbol: "BTC" },
          { id: 1027, name: "Ethereum", symbol: "ETH" },
          { id: 5426, name: "Solana", symbol: "SOL" },
        ],
      }

      return NextResponse.json(demoData)
    }

    // Try to fetch trending data from CMC API
    try {
      const gainersLosersResponse = await fetch(
        `${CMC_API_BASE}/cryptocurrency/trending/gainers-losers?time_period=24h&start=1&limit=5&convert=USD`,
        {
          headers: {
            "X-CMC_PRO_API_KEY": API_KEY,
            Accept: "application/json",
          },
          next: { revalidate: 300 },
        },
      )

      if (gainersLosersResponse.ok) {
        const data = await gainersLosersResponse.json()
        return NextResponse.json(data.data)
      }
    } catch (error) {
      console.error("Error fetching trending data:", error)
    }

    // Fallback to demo data if API fails
    const demoData = {
      gainers: [
        {
          id: 5426,
          name: "Solana",
          symbol: "SOL",
          quote: { USD: { percent_change_24h: 12.5 } },
        },
        {
          id: 3408,
          name: "Avalanche",
          symbol: "AVAX",
          quote: { USD: { percent_change_24h: 8.3 } },
        },
      ],
      losers: [
        {
          id: 2010,
          name: "Cardano",
          symbol: "ADA",
          quote: { USD: { percent_change_24h: -5.1 } },
        },
        {
          id: 52,
          name: "XRP",
          symbol: "XRP",
          quote: { USD: { percent_change_24h: -3.9 } },
        },
      ],
    }

    return NextResponse.json(demoData)
  } catch (error) {
    console.error("Error in trending API:", error)
    return NextResponse.json({ error: "Failed to fetch trending data" }, { status: 500 })
  }
}
