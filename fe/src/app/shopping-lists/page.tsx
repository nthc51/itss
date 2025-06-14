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
import { shoppingListsApi, foodItemsApi } from "@/lib/api-service"; // For fetching categories

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string; // Should be category _id
  bought: boolean; // Use bought instead of completed
  addedBy: string;
  // Optionally: unit: string;
}

interface Category {
  _id: string;
  name: string;
}

interface ShoppingList {
  id: string;
  name: string;
  title?: string;
  type: "daily" | "weekly";
  date: string;
  items: ShoppingItem[];
  sharedWith: string[];
  createdBy: string;
  completedItems: number;
  totalItems: number;
}

export default function ShoppingLists() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  // Fix hydration issues
  useEffect(() => {
    setIsMounted(true);
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchShoppingLists();
    }
  }, [isMounted]);

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

  const fetchShoppingLists = async () => {
    setIsLoading(true);
    try {
      const data = await shoppingListsApi.getAll();
      // Ensure data is properly formatted
      const formattedData = Array.isArray(data)
        ? (data as any[]).map((raw) => ({
            id: raw._id || raw.id,
            name: raw.title || raw.name,
            title: raw.title,
            type: raw.type,
            date: raw.startDate || raw.date,
            items: Array.isArray(raw.items)
              ? raw.items.map((item: any) => ({
                  id: item._id || item.id,
                  name: item.name,
                  quantity: item.quantity,
                  category: item.category,
                  bought: item.completed,
                  addedBy:
                    typeof item.addedBy === "object" && item.addedBy?.fullName
                      ? item.addedBy.fullName
                      : item.addedBy || "Unknown",
                }))
              : [],
            sharedWith: Array.isArray(raw.sharedWithGroup ?? raw.sharedWith)
              ? raw.sharedWithGroup ?? raw.sharedWith
              : [],
            createdBy:
              typeof raw.createdBy === "object" && raw.createdBy?.fullName
                ? raw.createdBy.fullName
                : raw.createdBy || "Unknown",
            completedItems: raw.completedItems || 0,
            totalItems:
              raw.totalItems ||
              (Array.isArray(raw.items) ? raw.items.length : 0),
          }))
        : [];
      setLists(formattedData);
    } catch (error) {
      console.error("Failed to fetch shopping lists:", error);
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
        title: formData.get("name") as string,
        type: formData.get("type") as "daily" | "weekly",
        startDate: formData.get("date") as string,
        endDate: formData.get("date") as string,
      };

      const createdList = await shoppingListsApi.create(newList);
      const formattedList = {
        ...createdList,
        name: createdList.title,
        items: createdList.items || [],
        sharedWith: createdList.sharedWithGroup || [],
        createdBy: createdList.createdBy || "You",
        completedItems: 0,
        totalItems: 0,
      };

      setLists((prev) => [formattedList, ...prev]);
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Shopping list created successfully!",
      });
    } catch (error) {
      console.error("Failed to create shopping list:", error);
      toast({
        title: "Error",
        description: "Failed to create shopping list. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Add item by updating the whole list
  const handleAddItem = async (formData: FormData) => {
    if (!selectedList) return;

    try {
      const newItem: ShoppingItem = {
        id: crypto.randomUUID(),
        name: formData.get("itemName") as string,
        quantity: formData.get("quantity") as string,
        category: formData.get("category") as string, // category _id
        bought: false, // Use bought instead of completed
        addedBy: "You",
      };

      const updatedItems = [...selectedList.items, newItem];
      const updatedList = { ...selectedList, items: updatedItems };

      await shoppingListsApi.update(selectedList.id, updatedList);

      setLists((prev) =>
        prev.map((list) =>
          list.id === selectedList.id
            ? {
                ...list,
                items: updatedItems,
                totalItems: updatedItems.length,
              }
            : list
        )
      );

      setIsAddItemDialogOpen(false);
      toast({
        title: "Success",
        description: "Item added successfully!",
      });
    } catch (error) {
      console.error("Failed to add item:", error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Toggle item bought by updating the whole list
  const toggleItemBought = async (
    listId: string,
    itemId: string,
    bought: boolean
  ) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;
    const updatedItems = list.items.map((item) =>
      item.id === itemId ? { ...item, bought: !bought } : item
    );
    const updatedList = { ...list, items: updatedItems };
    try {
      await shoppingListsApi.update(listId, updatedList);
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? {
                ...l,
                items: updatedItems,
                completedItems: updatedItems.filter((i) => i.bought).length,
              }
            : l
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredLists = lists.filter((list) => {
    const text = (list.name || list.title || "").toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  if (!isMounted) {
    return null;
  }

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
                      <Label htmlFor="type">List Type</Label>
                      <Select name="type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" name="date" type="date" required />
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
                    key={list.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {list.name || list.title || "Untitled List"}
                        </CardTitle>
                        <Badge
                          variant={
                            list.type === "weekly" ? "default" : "secondary"
                          }
                        >
                          {list.type || "daily"}
                        </Badge>
                      </div>
                      <CardDescription>
                        Created by {list.createdBy || "Unknown"} •{" "}
                        {list.date
                          ? new Date(list.date).toLocaleDateString()
                          : "No date"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>
                              {list.completedItems || 0}/{list.totalItems || 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (list.totalItems || 0) > 0
                                    ? ((list.completedItems || 0) /
                                        (list.totalItems || 1)) *
                                      100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="space-y-2">
                          {(list.items || []).slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                checked={item.bought || false}
                                onCheckedChange={() =>
                                  toggleItemBought(
                                    list.id,
                                    item.id,
                                    item.bought || false
                                  )
                                }
                              />
                              <span
                                className={`text-sm ${
                                  item.bought
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

                        {/* Shared With */}
                        {(list.sharedWith || []).length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Shared with {(list.sharedWith || []).join(", ")}
                            </span>
                          </div>
                        )}

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
                {selectedList?.type || "daily"} list •{" "}
                {selectedList?.date
                  ? new Date(selectedList.date).toLocaleDateString()
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
                              placeholder="e.g., 2 kg"
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
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={item.bought || false}
                          onCheckedChange={() =>
                            selectedList &&
                            toggleItemBought(
                              selectedList.id,
                              item.id,
                              item.bought || false
                            )
                          }
                        />
                        <div>
                          <p
                            className={`font-medium ${
                              item.bought
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {item.name || "Unnamed item"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity || "No quantity"} •{" "}
                            {item.category || "No category"} • Added by{" "}
                            {item.addedBy || "Unknown"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={item.bought ? "default" : "secondary"}>
                        {item.bought ? "Done" : "Pending"}
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
