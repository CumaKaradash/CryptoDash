"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  TrendingUp,
  Clock,
  ExternalLink,
  Bookmark,
  Share2,
  Globe,
  MessageSquare,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { useNews } from "@/hooks/use-news-api"
import { formatTimeAgo } from "@/lib/news-api"

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const { news, loading, error, lastUpdated, totalResults, refetch } = useNews(
    searchTerm || "cryptocurrency OR bitcoin OR ethereum OR blockchain OR crypto",
    selectedCategory,
  )

  const filteredNews = news.filter((item) => {
    if (!searchTerm) return true
    return (
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.relatedCoins.some((coin) => coin.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600"
      case "negative":
        return "text-red-600"
      default:
        return "text-yellow-600"
    }
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "default"
      case "negative":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "market":
        return <TrendingUp className="h-3 w-3" />
      case "technology":
        return <Globe className="h-3 w-3" />
      case "regulation":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <MessageSquare className="h-3 w-3" />
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Crypto News</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest cryptocurrency news and market insights
            {lastUpdated && <span className="ml-2 text-sm">• Last updated: {lastUpdated.toLocaleTimeString()}</span>}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={refetch} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Showing demo data instead.
            <Button variant="outline" size="sm" onClick={refetch} className="ml-2 bg-transparent">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search crypto news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="technology">Technology</TabsTrigger>
            <TabsTrigger value="regulation">Regulation</TabsTrigger>
            <TabsTrigger value="adoption">Adoption</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Total articles: {totalResults.toLocaleString()}</span>
        <span>•</span>
        <span>Showing: {filteredNews.length}</span>
        <span>•</span>
        <span>Source: NewsAPI.org</span>
      </div>

      {/* News Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Article */}
          {!loading && filteredNews.length > 0 && (
            <Card className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={filteredNews[0].urlToImage || "/placeholder.svg?height=300&width=600&text=News+Image"}
                  alt={filteredNews[0].title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=300&width=600&text=News+Image"
                  }}
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant={getSentimentBadge(filteredNews[0].sentiment)}>{filteredNews[0].sentiment}</Badge>
                  <Badge variant="outline" className="bg-background/80">
                    {getCategoryIcon(filteredNews[0].category)}
                    <span className="ml-1">{filteredNews[0].category}</span>
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {filteredNews[0].relatedCoins.map((coin) => (
                    <Badge key={coin} variant="secondary" className="text-xs">
                      {coin}
                    </Badge>
                  ))}
                </div>
                <h2 className="text-2xl font-bold mb-3">{filteredNews[0].title}</h2>
                <p className="text-muted-foreground mb-4">{filteredNews[0].description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback>{filteredNews[0].source.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{filteredNews[0].source.name}</span>
                    {filteredNews[0].author && (
                      <>
                        <span>•</span>
                        <span>{filteredNews[0].author}</span>
                      </>
                    )}
                    <span>•</span>
                    <Clock className="h-4 w-4" />
                    <span>{formatTimeAgo(filteredNews[0].publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={filteredNews[0].url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="w-full h-48 mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* News List */}
          {!loading && (
            <div className="space-y-4">
              {filteredNews.slice(1).map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={item.urlToImage || "/placeholder.svg?height=96&width=96&text=News"}
                        alt={item.title}
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=96&width=96&text=News"
                        }}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryIcon(item.category)}
                            <span className="ml-1">{item.category}</span>
                          </Badge>
                          <Badge variant={getSentimentBadge(item.sentiment)} className="text-xs">
                            {item.sentiment}
                          </Badge>
                          {item.relatedCoins.map((coin) => (
                            <Badge key={coin} variant="secondary" className="text-xs">
                              {coin}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Avatar className="w-4 h-4">
                              <AvatarFallback className="text-xs">{item.source.name[0]}</AvatarFallback>
                            </Avatar>
                            <span>{item.source.name}</span>
                            {item.author && (
                              <>
                                <span>•</span>
                                <span>{item.author}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{formatTimeAgo(item.publishedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Bookmark className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Share2 className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && filteredNews.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No news found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search terms or category filter</p>
                <Button onClick={() => setSearchTerm("")}>Clear Search</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Market Sentiment */}
          <Card>
            <CardHeader>
              <CardTitle>Market Sentiment</CardTitle>
              <CardDescription>Based on recent news analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!loading && news.length > 0 && (
                  <>
                    {["positive", "neutral", "negative"].map((sentiment) => {
                      const count = news.filter((article) => article.sentiment === sentiment).length
                      const percentage = Math.round((count / news.length) * 100)

                      return (
                        <div key={sentiment} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{sentiment}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full">
                              <div
                                className={`h-2 rounded-full ${
                                  sentiment === "positive"
                                    ? "bg-green-500"
                                    : sentiment === "negative"
                                      ? "bg-red-500"
                                      : "bg-yellow-500"
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{percentage}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
                {loading && (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-16" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-20 h-2" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {!loading && news.length > 0 && (
                  <>
                    {Array.from(new Set(news.flatMap((article) => article.relatedCoins)))
                      .slice(0, 8)
                      .map((coin) => (
                        <Badge key={coin} variant="outline" className="cursor-pointer hover:bg-muted">
                          #{coin}
                        </Badge>
                      ))}
                  </>
                )}
                {loading && (
                  <>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-12" />
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Popular Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Sources</CardTitle>
              <CardDescription>Most active news sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!loading && news.length > 0 && (
                  <>
                    {Array.from(new Set(news.map((article) => article.source.name)))
                      .slice(0, 5)
                      .map((source) => {
                        const count = news.filter((article) => article.source.name === source).length
                        return (
                          <div key={source} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">{source[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{source}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {count} articles
                            </Badge>
                          </div>
                        )
                      })}
                  </>
                )}
                {loading && (
                  <>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-6 h-6 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-5 w-12" />
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
