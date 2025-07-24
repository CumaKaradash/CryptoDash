"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Search, Filter, Star, Eye, BarChart3 } from "lucide-react"
import { useCryptoData } from "@/hooks/use-crypto-api"
import { formatPrice, formatMarketCap, formatVolume, formatPercentage, getCryptoLogo } from "@/lib/api-client"

export default function MarketsPage() {
  const { cryptoData, loading } = useCryptoData(60000)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("market_cap")
  const [filterBy, setFilterBy] = useState("all")

  const filteredAndSortedCryptos = cryptoData
    .filter((crypto) => {
      const matchesSearch =
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())

      if (filterBy === "all") return matchesSearch
      if (filterBy === "gainers") return matchesSearch && crypto.quote.USD.percent_change_24h > 0
      if (filterBy === "losers") return matchesSearch && crypto.quote.USD.percent_change_24h < 0
      if (filterBy === "stable") return matchesSearch && Math.abs(crypto.quote.USD.percent_change_24h) < 1

      return matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "market_cap":
          return b.quote.USD.market_cap - a.quote.USD.market_cap
        case "price":
          return b.quote.USD.price - a.quote.USD.price
        case "volume":
          return b.quote.USD.volume_24h - a.quote.USD.volume_24h
        case "change_24h":
          return b.quote.USD.percent_change_24h - a.quote.USD.percent_change_24h
        default:
          return a.cmc_rank - b.cmc_rank
      }
    })

  const topGainers = cryptoData
    .filter((crypto) => crypto.quote.USD.percent_change_24h > 0)
    .sort((a, b) => b.quote.USD.percent_change_24h - a.quote.USD.percent_change_24h)
    .slice(0, 5)

  const topLosers = cryptoData
    .filter((crypto) => crypto.quote.USD.percent_change_24h < 0)
    .sort((a, b) => a.quote.USD.percent_change_24h - b.quote.USD.percent_change_24h)
    .slice(0, 5)

  const highVolume = cryptoData.sort((a, b) => b.quote.USD.volume_24h - a.quote.USD.volume_24h).slice(0, 5)

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Markets</h1>
          <p className="text-muted-foreground">Explore cryptocurrency markets and trends</p>
        </div>
      </div>

      {/* Market Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Top Gainer (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : topGainers.length > 0 ? (
              <div className="flex items-center gap-3">
                <img
                  src={getCryptoLogo(topGainers[0].id, 32) || "/placeholder.svg"}
                  alt={topGainers[0].name}
                  className="w-8 h-8"
                />
                <div>
                  <div className="font-medium">{topGainers[0].symbol}</div>
                  <Badge variant="default" className="text-xs">
                    +{formatPercentage(topGainers[0].quote.USD.percent_change_24h)}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Top Loser (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : topLosers.length > 0 ? (
              <div className="flex items-center gap-3">
                <img
                  src={getCryptoLogo(topLosers[0].id, 32) || "/placeholder.svg"}
                  alt={topLosers[0].name}
                  className="w-8 h-8"
                />
                <div>
                  <div className="font-medium">{topLosers[0].symbol}</div>
                  <Badge variant="destructive" className="text-xs">
                    {formatPercentage(topLosers[0].quote.USD.percent_change_24h)}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Highest Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : highVolume.length > 0 ? (
              <div className="flex items-center gap-3">
                <img
                  src={getCryptoLogo(highVolume[0].id, 32) || "/placeholder.svg"}
                  alt={highVolume[0].name}
                  className="w-8 h-8"
                />
                <div>
                  <div className="font-medium">{highVolume[0].symbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatVolume(highVolume[0].quote.USD.volume_24h)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Markets</TabsTrigger>
            <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers">Top Losers</TabsTrigger>
            <TabsTrigger value="volume">High Volume</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market_cap">Market Cap</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="change_24h">24h Change</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="gainers">Gainers</SelectItem>
                <SelectItem value="losers">Losers</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Cryptocurrencies</CardTitle>
              <CardDescription>Complete market overview with real-time data</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
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
                      <TableHead>Volume (24h)</TableHead>
                      <TableHead>Market Cap</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedCryptos.map((crypto) => (
                      <TableRow key={crypto.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">#{crypto.cmc_rank}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={getCryptoLogo(crypto.id, 32) || "/placeholder.svg"}
                              alt={crypto.name}
                              className="w-8 h-8"
                            />
                            <div>
                              <div className="font-medium">{crypto.name}</div>
                              <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">${formatPrice(crypto.quote.USD.price)}</TableCell>
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
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon">
                              <Star className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gainers">
          <Card>
            <CardHeader>
              <CardTitle>Top Gainers (24h)</CardTitle>
              <CardDescription>Cryptocurrencies with the highest 24-hour gains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topGainers.map((crypto, index) => (
                  <div key={crypto.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                      <img
                        src={getCryptoLogo(crypto.id, 32) || "/placeholder.svg"}
                        alt={crypto.name}
                        className="w-8 h-8"
                      />
                      <div>
                        <div className="font-medium">{crypto.name}</div>
                        <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${formatPrice(crypto.quote.USD.price)}</div>
                      <Badge variant="default" className="text-sm">
                        <TrendingUp className="h-3 w-3 mr-1" />+{formatPercentage(crypto.quote.USD.percent_change_24h)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="losers">
          <Card>
            <CardHeader>
              <CardTitle>Top Losers (24h)</CardTitle>
              <CardDescription>Cryptocurrencies with the highest 24-hour losses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topLosers.map((crypto, index) => (
                  <div key={crypto.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                      <img
                        src={getCryptoLogo(crypto.id, 32) || "/placeholder.svg"}
                        alt={crypto.name}
                        className="w-8 h-8"
                      />
                      <div>
                        <div className="font-medium">{crypto.name}</div>
                        <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${formatPrice(crypto.quote.USD.price)}</div>
                      <Badge variant="destructive" className="text-sm">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {formatPercentage(crypto.quote.USD.percent_change_24h)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume">
          <Card>
            <CardHeader>
              <CardTitle>High Volume (24h)</CardTitle>
              <CardDescription>Cryptocurrencies with the highest trading volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {highVolume.map((crypto, index) => (
                  <div key={crypto.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                      <img
                        src={getCryptoLogo(crypto.id, 32) || "/placeholder.svg"}
                        alt={crypto.name}
                        className="w-8 h-8"
                      />
                      <div>
                        <div className="font-medium">{crypto.name}</div>
                        <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${formatPrice(crypto.quote.USD.price)}</div>
                      <div className="text-sm text-muted-foreground">
                        Vol: {formatVolume(crypto.quote.USD.volume_24h)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
