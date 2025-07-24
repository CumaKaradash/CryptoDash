"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"

export function ApiStatus() {
  const [hasApiKey, setHasApiKey] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_CMC_API_KEY
    setHasApiKey(!!apiKey)
    if (!apiKey) {
      setShowSetup(true)
    }
  }, [])

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Data Source Status</CardTitle>
        </div>
        <CardDescription>
          {hasApiKey
            ? "Using CoinMarketCap API with demo fallback for premium features."
            : "Running in demo mode with simulated cryptocurrency data."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Market Data</span>
              <Badge variant={hasApiKey ? "default" : "secondary"}>{hasApiKey ? "Live" : "Demo"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Price Charts</span>
              <Badge variant="secondary">Demo</Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Global Metrics</span>
              <Badge variant={hasApiKey ? "default" : "secondary"}>{hasApiKey ? "Live" : "Demo"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Trending Data</span>
              <Badge variant="secondary">Demo</Badge>
            </div>
          </div>
        </div>

        {!hasApiKey && (
          <div className="pt-2 border-t">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Get Live Data:</h4>
              <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
                <li>
                  Visit{" "}
                  <a
                    href="https://coinmarketcap.com/api/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    CoinMarketCap API
                  </a>
                </li>
                <li>Get your free API key (10,000 calls/month)</li>
                <li>
                  Add <code className="bg-muted px-1 rounded">NEXT_PUBLIC_CMC_API_KEY=your_key</code> to .env.local
                </li>
                <li>Restart the application</li>
              </ol>
            </div>
          </div>
        )}

        {hasApiKey && (
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <p>
              <strong>Note:</strong> Historical price charts use simulated data as CMC historical endpoints require
              premium subscription. Current prices and market data are live.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
