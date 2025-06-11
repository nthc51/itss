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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Refrigerator,
  AlertTriangle,
  Calendar,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";

interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  expirationDate: string;
  location: string;
  addedDate: string;
  daysUntilExpiry: number;
}

const categories = [
  "Vegetables",
  "Fruits",
  "Meat",
  "Fish",
  "Dairy",
  "Grains",
  "Spices",
  "Beverages",
  "Leftovers",
  "Other",
];

const locations = [
  "Main Fridge",
  "Freezer",
  "Vegetable Drawer",
  "Pantry",
  "Spice Rack",
  "Counter",
  "Wine Fridge",
];

export default function FridgeManagement() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [sortBy, setSortBy] = useState("expiry");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    // Mock data - replace with API call
    const mockItems: FoodItem[] = [
      {
        id: "1",
        name: "Milk",
        quantity: "1 liter",
        category: "Dairy",
        expirationDate: "2024-01-18",
        location: "Main Fridge",
        addedDate: "2024-01-10",
        daysUntilExpiry: 2,
      },
      {
        id: "2",
        name: "Chicken Breast",
        quantity: "500g",
        category: "Meat",
        expirationDate: "2024-01-17",
        location: "Freezer",
        addedDate: "2024-01-12",
        daysUntilExpiry: 1,
      },
      {
        id: "3",
        name: "Lettuce",
        quantity: "1 head",
        category: "Vegetables",
        expirationDate: "2024-01-19",
        location: "Vegetable Drawer",
        addedDate: "2024-01-14",
        daysUntilExpiry: 3,
      },
      {
        id: "4",
        name: "Yogurt",
        quantity: "4 cups",
        category: "Dairy",
        expirationDate: "2024-01-25",
        location: "Main Fridge",
        addedDate: "2024-01-15",
        daysUntilExpiry: 9,
      },
      {
        id: "5",
        name: "Apples",
        quantity: "6 pieces",
        category: "Fruits",
        expirationDate: "2024-01-22",
        location: "Counter",
        addedDate: "2024-01-13",
        daysUntilExpiry: 6,
      },
    ];
    setFoodItems(mockItems);
  }, []);

  const handleAddFood = async (formData: FormData) => {
    const expirationDate = formData.get("expirationDate") as string;
    const today = new Date();
    const expiry = new Date(expirationDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const newItem: FoodItem = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      quantity: formData.get("quantity") as string,
      category: formData.get("category") as string,
      expirationDate,
      location: formData.get("location") as string,
      addedDate: new Date().toISOString().split("T")[0],
      daysUntilExpiry,
    };

    setFoodItems((prev) => [newItem, ...prev]);
    setIsAddDialogOpen(false);
  };

  const handleDeleteFood = (id: string) => {
    setFoodItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getExpiryStatus = (days: number) => {
    if (days < 0) return { color: "bg-red-100 text-red-800", text: "Expired" };
    if (days <= 1)
      return {
        color: "bg-red-100 text-red-800",
        text: `${days} day${days !== 1 ? "s" : ""}`,
      };
    if (days <= 3)
      return { color: "bg-orange-100 text-orange-800", text: `${days} days` };
    if (days <= 7)
      return { color: "bg-yellow-100 text-yellow-800", text: `${days} days` };
    return { color: "bg-green-100 text-green-800", text: `${days} days` };
  };

  let filteredItems = foodItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;
    const matchesLocation =
      filterLocation === "all" || item.location === filterLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Sort items
  filteredItems = filteredItems.sort((a, b) => {
    switch (sortBy) {
      case "expiry":
        return a.daysUntilExpiry - b.daysUntilExpiry;
      case "name":
        return a.name.localeCompare(b.name);
      case "category":
        return a.category.localeCompare(b.category);
      case "location":
        return a.location.localeCompare(b.location);
      default:
        return 0;
    }
  });

  const expiringItems = foodItems.filter((item) => item.daysUntilExpiry <= 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                Fridge Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Track your food inventory and expiration dates
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Food Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form action={handleAddFood}>
                  <DialogHeader>
                    <DialogTitle>Add Food Item</DialogTitle>
                    <DialogDescription>
                      Add a new item to your food inventory
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Food Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., Milk"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        placeholder="e.g., 1 liter"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Storage Location</Label>
                      <Select name="location" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expirationDate">Expiration Date</Label>
                      <Input
                        id="expirationDate"
                        name="expirationDate"
                        type="date"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Item</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Items
                  </p>
                  <p className="text-2xl font-bold">{foodItems.length}</p>
                </div>
                <Refrigerator className="h-8 w-8 text-muted-foreground" />
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
                  <p className="text-2xl font-bold text-orange-600">
                    {expiringItems.length}
                  </p>
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
                    Categories
                  </p>
                  <p className="text-2xl font-bold">
                    {new Set(foodItems.map((item) => item.category)).size}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Locations
                  </p>
                  <p className="text-2xl font-bold">
                    {new Set(foodItems.map((item) => item.location)).size}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search food items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterLocation} onValueChange={setFilterLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expiry">Expiry Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Food Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const expiryStatus = getExpiryStatus(item.daysUntilExpiry);
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge className={expiryStatus.color}>
                      {expiryStatus.text}
                    </Badge>
                  </div>
                  <CardDescription>{item.quantity}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Expires:{" "}
                        {new Date(item.expirationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{item.location}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFood(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Refrigerator className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No food items found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
