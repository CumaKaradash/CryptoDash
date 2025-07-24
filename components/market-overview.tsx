"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Activity, Globe, Flame } from "lucide-react"
import { useTrendingData, useFearGreedIndex } from "@/hooks/use-crypto-api"
import { formatPercentage, getCryptoLogo } from "@/lib/api-client"

export function MarketOverview() {
  const { trendingData, loading: trendingLoading } = useTrendingData()
  const { fearGreedData, loading: fearGreedLoading } = useFearGreedIndex()

  const getFearGreedColor = (value: string) => {
    const numValue = Number.parseInt(value)
    if (numValue <= 25) return "text-red-600"
    if (numValue <= 45) return "text-orange-600"
    if (numValue <= 55) return "text-yellow-600"
    if (numValue <= 75) return "text-green-600"
    return "text-blue-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
        <CardDescription>Key market indicators and trends</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fear & Greed Index */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium">Fear & Greed Index</div>
                <div className="text-sm text-muted-foreground">Market sentiment</div>
              </div>
            </div>
            <div className="text-right">
              {fearGreedLoading ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <>
                  <div className={`font-bold text-lg ${getFearGreedColor(fearGreedData?.data?.[0]?.value || "50")}`}>
                    {fearGreedData?.data?.[0]?.value || "50"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fearGreedData?.data?.[0]?.value_classification || "Neutral"}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Top Gainers */}
        {trendingData?.gainers && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Top Gainers (24h)
            </h4>
            <div className="space-y-2">
              {trendingData.gainers.slice(0, 3).map((gainer: any) => (
                <div key={gainer.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <img
                      src={getCryptoLogo(gainer.id, 32) || "/placeholder.svg"}
                      alt={gainer.name}
                      className="w-4 h-4"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=16&width=16"
                      }}
                    />
                    <span className="font-medium">{gainer.symbol}</span>
                  </div>
                  <Badge variant="default" className="text-xs">
                    {formatPercentage(gainer.quote.USD.percent_change_24h)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Losers */}
        {trendingData?.losers && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Top Losers (24h)
            </h4>
            <div className="space-y-2">
              {trendingData.losers.slice(0, 3).map((loser: any) => (
                <div key={loser.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <img
                      src={getCryptoLogo(loser.id, 32) || "/placeholder.svg"}
                      alt={loser.name}
                      className="w-4 h-4"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=16&width=16"
                      }}
                    />
                    <span className="font-medium">{loser.symbol}</span>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {formatPercentage(loser.quote.USD.percent_change_24h)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most Visited */}
        {trendingData?.mostVisited && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-600" />
              Most Visited
            </h4>
            <div className="space-y-2">
              {trendingData.mostVisited.slice(0, 3).map((coin: any, index: number) => (
                <div key={coin.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <img
                      src={getCryptoLogo(coin.id, 32) || "/placeholder.svg"}
                      alt={coin.name}
                      className="w-4 h-4"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=16&width=16"
                      }}
                    />
                    <span className="font-medium">{coin.symbol}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Stats */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-600" />
            Market Stats
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Provider</span>
              <span className="font-medium">CoinMarketCap</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Update Frequency</span>
              <span className="font-medium">1 minute</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">API Status</span>
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
