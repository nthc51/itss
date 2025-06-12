"use client";

import ProtectedRoute from "@/components/protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingCart,
  Refrigerator,
  Calendar,
  AlertTriangle,
  Users,
  ChefHat,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Welcome back, {user?.fullName || user?.username}!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Here's what's happening with your food management today
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Items in Fridge
                    </p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                  <Refrigerator className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Expiring Soon
                    </p>
                    <p className="text-2xl font-bold text-orange-600">3</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Shopping Lists
                    </p>
                    <p className="text-2xl font-bold">2</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Meal Plans
                    </p>
                    <p className="text-2xl font-bold">7</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks to manage your food inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/fridge">
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col gap-2 w-full"
                      >
                        <Refrigerator className="h-6 w-6" />
                        <span className="text-sm">Add Food</span>
                      </Button>
                    </Link>
                    <Link href="/shopping-lists">
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col gap-2 w-full"
                      >
                        <ShoppingCart className="h-6 w-6" />
                        <span className="text-sm">Shopping</span>
                      </Button>
                    </Link>
                    <Link href="/meal-planning">
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col gap-2 w-full"
                      >
                        <ChefHat className="h-6 w-6" />
                        <span className="text-sm">Meal Plan</span>
                      </Button>
                    </Link>
                    <Link href="/reports">
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col gap-2 w-full"
                      >
                        <BarChart3 className="h-6 w-6" />
                        <span className="text-sm">Reports</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates from your food management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Added 3 items to Weekly Groceries list
                        </p>
                        <p className="text-xs text-muted-foreground">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Updated expiry date for Milk
                        </p>
                        <p className="text-xs text-muted-foreground">
                          4 hours ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Tomatoes expiring in 2 days
                        </p>
                        <p className="text-xs text-muted-foreground">
                          6 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Expiring Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Expiring Soon
                  </CardTitle>
                  <CardDescription>Items that need attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Tomatoes</p>
                        <p className="text-sm text-muted-foreground">
                          2 days left
                        </p>
                      </div>
                      <Badge variant="destructive">Urgent</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Bread</p>
                        <p className="text-sm text-muted-foreground">
                          3 days left
                        </p>
                      </div>
                      <Badge variant="secondary">Soon</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Yogurt</p>
                        <p className="text-sm text-muted-foreground">
                          5 days left
                        </p>
                      </div>
                      <Badge variant="outline">Watch</Badge>
                    </div>
                  </div>
                  <Link href="/fridge">
                    <Button variant="outline" className="w-full mt-4">
                      View All Items
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Shopping Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Shopping Progress</CardTitle>
                  <CardDescription>Weekly Groceries completion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Items completed</span>
                        <span>7/12</span>
                      </div>
                      <Progress value={58} className="h-2" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      5 items remaining on your shopping list
                    </div>
                    <Link href="/shopping-lists">
                      <Button variant="outline" className="w-full">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Family Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Family Members
                  </CardTitle>
                  <CardDescription>Active family members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user?.fullName?.charAt(0) ||
                          user?.username?.charAt(0) ||
                          "U"}
                      </div>
                      <div>
                        <p className="font-medium">
                          {user?.fullName || user?.username}
                        </p>
                        <p className="text-sm text-muted-foreground">Admin</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Manage Family
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
