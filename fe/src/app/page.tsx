"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/protected-route";
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
  Ruler,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";

// --- Types ---
interface Unit {
  _id: string;
  name: string;
  abbreviation: string;
}
interface Category {
  _id: string;
  name: string;
}
interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  unit: Unit | string;
  category: Category | string;
  expirationDate: string;
  location: string;
  addedDate: string;
  daysUntilExpiry?: number;
}

// --- Main Component ---
export default function FridgeManagement() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [sortBy, setSortBy] = useState("expiry");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    fetchUnits();
    fetchCategories();
    fetchFoodItems();
    // eslint-disable-next-line
  }, []);

  const fetchUnits = async () => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/units`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch units");
      const data = await res.json();
      setUnits(Array.isArray(data) ? data : []);
    } catch (error) {
      setUnits([]);
      toast({
        title: "Error",
        description: "Failed to load units.",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/food-categories`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      setCategories([]);
      toast({
        title: "Error",
        description: "Failed to load categories.",
        variant: "destructive",
      });
    }
  };

  function extractStringValue(objOrString: any, fallback = ""): string {
    if (!objOrString) return fallback;
    if (typeof objOrString === "string") return objOrString;
    if (typeof objOrString === "object" && objOrString.name)
      return objOrString.name;
    return fallback;
  }

  const calculateDaysUntilExpiry = (expirationDate: string): number => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatFoodItem = (item: any): FoodItem => ({
    id: item._id || item.id,
    name: item.name || "",
    quantity: String(item.quantity || ""),
    unit: item.unit || "",
    category: item.category || "",
    expirationDate: item.expirationDate || item.expiry_date || "",
    location: item.location || "Main Fridge",
    addedDate:
      item.addedDate ||
      item.created_at ||
      new Date().toISOString().split("T")[0],
    daysUntilExpiry: calculateDaysUntilExpiry(
      item.expirationDate || item.expiry_date || ""
    ),
  });

  const fetchFoodItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/pantry-items`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch food items");
      const data = await res.json();
      const formattedItems = Array.isArray(data)
        ? data.map(formatFoodItem)
        : [];
      setFoodItems(formattedItems);
    } catch (error) {
      setFoodItems([]);
      toast({
        title: "Error",
        description: "Failed to load food items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Add food item (send unit/category as _id, do NOT send ownedBy) ---
  const handleAddFood = async (formData: FormData) => {
    try {
      const newItem = {
        name: formData.get("name") as string,
        quantity: formData.get("quantity") as string,
        unit: formData.get("unit") as string, // _id
        category: formData.get("category") as string, // _id
        expirationDate: formData.get("expirationDate") as string,
        location: formData.get("location") as string,
        // ownedBy: not needed, backend uses JWT
      };

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/pantry-items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newItem),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add food item");
      }
      const addedItem = await res.json();
      setFoodItems((prev) => [formatFoodItem(addedItem), ...prev]);
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Food item added successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to add food item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFood = async (id: string) => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/pantry-items/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete food item");
      setFoodItems((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: "Success",
        description: "Food item deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete food item. Please try again.",
        variant: "destructive",
      });
    }
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

  if (!isMounted) {
    return null;
  }

  let filteredItems = foodItems.filter((item) => {
    const itemName = item?.name || "";
    const itemCategory = extractStringValue(item?.category);
    const itemLocation = item?.location || "";

    const matchesSearch = itemName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || itemCategory === filterCategory;
    const matchesLocation =
      filterLocation === "all" || itemLocation === filterLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  filteredItems = filteredItems.sort((a, b) => {
    switch (sortBy) {
      case "expiry":
        return (a.daysUntilExpiry || 0) - (b.daysUntilExpiry || 0);
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      case "category":
        return extractStringValue(a.category).localeCompare(
          extractStringValue(b.category)
        );
      case "location":
        return (a.location || "").localeCompare(b.location || "");
      default:
        return 0;
    }
  });

  const expiringItems = foodItems.filter(
    (item) => (item.daysUntilExpiry || 0) <= 3
  );

  const uniqueLocations = Array.from(
    new Set(foodItems.map((item) => item.location || "Main Fridge"))
  );

  return (
    <ProtectedRoute>
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
                          placeholder="e.g., 2"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Select name="unit" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit._id} value={unit._id}>
                                {unit.name} ({unit.abbreviation})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category._id}
                                value={category._id}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="location">Storage Location</Label>
                        <Input
                          id="location"
                          name="location"
                          placeholder="e.g., Main Fridge"
                          required
                        />
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
                      {
                        new Set(
                          foodItems.map((item) =>
                            extractStringValue(item.category, "Other")
                          )
                        ).size
                      }
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
                      {uniqueLocations.length}
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
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filterLocation}
                  onValueChange={setFilterLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map((location) => (
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

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {/* Food Items Grid */}
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((item) => {
                    const expiryStatus = getExpiryStatus(
                      item.daysUntilExpiry || 0
                    );
                    return (
                      <Card
                        key={item.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {item.name || "Unknown Item"}
                            </CardTitle>
                            <Badge className={expiryStatus.color}>
                              {expiryStatus.text}
                            </Badge>
                          </div>
                          <CardDescription>
                            {item.quantity}{" "}
                            <span className="inline-flex items-center gap-1">
                              <Ruler className="inline h-3 w-3" />
                              {extractStringValue(item.unit)}
                            </span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Expires:{" "}
                                {item.expirationDate
                                  ? new Date(
                                      item.expirationDate
                                    ).toLocaleDateString()
                                  : "No date"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{item.location || "Unknown Location"}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {extractStringValue(item.category, "Other")}
                            </Badge>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
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
              ) : (
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
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
