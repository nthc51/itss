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
import {
  ChefHat,
  Search,
  Lightbulb,
  Clock,
  Users,
  ShoppingCart,
} from "lucide-react";

interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  expirationDate: string;
  daysUntilExpiry: number;
}

interface SuggestedRecipe {
  id: string;
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  availableIngredients: string[];
  missingIngredients: string[];
  matchPercentage: number;
  instructions: string[];
}

export default function SmartSuggestions() {
  const [availableFood, setAvailableFood] = useState<FoodItem[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<SuggestedRecipe[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  useEffect(() => {
    // Mock available food items from fridge
    const mockFoodItems: FoodItem[] = [
      {
        id: "1",
        name: "Chicken Breast",
        quantity: "500g",
        category: "Meat",
        expirationDate: "2024-01-20",
        daysUntilExpiry: 4,
      },
      {
        id: "2",
        name: "Tomatoes",
        quantity: "4 pieces",
        category: "Vegetables",
        expirationDate: "2024-01-18",
        daysUntilExpiry: 2,
      },
      {
        id: "3",
        name: "Onions",
        quantity: "2 pieces",
        category: "Vegetables",
        expirationDate: "2024-01-25",
        daysUntilExpiry: 9,
      },
      {
        id: "4",
        name: "Rice",
        quantity: "1 kg",
        category: "Grains",
        expirationDate: "2024-06-01",
        daysUntilExpiry: 137,
      },
      {
        id: "5",
        name: "Eggs",
        quantity: "6 pieces",
        category: "Dairy",
        expirationDate: "2024-01-22",
        daysUntilExpiry: 6,
      },
      {
        id: "6",
        name: "Milk",
        quantity: "1 liter",
        category: "Dairy",
        expirationDate: "2024-01-19",
        daysUntilExpiry: 3,
      },
      {
        id: "7",
        name: "Cheese",
        quantity: "200g",
        category: "Dairy",
        expirationDate: "2024-01-30",
        daysUntilExpiry: 14,
      },
      {
        id: "8",
        name: "Bell Peppers",
        quantity: "3 pieces",
        category: "Vegetables",
        expirationDate: "2024-01-21",
        daysUntilExpiry: 5,
      },
    ];

    setAvailableFood(mockFoodItems);
    setSelectedIngredients(mockFoodItems.slice(0, 4).map((item) => item.name));
  }, []);

  useEffect(() => {
    // Generate recipe suggestions based on selected ingredients
    const generateSuggestions = () => {
      const mockSuggestions: SuggestedRecipe[] = [
        {
          id: "1",
          name: "Chicken Fried Rice",
          description: "Delicious fried rice with chicken and vegetables",
          prepTime: 15,
          cookTime: 20,
          servings: 4,
          difficulty: "Easy",
          availableIngredients: ["Chicken Breast", "Rice", "Onions", "Eggs"],
          missingIngredients: ["Soy Sauce", "Garlic", "Ginger"],
          matchPercentage: 75,
          instructions: [
            "Cook rice and set aside",
            "Cut chicken into small pieces",
            "Heat oil in wok or large pan",
            "Cook chicken until done",
            "Add onions and cook until soft",
            "Add rice and eggs, stir fry",
            "Season with soy sauce",
          ],
        },
        {
          id: "2",
          name: "Chicken and Vegetable Stir Fry",
          description: "Quick and healthy stir fry with fresh vegetables",
          prepTime: 10,
          cookTime: 15,
          servings: 3,
          difficulty: "Easy",
          availableIngredients: ["Chicken Breast", "Bell Peppers", "Onions"],
          missingIngredients: ["Soy Sauce", "Garlic", "Vegetable Oil"],
          matchPercentage: 80,
          instructions: [
            "Slice chicken and vegetables",
            "Heat oil in pan",
            "Cook chicken first",
            "Add vegetables and stir fry",
            "Season and serve",
          ],
        },
        {
          id: "3",
          name: "Tomato and Cheese Omelet",
          description: "Fluffy omelet with fresh tomatoes and cheese",
          prepTime: 5,
          cookTime: 10,
          servings: 2,
          difficulty: "Easy",
          availableIngredients: ["Eggs", "Tomatoes", "Cheese", "Milk"],
          missingIngredients: ["Butter", "Salt", "Pepper"],
          matchPercentage: 90,
          instructions: [
            "Beat eggs with milk",
            "Heat butter in pan",
            "Pour in eggs",
            "Add tomatoes and cheese",
            "Fold and serve",
          ],
        },
        {
          id: "4",
          name: "Stuffed Bell Peppers",
          description: "Bell peppers stuffed with rice and chicken",
          prepTime: 20,
          cookTime: 30,
          servings: 4,
          difficulty: "Medium",
          availableIngredients: [
            "Bell Peppers",
            "Rice",
            "Chicken Breast",
            "Onions",
          ],
          missingIngredients: ["Ground Beef", "Herbs", "Breadcrumbs"],
          matchPercentage: 70,
          instructions: [
            "Hollow out bell peppers",
            "Cook rice and chicken",
            "Mix filling ingredients",
            "Stuff peppers",
            "Bake until tender",
          ],
        },
      ];

      // Filter suggestions based on selected ingredients
      const filtered = mockSuggestions.filter((recipe) =>
        recipe.availableIngredients.some((ingredient) =>
          selectedIngredients.includes(ingredient)
        )
      );

      setSuggestedRecipes(filtered);
    };

    generateSuggestions();
  }, [selectedIngredients]);

  const handleIngredientToggle = (ingredient: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const expiringFood = availableFood.filter(
    (item) => item.daysUntilExpiry <= 3
  );

  const filteredSuggestions = suggestedRecipes.filter((recipe) => {
    const matchesSearch = recipe.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      filterDifficulty === "all" || recipe.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
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
                    <select
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredSuggestions.map((recipe) => (
                    <Card
                      key={recipe.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {recipe.name}
                          </CardTitle>
                          <Badge
                            variant={
                              recipe.matchPercentage >= 80
                                ? "default"
                                : "secondary"
                            }
                          >
                            {recipe.matchPercentage}% match
                          </Badge>
                        </div>
                        <CardDescription>{recipe.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Recipe Info */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {recipe.prepTime + recipe.cookTime} min
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{recipe.servings} servings</span>
                            </div>
                            <Badge variant="outline">{recipe.difficulty}</Badge>
                          </div>

                          {/* Available Ingredients */}
                          <div>
                            <p className="text-sm font-medium mb-2">
                              You have:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {recipe.availableIngredients.map(
                                (ingredient, index) => (
                                  <Badge
                                    key={index}
                                    variant="default"
                                    className="text-xs"
                                  >
                                    {ingredient}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>

                          {/* Missing Ingredients */}
                          {recipe.missingIngredients.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">
                                You need:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {recipe.missingIngredients.map(
                                  (ingredient, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {ingredient}
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
                            {recipe.missingIngredients.length > 0 && (
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
                        Try selecting more ingredients or adjusting your filters
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
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
                        .filter((recipe) =>
                          recipe.availableIngredients.some((ingredient) =>
                            expiringFood.some(
                              (food) => food.name === ingredient
                            )
                          )
                        )
                        .map((recipe) => (
                          <Card
                            key={recipe.id}
                            className="hover:shadow-lg transition-shadow"
                          >
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {recipe.name}
                              </CardTitle>
                              <CardDescription>
                                {recipe.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {recipe.prepTime + recipe.cookTime} min
                                    </span>
                                  </div>
                                  <Badge variant="outline">
                                    {recipe.difficulty}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-2">
                                    Uses expiring:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {recipe.availableIngredients
                                      .filter((ingredient) =>
                                        expiringFood.some(
                                          (food) => food.name === ingredient
                                        )
                                      )
                                      .map((ingredient, index) => (
                                        <Badge
                                          key={index}
                                          variant="destructive"
                                          className="text-xs"
                                        >
                                          {ingredient}
                                        </Badge>
                                      ))}
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
