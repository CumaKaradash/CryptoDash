"use client"

import { useCoinHistory } from "@/hooks/use-crypto-api"
import { Skeleton } from "@/components/ui/skeleton"

interface PriceChartProps {
  crypto: {
    id: number
    name: string
    symbol: string
    quote: {
      USD: {
        price: number
        percent_change_24h: number
      }
    }
  }
  timeframe?: string
}

export function PriceChart({ crypto, timeframe = "1d" }: PriceChartProps) {
  // Convert timeframe to API parameters
  const getTimeframeParams = (tf: string) => {
    switch (tf) {
      case "1d":
        return { interval: "1h", count: 24 }
      case "7d":
        return { interval: "4h", count: 42 }
      case "30d":
        return { interval: "1d", count: 30 }
      case "1y":
        return { interval: "1w", count: 52 }
      default:
        return { interval: "1h", count: 24 }
    }
  }

  const { interval, count } = getTimeframeParams(timeframe)
  const { historyData, loading, error } = useCoinHistory(crypto.id, interval, count)

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  if (error || !historyData?.quotes) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-muted-foreground">
        Unable to load chart data for {timeframe}
      </div>
    )
  }

  const prices = historyData.quotes.map((quote: any) => quote.quote.USD.price)
  const maxPrice = Math.max(...prices)
  const minPrice = Math.min(...prices)
  const priceRange = maxPrice - minPrice

  const generatePath = () => {
    if (prices.length === 0) return ""

    const width = 400
    const height = 200
    const stepX = width / (prices.length - 1)

    let path = `M 0 ${height - ((prices[0] - minPrice) / priceRange) * height}`

    for (let i = 1; i < prices.length; i++) {
      const x = i * stepX
      const y = height - ((prices[i] - minPrice) / priceRange) * height
      path += ` L ${x} ${y}`
    }

    return path
  }

  const isPositive = crypto.quote.USD.percent_change_24h >= 0

  return (
    <div className="w-full h-48 relative">
      <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
        <defs>
          <linearGradient id={`gradient-${crypto.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <defs>
          <pattern id={`grid-${crypto.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${crypto.id})`} />

        {/* Area under curve */}
        <path d={`${generatePath()} L 400 200 L 0 200 Z`} fill={`url(#gradient-${crypto.id})`} />

        {/* Price line */}
        <path
          d={generatePath()}
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {prices.map((price, index) => {
          const x = (index / (prices.length - 1)) * 400
          const y = 200 - ((price - minPrice) / priceRange) * 200

          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={isPositive ? "#10b981" : "#ef4444"}
              className="opacity-0 hover:opacity-100 transition-opacity"
            />
          )
        })}
      </svg>

      {/* Price labels */}
      <div className="absolute top-0 right-0 text-xs text-muted-foreground">${maxPrice.toFixed(2)}</div>
      <div className="absolute bottom-0 right-0 text-xs text-muted-foreground">${minPrice.toFixed(2)}</div>

      {/* Timeframe indicator */}
      <div className="absolute top-0 left-0 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        {timeframe.toUpperCase()}
      </div>
    </div>
  )
}
