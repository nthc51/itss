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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Search, Share2, Users, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ShoppingItem {
  _id: string;
  name: string;
  quantity: number; 
  unit: string; // unit ObjectId
  category: string; // category ObjectId
  status: string; // "PENDING" | "BOUGHT"
}

interface Category {
  _id: string;
  name: string;
}
interface Unit {
  _id: string;
  name: string;
  abbreviation: string;
}

interface ShoppingList {
  _id: string;
  name: string;
  startDate: string;
  endDate?: string;
  items: ShoppingItem[];
  ownedBy: any;
}

export default function ShoppingLists() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchUnits();
    fetchShoppingLists();
    // eslint-disable-next-line
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/food-categories`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/units`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch units");
      const data = await res.json();
      setUnits(Array.isArray(data) ? data : []);
    } catch {
      setUnits([]);
    }
  };

  const fetchShoppingLists = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/shopping-lists`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch shopping lists");
      const data = await res.json();
      setLists(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load shopping lists. Please try again.",
        variant: "destructive",
      });
      setLists([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async (formData: FormData) => {
    try {
      const newList = {
        name: formData.get("name") as string,
        startDate: formData.get("startDate") as string,
        endDate: (formData.get("endDate") as string) || undefined,
        items: [],
      };

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/shopping-lists`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(newList),
        }
      );
      if (!res.ok) throw new Error("Failed to create shopping list");
      const created = await res.json();
      setLists((prev) => [created, ...prev]);
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Shopping list created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shopping list. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add item using the new endpoint
  const handleAddItem = async (formData: FormData) => {
    if (!selectedList) return;
    try {
      const newItem = {
        name: formData.get("itemName") as string,
        quantity: Number(formData.get("quantity")),
        unit: formData.get("unit") as string,
        category: formData.get("category") as string,
        status: "PENDING",
      };

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/shopping-lists/${selectedList._id}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(newItem),
        }
      );
      if (!res.ok) throw new Error("Failed to add item");
      const updatedList = await res.json();
      setLists((prev) =>
        prev.map((list) => (list._id === updatedList._id ? updatedList : list))
      );
      setSelectedList(updatedList);
      setIsAddItemDialogOpen(false);
      toast({
        title: "Success",
        description: "Item added successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Toggle item bought using the update-item endpoint
  const toggleItemBought = async (
    listId: string,
    itemId: string,
    bought: boolean
  ) => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/shopping-lists/${listId}/update-item/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: bought ? "PENDING" : "BOUGHT" }),
        }
      );
      if (!res.ok) throw new Error("Failed to update item");
      const updatedList = await res.json();
      setLists((prev) =>
        prev.map((list) => (list._id === updatedList._id ? updatedList : list))
      );
      setSelectedList(updatedList);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredLists = lists.filter((list) => {
    const text = (list.name || "").toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                Shopping Lists
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage your family's shopping lists and track purchases
              </p>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create List
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form action={handleCreateList}>
                  <DialogHeader>
                    <DialogTitle>Create New Shopping List</DialogTitle>
                    <DialogDescription>
                      Create a new shopping list for your family
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">List Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., Weekly Groceries"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input id="endDate" name="endDate" type="date" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create List</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search shopping lists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
            {/* Shopping Lists Grid */}
            {filteredLists.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLists.map((list) => (
                  <Card
                    key={list._id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {list.name || "Untitled List"}
                        </CardTitle>
                        <Badge variant="default">
                          {list.startDate
                            ? new Date(list.startDate).toLocaleDateString()
                            : "No date"}
                        </Badge>
                      </div>
                      <CardDescription>
                        Owner: {list.ownedBy?.fullName || "Unknown"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Items Preview */}
                        <div className="space-y-2">
                          {(list.items || []).slice(0, 3).map((item) => (
                            <div
                              key={item._id}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                checked={item.status === "BOUGHT"}
                                onCheckedChange={() =>
                                  toggleItemBought(
                                    list._id,
                                    item._id,
                                    item.status === "BOUGHT"
                                  )
                                }
                              />
                              <span
                                className={`text-sm ${
                                  item.status === "BOUGHT"
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {item.name || "Unnamed item"} (
                                {item.quantity || "No quantity"})
                              </span>
                            </div>
                          ))}
                          {(list.items || []).length > 3 && (
                            <p className="text-sm text-muted-foreground">
                              +{(list.items || []).length - 3} more items
                            </p>
                          )}
                        </div>
                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedList(list)}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            View Items
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No shopping lists found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first shopping list to get started
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create List
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* List Details Dialog */}
        <Dialog
          open={!!selectedList}
          onOpenChange={() => setSelectedList(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedList?.name || "Shopping List"}</DialogTitle>
              <DialogDescription>
                {selectedList?.startDate
                  ? new Date(selectedList.startDate).toLocaleDateString()
                  : "No date"}
              </DialogDescription>
            </DialogHeader>
            {selectedList && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">
                    Items ({(selectedList.items || []).length})
                  </h4>
                  <Dialog
                    open={isAddItemDialogOpen}
                    onOpenChange={setIsAddItemDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form action={handleAddItem}>
                        <DialogHeader>
                          <DialogTitle>Add Item to List</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="itemName">Item Name</Label>
                            <Input
                              id="itemName"
                              name="itemName"
                              placeholder="e.g., Tomatoes"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                              id="quantity"
                              name="quantity"
                              type="number"
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
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddItemDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Add Item</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(selectedList.items || []).map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={item.status === "BOUGHT"}
                          onCheckedChange={() =>
                            selectedList &&
                            toggleItemBought(
                              selectedList._id,
                              item._id,
                              item.status === "BOUGHT"
                            )
                          }
                        />
                        <div>
                          <p
                            className={`font-medium ${
                              item.status === "BOUGHT"
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {item.name || "Unnamed item"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity || "No quantity"} •{" "}
                            {categories.find((cat) => cat._id === item.category)
                              ?.name || "No category"}{" "}
                            •{" "}
                            {units.find((u) => u._id === item.unit)?.name ||
                              "No unit"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          item.status === "BOUGHT" ? "default" : "secondary"
                        }
                      >
                        {item.status === "BOUGHT" ? "Done" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedList(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
