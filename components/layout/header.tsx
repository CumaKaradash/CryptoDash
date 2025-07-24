"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Bell, Search, Menu, RefreshCw, BarChart3, TrendingUp, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Markets", href: "/markets", icon: TrendingUp },
  { name: "News", href: "/news", icon: Newspaper },
]

interface HeaderProps {
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function Header({ onRefresh, isRefreshing = false }: HeaderProps) {
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState("")

  const Navigation = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("flex space-x-6", mobile && "flex-col space-x-0 space-y-4")}>
      {navigation.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link key={item.name} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "text-sm font-medium",
                mobile && "w-full justify-start",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4", mobile && "mr-2")} />
              {mobile && item.name}
              {!mobile && item.name}
            </Button>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">CryptoDash</h1>
          </Link>
          <div className="hidden md:block">
            <Navigation />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cryptocurrencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
          {onRefresh && (
            <Button variant="outline" size="icon" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden bg-transparent">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col space-y-4 mt-6">
                <Navigation mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
