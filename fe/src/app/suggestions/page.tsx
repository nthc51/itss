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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ChefHat, Search, Lightbulb, Users, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { mealPlansApi, foodItemsApi } from "@/lib/api-service";

interface FoodItem {
  id: string;
  _id?: string;
  name: string;
  quantity: string;
  category: string;
  expirationDate: string;
  daysUntilExpiry: number;
}

interface SuggestedRecipe {
  recipe: {
    _id: string;
    title: string;
    instructions: string[];
    servings: number;
    ingredients: any[];
  };
  status: "can_make" | "partially_can_make";
  missingIngredients: any[];
}

export default function SmartSuggestions() {
  const [availableFood, setAvailableFood] = useState<FoodItem[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<SuggestedRecipe[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch available food items
      const foodData = await foodItemsApi.getAll();
      const formattedFood = Array.isArray(foodData)
        ? foodData.map(formatFoodItem)
        : [];
      setAvailableFood(formattedFood);

      // Fetch meal suggestions
      const suggestions = await mealPlansApi.getSuggestions();
      setSuggestedRecipes(Array.isArray(suggestions) ? suggestions : []);

      // Auto-select some ingredients
      setSelectedIngredients(
        formattedFood.slice(0, 4).map((item) => item.name)
      );
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: "Failed to load suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatFoodItem = (item: any): FoodItem => {
    const calculateDaysUntilExpiry = (expirationDate: string): number => {
      const today = new Date();
      const expiry = new Date(expirationDate);
      const diffTime = expiry.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return {
      id: item._id || item.id || Math.random().toString(),
      _id: item._id,
      name: item.name || "",
      quantity: String(item.quantity || ""),
      category:
        typeof item.category === "object"
          ? item.category.name
          : item.category || "Other",
      expirationDate: item.expirationDate || "",
      daysUntilExpiry: calculateDaysUntilExpiry(item.expirationDate || ""),
    };
  };

  const handleIngredientToggle = (ingredient: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  if (!isMounted) {
    return null;
  }

  const expiringFood = availableFood.filter(
    (item) => item.daysUntilExpiry <= 3
  );

  const filteredSuggestions = suggestedRecipes.filter((suggestion) => {
    const matchesSearch = suggestion.recipe.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            Smart Food Suggestions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Get recipe suggestions based on your available ingredients
          </p>
        </div>

        <Tabs defaultValue="suggestions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="suggestions">Recipe Suggestions</TabsTrigger>
            <TabsTrigger value="expiring">Use Expiring Items</TabsTrigger>
            <TabsTrigger value="search">Search by Ingredients</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Available Ingredients */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Available Ingredients
                      </CardTitle>
                      <CardDescription>
                        Select ingredients you want to use
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {availableFood.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={item.id}
                              checked={selectedIngredients.includes(item.name)}
                              onCheckedChange={() =>
                                handleIngredientToggle(item.name)
                              }
                            />
                            <label
                              htmlFor={item.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {item.name}
                            </label>
                            {item.daysUntilExpiry <= 3 && (
                              <Badge variant="destructive" className="text-xs">
                                {item.daysUntilExpiry}d
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recipe Suggestions */}
                <div className="lg:col-span-3">
                  <div className="mb-4">
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search recipes..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredSuggestions.map((suggestion) => (
                      <Card
                        key={suggestion.recipe._id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {suggestion.recipe.title}
                            </CardTitle>
                            <Badge
                              variant={
                                suggestion.status === "can_make"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {suggestion.status === "can_make"
                                ? "Can Make"
                                : "Partial"}
                            </Badge>
                          </div>
                          <CardDescription>
                            {suggestion.recipe.instructions?.[0]?.substring(
                              0,
                              100
                            )}
                            ...
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Recipe Info */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>
                                  {suggestion.recipe.servings} servings
                                </span>
                              </div>
                            </div>

                            {/* Missing Ingredients */}
                            {suggestion.missingIngredients.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">
                                  You need:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {suggestion.missingIngredients.map(
                                    (ingredient, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {ingredient.name} ({ingredient.needed}{" "}
                                        {ingredient.unit})
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button className="flex-1" variant="outline">
                                <ChefHat className="mr-2 h-4 w-4" />
                                View Recipe
                              </Button>
                              {suggestion.missingIngredients.length > 0 && (
                                <Button variant="outline" size="sm">
                                  <ShoppingCart className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredSuggestions.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No suggestions found
                        </h3>
                        <p className="text-muted-foreground">
                          Try selecting more ingredients or adjusting your
                          filters
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="expiring">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-orange-500" />
                  Use Items Expiring Soon
                </CardTitle>
                <CardDescription>
                  Recipes to help you use ingredients that expire in the next 3
                  days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expiringFood.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {expiringFood.map((item) => (
                        <Card key={item.id} className="border-orange-200">
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity}
                              </p>
                              <Badge variant="destructive" className="mt-2">
                                {item.daysUntilExpiry} day
                                {item.daysUntilExpiry !== 1 ? "s" : ""} left
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {suggestedRecipes
                        .filter((suggestion) =>
                          suggestion.recipe.ingredients?.some((ingredient) =>
                            expiringFood.some((food) =>
                              food.name
                                .toLowerCase()
                                .includes(ingredient.name?.toLowerCase() || "")
                            )
                          )
                        )
                        .map((suggestion) => (
                          <Card
                            key={suggestion.recipe._id}
                            className="hover:shadow-lg transition-shadow"
                          >
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {suggestion.recipe.title}
                              </CardTitle>
                              <CardDescription>
                                {suggestion.recipe.instructions?.[0]?.substring(
                                  0,
                                  100
                                )}
                                ...
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>
                                      {suggestion.recipe.servings} servings
                                    </span>
                                  </div>
                                </div>
                                <Button className="w-full" variant="outline">
                                  <ChefHat className="mr-2 h-4 w-4" />
                                  Cook This Recipe
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No items expiring soon
                    </h3>
                    <p className="text-muted-foreground">
                      All your food items are fresh!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>Search Recipes by Ingredients</CardTitle>
                <CardDescription>
                  Enter ingredients you have and find matching recipes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Enter ingredients separated by commas (e.g., chicken, rice, tomatoes)"
                      className="pl-10"
                    />
                  </div>
                  <Button>
                    <Search className="mr-2 h-4 w-4" />
                    Find Recipes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
