import { NextResponse } from "next/server"

const CMC_API_BASE = "https://pro-api.coinmarketcap.com/v1"
const API_KEY = process.env.NEXT_PUBLIC_CMC_API_KEY

function generateDemoGlobalData() {
  return {
    active_cryptocurrencies: 13847,
    total_cryptocurrencies: 26950,
    active_market_pairs: 89234,
    active_exchanges: 750,
    total_exchanges: 1200,
    eth_dominance: 17.2 + (Math.random() - 0.5) * 2,
    btc_dominance: 52.4 + (Math.random() - 0.5) * 3,
    eth_dominance_yesterday: 17.1,
    btc_dominance_yesterday: 52.1,
    eth_dominance_24h_percentage_change: (Math.random() - 0.5) * 2,
    btc_dominance_24h_percentage_change: (Math.random() - 0.5) * 2,
    defi_volume_24h: 4500000000,
    defi_volume_24h_reported: 4500000000,
    defi_market_cap: 85000000000,
    defi_24h_percentage_change: 2.1,
    stablecoin_volume_24h: 45000000000,
    stablecoin_volume_24h_reported: 45000000000,
    stablecoin_market_cap: 125000000000,
    stablecoin_24h_percentage_change: 0.1,
    derivatives_volume_24h: 125000000000,
    derivatives_volume_24h_reported: 125000000000,
    derivatives_24h_percentage_change: 1.5,
    quote: {
      USD: {
        total_market_cap: 1680000000000 * (1 + (Math.random() - 0.5) * 0.1),
        total_volume_24h: 89200000000 * (1 + (Math.random() - 0.5) * 0.2),
        total_volume_24h_reported: 89200000000,
        altcoin_volume_24h: 42000000000,
        altcoin_volume_24h_reported: 42000000000,
        altcoin_market_cap: 800000000000,
        defi_volume_24h: 4500000000,
        defi_volume_24h_reported: 4500000000,
        defi_24h_percentage_change: 2.1,
        defi_market_cap: 85000000000,
        stablecoin_volume_24h: 45000000000,
        stablecoin_volume_24h_reported: 45000000000,
        stablecoin_24h_percentage_change: 0.1,
        stablecoin_market_cap: 125000000000,
        derivatives_volume_24h: 125000000000,
        derivatives_volume_24h_reported: 125000000000,
        derivatives_24h_percentage_change: 1.5,
        total_market_cap_yesterday: 1645000000000,
        total_volume_24h_yesterday: 87300000000,
        total_market_cap_yesterday_percentage_change: (Math.random() - 0.5) * 8,
        total_volume_24h_yesterday_percentage_change: (Math.random() - 0.5) * 10,
        last_updated: new Date().toISOString(),
      },
    },
  }
}

export async function GET() {
  try {
    if (!API_KEY) {
      // Return demo global data if no API key
      const demoData = {
        data: generateDemoGlobalData(),
        status: {
          timestamp: new Date().toISOString(),
          error_code: 0,
          error_message: null,
          elapsed: 5,
          credit_count: 1,
          notice: "Demo data - no API key provided",
        },
      }

      return NextResponse.json(demoData)
    }

    const response = await fetch(`${CMC_API_BASE}/global-metrics/quotes/latest?convert=USD`, {
      headers: {
        "X-CMC_PRO_API_KEY": API_KEY,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      console.log(`Global metrics API failed with ${response.status}, using demo data`)
      // Return demo data on API failure
      const demoData = {
        data: generateDemoGlobalData(),
        status: {
          timestamp: new Date().toISOString(),
          error_code: 0,
          error_message: null,
          elapsed: 5,
          credit_count: 1,
          notice: "Demo data - API error fallback",
        },
      }
      return NextResponse.json(demoData)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching global metrics:", error)

    // Return demo data on any error
    const demoData = {
      data: generateDemoGlobalData(),
      status: {
        timestamp: new Date().toISOString(),
        error_code: 0,
        error_message: null,
        elapsed: 5,
        credit_count: 1,
        notice: "Demo data - API error fallback",
      },
    }
    return NextResponse.json(demoData)
  }
}
