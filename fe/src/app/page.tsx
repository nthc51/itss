"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Refrigerator,
  Calendar,
  ChefHat,
  TrendingUp,
  AlertTriangle,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";

interface DashboardStats {
  totalFoodItems: number;
  expiringItems: number;
  activeLists: number;
  plannedMeals: number;
  familyMembers: number;
  wastedItems: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFoodItems: 0,
    expiringItems: 0,
    activeLists: 0,
    plannedMeals: 0,
    familyMembers: 0,
    wastedItems: 0,
  });

  const [expiringFoods, setExpiringFoods] = useState([
    { name: "Milk", daysLeft: 2, location: "Main Fridge" },
    { name: "Chicken Breast", daysLeft: 1, location: "Freezer" },
    { name: "Lettuce", daysLeft: 3, location: "Vegetable Drawer" },
  ]);

  const [todaysMeals, setTodaysMeals] = useState([
    { type: "Breakfast", meal: "Scrambled Eggs with Toast", time: "08:00" },
    { type: "Lunch", meal: "Chicken Caesar Salad", time: "12:30" },
    { type: "Dinner", meal: "Grilled Salmon with Vegetables", time: "19:00" },
  ]);

  useEffect(() => {
    // Fetch dashboard stats from API
    const fetchStats = async () => {
      try {
        // Replace with actual API calls
        setStats({
          totalFoodItems: 127,
          expiringItems: 8,
          activeLists: 3,
          plannedMeals: 21,
          familyMembers: 4,
          wastedItems: 2,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Food Management Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage your family's food, shopping, and meal planning
            </p>
          </div>

          {/* Rest of the dashboard content */}
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Food Items
                </CardTitle>
                <Refrigerator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFoodItems}</div>
                <p className="text-xs text-muted-foreground">In your fridge</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expiring Soon
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.expiringItems}
                </div>
                <p className="text-xs text-muted-foreground">Next 3 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Shopping Lists
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeLists}</div>
                <p className="text-xs text-muted-foreground">Active lists</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Planned Meals
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.plannedMeals}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Family Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.familyMembers}</div>
                <p className="text-xs text-muted-foreground">Active users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Food Waste
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.wastedItems}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Expiring Foods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Foods Expiring Soon
                </CardTitle>
                <CardDescription>
                  Items that need attention in the next 3 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiringFoods.map((food, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{food.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {food.location}
                        </p>
                      </div>
                      <Badge
                        variant={
                          food.daysLeft <= 1 ? "destructive" : "secondary"
                        }
                      >
                        {food.daysLeft} day{food.daysLeft !== 1 ? "s" : ""} left
                      </Badge>
                    </div>
                  ))}
                </div>
                <Link href="/fridge">
                  <Button className="w-full mt-4" variant="outline">
                    View All Food Items
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Today's Meals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-green-500" />
                  Today's Meal Plan
                </CardTitle>
                <CardDescription>Your planned meals for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todaysMeals.map((meal, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{meal.meal}</p>
                        <p className="text-sm text-muted-foreground">
                          {meal.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{meal.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/meal-planning">
                  <Button className="w-full mt-4" variant="outline">
                    View Meal Plan
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/shopping-lists">
                  <Button
                    className="w-full h-20 flex flex-col gap-2"
                    variant="outline"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    Create Shopping List
                  </Button>
                </Link>
                <Link href="/fridge">
                  <Button
                    className="w-full h-20 flex flex-col gap-2"
                    variant="outline"
                  >
                    <Refrigerator className="h-6 w-6" />
                    Add Food Item
                  </Button>
                </Link>
                <Link href="/meal-planning">
                  <Button
                    className="w-full h-20 flex flex-col gap-2"
                    variant="outline"
                  >
                    <Calendar className="h-6 w-6" />
                    Plan Meals
                  </Button>
                </Link>
                <Link href="/suggestions">
                  <Button
                    className="w-full h-20 flex flex-col gap-2"
                    variant="outline"
                  >
                    <ChefHat className="h-6 w-6" />
                    Get Recipe Ideas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
