"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCryptoData } from "@/hooks/use-crypto-api"
import { getCryptoLogo } from "@/lib/api-client"

const initialPortfolioData = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    amount: 0.5,
    value: 21625.0,
    change: 2.45,
    icon: "₿",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    amount: 2.3,
    value: 6095.0,
    change: -1.23,
    icon: "Ξ",
  },
  {
    name: "Solana",
    symbol: "SOL",
    amount: 15.0,
    value: 1481.25,
    change: 4.12,
    icon: "◎",
  },
]

export function Portfolio() {
  const { cryptoData } = useCryptoData()
  const [portfolioData, setPortfolioData] = useState(initialPortfolioData)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCrypto, setSelectedCrypto] = useState("")
  const [amount, setAmount] = useState("")
  const [buyPrice, setBuyPrice] = useState("")

  const totalValue = portfolioData.reduce((sum, asset) => sum + asset.value, 0)
  const totalChange = portfolioData.reduce((sum, asset) => sum + (asset.value * asset.change) / 100, 0)
  const totalChangePercent = (totalChange / totalValue) * 100

  const handleAddAsset = () => {
    if (!selectedCrypto || !amount || !buyPrice) return

    const crypto = cryptoData.find((c) => c.id.toString() === selectedCrypto)
    if (!crypto) return

    const amountNum = Number.parseFloat(amount)
    const buyPriceNum = Number.parseFloat(buyPrice)
    const currentPrice = crypto.quote.USD.price
    const currentValue = amountNum * currentPrice
    const changePercent = ((currentPrice - buyPriceNum) / buyPriceNum) * 100

    const newAsset = {
      name: crypto.name,
      symbol: crypto.symbol,
      amount: amountNum,
      value: currentValue,
      change: changePercent,
      icon: crypto.symbol === "BTC" ? "₿" : crypto.symbol === "ETH" ? "Ξ" : crypto.symbol[0],
    }

    setPortfolioData([...portfolioData, newAsset])
    setIsAddDialogOpen(false)
    setSelectedCrypto("")
    setAmount("")
    setBuyPrice("")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Portfolio</CardTitle>
            <CardDescription>Your cryptocurrency holdings</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
                <DialogDescription>Add a cryptocurrency to your portfolio</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="crypto">Cryptocurrency</Label>
                  <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cryptocurrency" />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoData.slice(0, 20).map((crypto) => (
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
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyPrice">Buy Price (USD)</Label>
                  <Input
                    id="buyPrice"
                    type="number"
                    placeholder="0.00"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddAsset} className="w-full" disabled={!selectedCrypto || !amount || !buyPrice}>
                  Add to Portfolio
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={totalChangePercent >= 0 ? "default" : "destructive"}>
              {totalChangePercent >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {totalChangePercent.toFixed(2)}%
            </Badge>
            <span className="text-muted-foreground">${Math.abs(totalChange).toFixed(2)} today</span>
          </div>
        </div>

        <div className="space-y-3">
          {portfolioData.map((asset, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <span className="text-lg">{asset.icon}</span>
                <div>
                  <div className="font-medium">{asset.symbol}</div>
                  <div className="text-sm text-muted-foreground">
                    {asset.amount} {asset.symbol}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <Badge variant={asset.change >= 0 ? "default" : "destructive"} className="text-xs">
                  {asset.change >= 0 ? "+" : ""}
                  {asset.change.toFixed(2)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
