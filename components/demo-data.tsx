"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Database, Wifi, WifiOff } from "lucide-react"

interface DemoDataProps {
  onToggle: (useDemoData: boolean) => void
  isDemo: boolean
}

export function DemoData({ onToggle, isDemo }: DemoDataProps) {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Data Source</CardTitle>
        </div>
        <CardDescription>Switch between live CoinMarketCap data and demo data for testing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDemo ? <WifiOff className="h-4 w-4 text-orange-600" /> : <Wifi className="h-4 w-4 text-green-600" />}
            <Label htmlFor="demo-mode">{isDemo ? "Demo Mode" : "Live Data"}</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="demo-mode" checked={isDemo} onCheckedChange={onToggle} />
            <Badge variant={isDemo ? "secondary" : "default"}>{isDemo ? "Demo" : "Live"}</Badge>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {isDemo
            ? "Using simulated cryptocurrency data for demonstration purposes."
            : "Connected to CoinMarketCap API for real-time market data."}
        </div>
      </CardContent>
    </Card>
  )
}
