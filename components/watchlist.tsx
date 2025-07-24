"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Star, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPrice, formatPercentage, getCryptoLogo } from "@/lib/api-client"

interface WatchlistProps {
  cryptos: Array<{
    id: number
    name: string
    symbol: string
    quote: {
      USD: {
        price: number
        percent_change_24h: number
      }
    }
  }>
  loading?: boolean
}

export function Watchlist({ cryptos, loading = false }: WatchlistProps) {
  const [watchlistItems, setWatchlistItems] = useState(cryptos.slice(0, 4))
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState("")

  const handleAddToWatchlist = () => {
    if (!selectedCrypto) return

    const crypto = cryptos.find((c) => c.id.toString() === selectedCrypto)
    if (!crypto) return

    // Check if already in watchlist
    if (watchlistItems.some((item) => item.id === crypto.id)) {
      setIsAddDialogOpen(false)
      setSelectedCrypto("")
      return
    }

    setWatchlistItems([...watchlistItems, crypto])
    setIsAddDialogOpen(false)
    setSelectedCrypto("")
  }

  const removeFromWatchlist = (cryptoId: number) => {
    setWatchlistItems(watchlistItems.filter((item) => item.id !== cryptoId))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Watchlist</CardTitle>
            <CardDescription>Your favorite cryptocurrencies</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add to Watchlist</DialogTitle>
                <DialogDescription>Select a cryptocurrency to add to your watchlist</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="crypto-select">Cryptocurrency</Label>
                  <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cryptocurrency" />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptos
                        .filter((crypto) => !watchlistItems.some((item) => item.id === crypto.id))
                        .slice(0, 20)
                        .map((crypto) => (
                          <SelectItem key={crypto.id} value={crypto.id.toString()}>
                            <div className="flex items-center gap-2">
                              <img
                                src={getCryptoLogo(crypto.id, 32) || "/placeholder.svg"}
                                alt={crypto.name}
                                className="w-4 h-4"
                              />
                              {crypto.name} ({crypto.symbol})
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddToWatchlist} className="w-full" disabled={!selectedCrypto}>
                  Add to Watchlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))
          : watchlistItems.map((crypto) => (
              <div key={crypto.id} className="flex items-center justify-between p-3 rounded-lg border group">
                <div className="flex items-center gap-3">
                  <img
                    src={getCryptoLogo(crypto.id, 32) || "/placeholder.svg"}
                    alt={crypto.name}
                    className="w-6 h-6"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=24&width=24"
                    }}
                  />
                  <div>
                    <div className="font-medium">{crypto.symbol}</div>
                    <div className="text-sm text-muted-foreground">{crypto.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-medium">${formatPrice(crypto.quote.USD.price)}</div>
                    <Badge
                      variant={crypto.quote.USD.percent_change_24h >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {crypto.quote.USD.percent_change_24h >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {formatPercentage(crypto.quote.USD.percent_change_24h)}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFromWatchlist(crypto.id)}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </div>
            ))}

        {watchlistItems.length === 0 && !loading && (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No items in watchlist</h3>
            <p className="text-muted-foreground mb-4">Add cryptocurrencies to track your favorites</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </div>
        )}

        {watchlistItems.length > 0 && (
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <Star className="h-4 w-4 mr-2" />
            View all watchlist items ({watchlistItems.length})
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
