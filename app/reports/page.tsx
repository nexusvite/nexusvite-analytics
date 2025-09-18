"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  ShoppingCart,
  Eye,
  Filter,
  FileSpreadsheet,
  FilePieChart,
  FileBarChart
} from "lucide-react";

interface Report {
  id: string;
  name: string;
  type: string;
  lastGenerated: string;
  size: string;
  status: 'ready' | 'generating' | 'scheduled';
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("last-30-days");
  const [selectedReportType, setSelectedReportType] = useState("all");

  const reports: Report[] = [
    {
      id: "1",
      name: "Monthly Analytics Summary",
      type: "analytics",
      lastGenerated: "2024-01-15T10:30:00Z",
      size: "2.4 MB",
      status: "ready"
    },
    {
      id: "2",
      name: "User Engagement Report",
      type: "engagement",
      lastGenerated: "2024-01-14T15:45:00Z",
      size: "1.8 MB",
      status: "ready"
    },
    {
      id: "3",
      name: "Revenue Analysis",
      type: "revenue",
      lastGenerated: "2024-01-13T09:00:00Z",
      size: "3.2 MB",
      status: "ready"
    },
    {
      id: "4",
      name: "Traffic Sources Breakdown",
      type: "traffic",
      lastGenerated: "2024-01-12T14:20:00Z",
      size: "1.5 MB",
      status: "ready"
    },
    {
      id: "5",
      name: "Weekly Performance Report",
      type: "performance",
      lastGenerated: "Generating...",
      size: "-",
      status: "generating"
    },
    {
      id: "6",
      name: "Quarterly Business Review",
      type: "business",
      lastGenerated: "Scheduled for Jan 31",
      size: "-",
      status: "scheduled"
    }
  ];

  const getReportIcon = (type: string) => {
    switch (type) {
      case "analytics":
        return FilePieChart;
      case "engagement":
        return Users;
      case "revenue":
        return ShoppingCart;
      case "traffic":
        return Eye;
      case "performance":
        return TrendingUp;
      case "business":
        return FileBarChart;
      default:
        return FileText;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge variant="default">Ready</Badge>;
      case "generating":
        return <Badge variant="secondary">Generating</Badge>;
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    if (dateString.includes("Generating") || dateString.includes("Scheduled")) {
      return dateString;
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Reports</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+3 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Generated Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">2 scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48.5 MB</div>
              <p className="text-xs text-muted-foreground">Across all reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Export Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">892</div>
              <p className="text-xs text-muted-foreground">Of 1,000 monthly</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recent" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 days</SelectItem>
                  <SelectItem value="last-3-months">Last 3 months</SelectItem>
                  <SelectItem value="last-year">Last year</SelectItem>
                  <SelectItem value="all-time">All time</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="traffic">Traffic</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="recent" className="space-y-4">
            {reports.map((report) => {
              const Icon = getReportIcon(report.type);
              return (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{report.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {formatDate(report.lastGenerated)}
                            </span>
                            {report.size !== "-" && (
                              <span className="text-sm text-muted-foreground">
                                • {report.size}
                              </span>
                            )}
                            <Badge variant="secondary" className="capitalize">
                              {report.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(report.status)}
                        {report.status === "ready" && (
                          <>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>
                  Reports that will be generated automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Weekly Performance Report</p>
                        <p className="text-sm text-muted-foreground">Every Monday at 9:00 AM</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Monthly Analytics Summary</p>
                        <p className="text-sm text-muted-foreground">First day of each month</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <FilePieChart className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Analytics Overview</CardTitle>
                  <CardDescription>
                    Comprehensive analytics data including traffic, engagement, and conversions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Use Template</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <FileBarChart className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Revenue Analysis</CardTitle>
                  <CardDescription>
                    Detailed revenue breakdown by product, region, and time period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Use Template</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <FileSpreadsheet className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>User Behavior</CardTitle>
                  <CardDescription>
                    User journey analysis, retention metrics, and engagement patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Use Template</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}