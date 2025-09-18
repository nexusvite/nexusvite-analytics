"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Users, Eye, Clock, TrendingUp, Globe, RefreshCw } from "lucide-react";

interface RealtimeData {
  activeUsers: number;
  pageViews: number;
  avgSessionDuration: string;
  topPages: Array<{
    path: string;
    views: number;
  }>;
  topLocations: Array<{
    country: string;
    users: number;
  }>;
  recentEvents: Array<{
    id: string;
    type: string;
    user: string;
    timestamp: string;
  }>;
}

export default function RealtimePage() {
  const [data, setData] = useState<RealtimeData>({
    activeUsers: 0,
    pageViews: 0,
    avgSessionDuration: "0:00",
    topPages: [],
    topLocations: [],
    recentEvents: []
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time data updates
  useEffect(() => {
    const generateRealtimeData = (): RealtimeData => ({
      activeUsers: Math.floor(Math.random() * 500) + 100,
      pageViews: Math.floor(Math.random() * 5000) + 1000,
      avgSessionDuration: `${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      topPages: [
        { path: "/dashboard", views: Math.floor(Math.random() * 1000) + 500 },
        { path: "/products", views: Math.floor(Math.random() * 800) + 300 },
        { path: "/checkout", views: Math.floor(Math.random() * 600) + 200 },
        { path: "/blog", views: Math.floor(Math.random() * 400) + 100 },
        { path: "/about", views: Math.floor(Math.random() * 300) + 50 }
      ].sort((a, b) => b.views - a.views),
      topLocations: [
        { country: "United States", users: Math.floor(Math.random() * 200) + 100 },
        { country: "United Kingdom", users: Math.floor(Math.random() * 150) + 50 },
        { country: "Germany", users: Math.floor(Math.random() * 100) + 30 },
        { country: "France", users: Math.floor(Math.random() * 80) + 20 },
        { country: "Canada", users: Math.floor(Math.random() * 60) + 10 }
      ].sort((a, b) => b.users - a.users),
      recentEvents: [
        { id: "1", type: "page_view", user: "user_" + Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() },
        { id: "2", type: "click", user: "user_" + Math.random().toString(36).substr(2, 9), timestamp: new Date(Date.now() - 5000).toISOString() },
        { id: "3", type: "form_submit", user: "user_" + Math.random().toString(36).substr(2, 9), timestamp: new Date(Date.now() - 10000).toISOString() },
        { id: "4", type: "page_view", user: "user_" + Math.random().toString(36).substr(2, 9), timestamp: new Date(Date.now() - 15000).toISOString() },
        { id: "5", type: "purchase", user: "user_" + Math.random().toString(36).substr(2, 9), timestamp: new Date(Date.now() - 20000).toISOString() }
      ]
    });

    // Initial data
    setData(generateRealtimeData());
    setIsConnected(true);

    // Update every 5 seconds
    const interval = setInterval(() => {
      setData(generateRealtimeData());
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Real-Time Analytics</h1>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Live" : "Disconnected"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Currently on site</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.pageViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 30 minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.avgSessionDuration}</div>
              <p className="text-xs text-muted-foreground">Current average</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>Most visited pages right now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topPages.map((page, index) => (
                  <div key={page.path} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium">{page.path}</span>
                    </div>
                    <Badge variant="secondary">{page.views} views</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Locations */}
          <Card>
            <CardHeader>
              <CardTitle>Top Locations</CardTitle>
              <CardDescription>Users by country</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topLocations.map((location, index) => (
                  <div key={location.country} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{location.country}</span>
                    </div>
                    <Badge variant="secondary">{location.users} users</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Live stream of user activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant={event.type === 'purchase' ? 'default' : 'outline'}>
                      {event.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{event.user}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}