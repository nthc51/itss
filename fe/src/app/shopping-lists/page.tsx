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

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  completed: boolean;
  addedBy: string;
}

interface ShoppingList {
  id: string;
  name: string;
  type: "daily" | "weekly";
  date: string;
  items: ShoppingItem[];
  sharedWith: string[];
  createdBy: string;
  completedItems: number;
  totalItems: number;
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
  "Snacks",
  "Other",
];

export default function ShoppingLists() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);

  useEffect(() => {
    // Mock data - replace with API call
    const mockLists: ShoppingList[] = [
      {
        id: "1",
        name: "Weekly Groceries",
        type: "weekly",
        date: "2024-01-15",
        items: [
          {
            id: "1",
            name: "Tomatoes",
            quantity: "2 kg",
            category: "Vegetables",
            completed: false,
            addedBy: "John",
          },
          {
            id: "2",
            name: "Chicken Breast",
            quantity: "1 kg",
            category: "Meat",
            completed: true,
            addedBy: "Mary",
          },
          {
            id: "3",
            name: "Milk",
            quantity: "2 liters",
            category: "Dairy",
            completed: false,
            addedBy: "John",
          },
        ],
        sharedWith: ["Mary", "Tom"],
        createdBy: "John",
        completedItems: 1,
        totalItems: 3,
      },
      {
        id: "2",
        name: "Today's Shopping",
        type: "daily",
        date: "2024-01-16",
        items: [
          {
            id: "4",
            name: "Bread",
            quantity: "2 loaves",
            category: "Grains",
            completed: false,
            addedBy: "Mary",
          },
          {
            id: "5",
            name: "Apples",
            quantity: "1 kg",
            category: "Fruits",
            completed: false,
            addedBy: "Mary",
          },
        ],
        sharedWith: ["John"],
        createdBy: "Mary",
        completedItems: 0,
        totalItems: 2,
      },
    ];
    setLists(mockLists);
  }, []);

  const handleCreateList = async (formData: FormData) => {
    const newList: ShoppingList = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      type: formData.get("type") as "daily" | "weekly",
      date: formData.get("date") as string,
      items: [],
      sharedWith: [],
      createdBy: "Current User",
      completedItems: 0,
      totalItems: 0,
    };

    setLists((prev) => [newList, ...prev]);
    setIsCreateDialogOpen(false);
  };

  const toggleItemComplete = (listId: string, itemId: string) => {
    setLists((prev) =>
      prev.map((list) => {
        if (list.id === listId) {
          const updatedItems = list.items.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          );
          const completedCount = updatedItems.filter(
            (item) => item.completed
          ).length;
          return {
            ...list,
            items: updatedItems,
            completedItems: completedCount,
          };
        }
        return list;
      })
    );
  };

  const filteredLists = lists.filter((list) =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search shopping lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Shopping Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLists.map((list) => (
            <Card
              key={list.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{list.name}</CardTitle>
                  <Badge
                    variant={list.type === "weekly" ? "default" : "secondary"}
                  >
                    {list.type}
                  </Badge>
                </div>
                <CardDescription>
                  Created by {list.createdBy} •{" "}
                  {new Date(list.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>
                        {list.completedItems}/{list.totalItems}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${
                            list.totalItems > 0
                              ? (list.completedItems / list.totalItems) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-2">
                    {list.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() =>
                            toggleItemComplete(list.id, item.id)
                          }
                        />
                        <span
                          className={`text-sm ${
                            item.completed
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {item.name} ({item.quantity})
                        </span>
                      </div>
                    ))}
                    {list.items.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{list.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  {/* Shared With */}
                  {list.sharedWith.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Shared with {list.sharedWith.join(", ")}
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
      </div>
    </div>
  );
}
