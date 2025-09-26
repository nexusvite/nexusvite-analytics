"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Activity,
  Download,
  Calendar,
  Filter,
  Settings,
} from "lucide-react";
import { format, subDays } from "date-fns";

// Sample data
const revenueData = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), "MMM dd"),
  revenue: Math.floor(Math.random() * 5000) + 2000,
  orders: Math.floor(Math.random() * 100) + 20,
}));

const userActivityData = [
  { name: "Mon", active: 2400, new: 400 },
  { name: "Tue", active: 1398, new: 300 },
  { name: "Wed", active: 9800, new: 800 },
  { name: "Thu", active: 3908, new: 500 },
  { name: "Fri", active: 4800, new: 600 },
  { name: "Sat", active: 3800, new: 400 },
  { name: "Sun", active: 4300, new: 450 },
];

const categoryData = [
  { name: "Electronics", value: 35 },
  { name: "Clothing", value: 25 },
  { name: "Food", value: 20 },
  { name: "Books", value: 15 },
  { name: "Other", value: 5 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("30d");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [embedMode, setEmbedMode] = useState(false);

  const disconnect = async () => {
    // Notify platform that app is disconnected
    try {
      await fetch('http://localhost:3000/api/apps/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appId: 'com.nexusvite.analytics',
          userId: 'user_1', // In production, get from token
        }),
      });
    } catch (error) {
      console.error('Failed to notify platform of disconnect:', error);
    }

    // Clear cookies
    document.cookie = 'auth_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsConnected(false);
  };

  // Check if app is connected to NexusVite platform
  useEffect(() => {
    // Check if running in embedded mode (iframe)
    const inIframe = window !== window.parent;
    setIsEmbedded(inIframe);

    // Load embed mode setting
    const storedEmbedMode = localStorage.getItem("embed_mode");
    setEmbedMode(storedEmbedMode === "true");

    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);

    // If we're in an iframe with embed_mode parameter, trust it
    if (inIframe && urlParams.get('embed_mode') === 'true' && urlParams.get('session_token')) {
      setIsConnected(true);
      setLoading(false);
      return;
    }

    if (urlParams.get('connected') === 'true') {
      setIsConnected(true);
      setLoading(false);
      // Clean up URL only if not in iframe
      if (!inIframe) {
        window.history.replaceState({}, '', '/');
      }
      return;
    }

    // Check for auth_status cookie (client-readable)
    const cookies = document.cookie.split(';');
    const hasAuthStatus = cookies.some(cookie =>
      cookie.trim().startsWith('auth_status=connected')
    );

    setIsConnected(hasAuthStatus);
    setLoading(false);
  }, []);

  // Periodically check if session was revoked (only when connected and NOT in iframe)
  useEffect(() => {
    if (!isConnected || isEmbedded) return;

    const checkSession = async () => {
      try {
        const response = await fetch('/api/session/status');
        const data = await response.json();

        if (data.revoked) {
          // Session was revoked by platform uninstall or logout
          setIsConnected(false);

          // Set flag to auto-reconnect on next visit if platform URL is known
          if (localStorage.getItem("platform_url")) {
            localStorage.setItem("auto_reconnect", "true");
          }

          // Cookies were already cleared by the API
          window.location.reload();
        }
      } catch (error) {
        // Ignore errors, just for checking revocation
      }
    };

    // Check every 5 seconds (only in standalone mode)
    const interval = setInterval(checkSession, 5000);
    return () => clearInterval(interval);
  }, [isConnected, isEmbedded]);

  const connectToPlatform = () => {
    // Redirect to install page
    window.location.href = '/install';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Analytics Dashboard Not Installed</CardTitle>
            <CardDescription>
              Install the Analytics Dashboard app on your NexusVite platform to start tracking your data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connectToPlatform} className="w-full">
              Install on NexusVite Platform
            </Button>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => setIsConnected(true)}
            >
              Continue with Demo Data
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Enter your platform URL to install this app, similar to how Shopify apps are installed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Hide if embedded */}
      {!isEmbedded && (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold">Analytics Dashboard</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-green-600">✓ Connected to NexusVite</span>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  {dateRange === "30d" ? "Last 30 days" : "Custom"}
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={disconnect}>
                  Disconnect
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$89,342</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500" /> +12.5% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23,456</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500" /> +8.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500" /> +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.24%</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 text-green-500" /> +0.3% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-8">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: { name?: string; percent?: unknown }) => `${props.name || ''} ${((props.percent as number) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* User Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Daily active and new users</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="active" fill="#3b82f6" />
                <Bar dataKey="new" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
