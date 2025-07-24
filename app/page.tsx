"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Wallet, Star, RefreshCw, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { PriceChart } from "@/components/price-chart"
import { MarketOverview } from "@/components/market-overview"
import { Watchlist } from "@/components/watchlist"
import { ApiStatus } from "@/components/api-status"
import { useCryptoData } from "@/hooks/use-crypto-api"
import { formatPrice, formatMarketCap, formatVolume, formatPercentage, getCryptoLogo } from "@/lib/api-client"

export default function CryptoDashboard() {
  const { cryptoData, globalData, loading, error, lastUpdated, refetch } = useCryptoData(60000) // 60 seconds
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState<any>(null)
  const [chartTimeframe, setChartTimeframe] = useState("1d")

  // Set first crypto as selected when data loads
  useEffect(() => {
    if (cryptoData.length > 0 && !selectedCrypto) {
      setSelectedCrypto(cryptoData[0])
    }
  }, [cryptoData, selectedCrypto])

  const filteredCryptos = cryptoData.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
            {error}. The application will continue with demo data.
            <Button onClick={refetch} className="mt-2 w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-6">
      {/* API Status */}
      <div className="mb-6">
        <ApiStatus />
      </div>

      {/* Last Updated Info */}
      {lastUpdated && (
        <div className="mb-4 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
          Last updated: {lastUpdated.toLocaleTimeString()} • Data from CoinMarketCap
          <Button variant="ghost" size="sm" asChild>
            <a href="https://coinmarketcap.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      )}

      {/* Market Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Market Cap</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {globalData ? formatMarketCap(globalData.quote.USD.total_market_cap) : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span
                    className={
                      globalData?.quote.USD.total_market_cap_yesterday_percentage_change >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {formatPercentage(globalData?.quote.USD.total_market_cap_yesterday_percentage_change || 0)}
                  </span>{" "}
                  from yesterday
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {globalData ? formatVolume(globalData.quote.USD.total_volume_24h) : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span
                    className={
                      globalData?.quote.USD.total_volume_24h_yesterday_percentage_change >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {formatPercentage(globalData?.quote.USD.total_volume_24h_yesterday_percentage_change || 0)}
                  </span>{" "}
                  from yesterday
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BTC Dominance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {globalData ? `${globalData.btc_dominance.toFixed(1)}%` : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span
                    className={globalData?.btc_dominance_24h_percentage_change >= 0 ? "text-green-600" : "text-red-600"}
                  >
                    {formatPercentage(globalData?.btc_dominance_24h_percentage_change || 0)}
                  </span>{" "}
                  from yesterday
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cryptos</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {globalData ? globalData.active_cryptocurrencies.toLocaleString() : cryptoData.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {globalData ? globalData.active_exchanges.toLocaleString() : "N/A"} active exchanges
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Chart */}
          {selectedCrypto && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <img
                        src={getCryptoLogo(selectedCrypto.id, 32) || "/placeholder.svg"}
                        alt={selectedCrypto.name}
                        className="w-8 h-8"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                        }}
                      />
                      {selectedCrypto.name} ({selectedCrypto.symbol})
                      <Badge variant="outline" className="text-xs">
                        #{selectedCrypto.cmc_rank}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      ${formatPrice(selectedCrypto.quote.USD.price)}
                      <Badge
                        variant={selectedCrypto.quote.USD.percent_change_24h >= 0 ? "default" : "destructive"}
                        className="ml-2"
                      >
                        {selectedCrypto.quote.USD.percent_change_24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {formatPercentage(selectedCrypto.quote.USD.percent_change_24h)}
                      </Badge>
                    </CardDescription>
                  </div>
                  <Tabs value={chartTimeframe} onValueChange={setChartTimeframe} className="w-auto">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="1d">1D</TabsTrigger>
                      <TabsTrigger value="7d">7D</TabsTrigger>
                      <TabsTrigger value="30d">30D</TabsTrigger>
                      <TabsTrigger value="1y">1Y</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <PriceChart crypto={selectedCrypto} timeframe={chartTimeframe} />
              </CardContent>
            </Card>
          )}

          {/* Market Table */}
          <Card>
            <CardHeader>
              <CardTitle>Market Overview</CardTitle>
              <CardDescription>Cryptocurrency prices and market data</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="ml-auto space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>1h</TableHead>
                      <TableHead>24h</TableHead>
                      <TableHead>7d</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Market Cap</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCryptos.map((crypto) => (
                      <TableRow
                        key={crypto.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedCrypto(crypto)}
                      >
                        <TableCell className="font-medium">#{crypto.cmc_rank}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <img
                              src={getCryptoLogo(crypto.id, 32) || "/placeholder.svg"}
                              alt={crypto.name}
                              className="w-6 h-6"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg?height=24&width=24"
                              }}
                            />
                            <div>
                              <div className="font-medium">{crypto.name}</div>
                              <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>${formatPrice(crypto.quote.USD.price)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={crypto.quote.USD.percent_change_1h >= 0 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {formatPercentage(crypto.quote.USD.percent_change_1h)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={crypto.quote.USD.percent_change_24h >= 0 ? "default" : "destructive"}
                            className="font-medium"
                          >
                            {crypto.quote.USD.percent_change_24h >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {formatPercentage(crypto.quote.USD.percent_change_24h)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={crypto.quote.USD.percent_change_7d >= 0 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {formatPercentage(crypto.quote.USD.percent_change_7d)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatVolume(crypto.quote.USD.volume_24h)}</TableCell>
                        <TableCell>{formatMarketCap(crypto.quote.USD.market_cap)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <Star className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Watchlist cryptos={cryptoData} loading={loading} />
          <MarketOverview />
        </div>
      </div>
    </div>
  )
}
