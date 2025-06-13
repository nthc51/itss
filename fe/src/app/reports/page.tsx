"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";

interface PurchaseData {
  month: string;
  amount: number;
  items: number;
  categories: { [key: string]: number };
}

interface WasteData {
  month: string;
  wastedItems: number;
  wastedValue: number;
  categories: { [key: string]: number };
}

interface ConsumptionTrend {
  category: string;
  thisMonth: number;
  lastMonth: number;
  trend: "up" | "down" | "stable";
  percentage: number;
}

export default function ReportsAndStatistics() {
  const [timeRange, setTimeRange] = useState("6months");
  const [purchaseData, setPurchaseData] = useState<PurchaseData[]>([]);
  const [wasteData, setWasteData] = useState<WasteData[]>([]);
  const [consumptionTrends, setConsumptionTrends] = useState<ConsumptionTrend[]>([]);
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch reports data from backend using JWT
    const fetchReports = async () => {
      try {
        // Purchases
        const purchaseRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/reports/purchases?range=${timeRange}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const purchaseJson = await purchaseRes.json();
        setPurchaseData(Array.isArray(purchaseJson) ? purchaseJson : []);

        // Waste
        const wasteRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/reports/waste?range=${timeRange}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const wasteJson = await wasteRes.json();
        setWasteData(Array.isArray(wasteJson) ? wasteJson : []);

        // Consumption trends
        const trendRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/reports/consumption-trends?range=${timeRange}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const trendJson = await trendRes.json();
        setConsumptionTrends(Array.isArray(trendJson) ? trendJson : []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load reports data.",
          variant: "destructive",
        });
        setPurchaseData([]);
        setWasteData([]);
        setConsumptionTrends([]);
      }
    };

    if (token) fetchReports();
  }, [timeRange, token, toast]);

  const totalSpent = purchaseData.reduce((sum, data) => sum + data.amount, 0);
  const totalItems = purchaseData.reduce((sum, data) => sum + data.items, 0);
  const totalWasted = wasteData.reduce((sum, data) => sum + data.wastedValue, 0);
  const totalWastedItems = wasteData.reduce((sum, data) => sum + data.wastedItems, 0);
  const wastePercentage =
    totalSpent > 0 ? ((totalWasted / totalSpent) * 100).toFixed(1) : "0";

  const currentMonth = purchaseData[purchaseData.length - 1];
  const previousMonth = purchaseData[purchaseData.length - 2];
  const spendingTrend =
    currentMonth && previousMonth
      ? currentMonth.amount > previousMonth.amount
        ? "up"
        : "down"
      : "stable";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                Reports & Statistics
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Analyze your family's food consumption and spending patterns
              </p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {spendingTrend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-red-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                )}
                <span>vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Items Purchased
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">Food items bought</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Food Wasted</CardTitle>
              <Trash2 className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ${totalWasted}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalWastedItems} items • {wastePercentage}% of spending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Monthly</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${purchaseData.length > 0 ? Math.round(totalSpent / purchaseData.length) : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Per month spending
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="spending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="spending">Spending Analysis</TabsTrigger>
            <TabsTrigger value="consumption">Consumption Trends</TabsTrigger>
            <TabsTrigger value="waste">Food Waste</TabsTrigger>
            <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="spending">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Spending Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Spending</CardTitle>
                  <CardDescription>Food purchases over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {purchaseData.map((data, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">
                          {data.month}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(data.amount / 600) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold">
                            ${data.amount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Items Purchased Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Items Purchased</CardTitle>
                  <CardDescription>
                    Number of food items bought monthly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {purchaseData.map((data, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">
                          {data.month}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${(data.items / 80) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold">
                            {data.items} items
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="consumption">
            <Card>
              <CardHeader>
                <CardTitle>Consumption Trends</CardTitle>
                <CardDescription>
                  How your food consumption patterns are changing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {consumptionTrends.map((trend, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{trend.category}</h4>
                          <Badge
                            variant={
                              trend.trend === "up"
                                ? "destructive"
                                : trend.trend === "down"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {trend.trend === "up" ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : trend.trend === "down" ? (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            ) : null}
                            {Math.abs(trend.percentage)}%
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>This month:</span>
                            <span className="font-medium">
                              ${trend.thisMonth}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Last month:</span>
                            <span>${trend.lastMonth}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waste">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Food Waste Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Food Waste Over Time</CardTitle>
                  <CardDescription>
                    Monthly food waste in dollars
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wasteData.map((data, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">
                          {data.month}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full"
                              style={{
                                width: `${(data.wastedValue / 70) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-red-600">
                            ${data.wastedValue}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Waste by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Waste by Category</CardTitle>
                  <CardDescription>
                    Most wasted food categories this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {wasteData.length > 0 && (
                    <div className="space-y-3">
                      {Object.entries(
                        wasteData[wasteData.length - 1]?.categories || {}
                      )
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, count], index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium">
                              {category}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-red-500 h-2 rounded-full"
                                  style={{ width: `${(count / 5) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold">
                                {count} items
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Waste Reduction Tips */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Waste Reduction Tips</CardTitle>
                <CardDescription>Based on your waste patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Plan Better</h4>
                    <p className="text-sm text-muted-foreground">
                      Use meal planning to buy only what you need for planned
                      recipes.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Check Expiry Dates</h4>
                    <p className="text-sm text-muted-foreground">
                      Use our expiry tracking to consume items before they
                      spoil.
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Store Properly</h4>
                    <p className="text-sm text-muted-foreground">
                      Follow storage recommendations to extend food freshness.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spending by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>Current month breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  {currentMonth && (
                    <div className="space-y-4">
                      {Object.entries(currentMonth.categories)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, amount], index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium">
                              {category}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${(amount / 200) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-bold">
                                ${amount}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Category Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>Month-over-month changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {consumptionTrends.map((trend, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{trend.category}</p>
                          <p className="text-sm text-muted-foreground">
                            ${trend.thisMonth} this month
                          </p>
                        </div>
                        <Badge
                          variant={
                            trend.trend === "up"
                              ? "destructive"
                              : trend.trend === "down"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {trend.trend === "up" ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : trend.trend === "down" ? (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          ) : null}
                          {Math.abs(trend.percentage)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
