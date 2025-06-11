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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChefHat, Clock, Users, Plus, Star, Heart } from "lucide-react";

interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  ingredients: string[];
  instructions: string[];
  isFavorite: boolean;
  isPopular: boolean;
  category: string;
}

interface MealPlan {
  id: string;
  date: string;
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
  snacks?: Recipe[];
}

const mealTypes = ["breakfast", "lunch", "dinner", "snacks"];
const difficulties = ["Easy", "Medium", "Hard"];
const categories = ["Main Course", "Appetizer", "Dessert", "Snack", "Beverage"];

export default function MealPlanning() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [selectedMealSlot, setSelectedMealSlot] = useState<{
    date: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    // Mock data - replace with API calls
    const mockRecipes: Recipe[] = [
      {
        id: "1",
        name: "Scrambled Eggs with Toast",
        description:
          "Classic breakfast with fluffy scrambled eggs and buttered toast",
        prepTime: 5,
        cookTime: 10,
        servings: 2,
        difficulty: "Easy",
        ingredients: [
          "4 eggs",
          "2 slices bread",
          "2 tbsp butter",
          "Salt",
          "Pepper",
        ],
        instructions: [
          "Beat eggs in bowl",
          "Heat butter in pan",
          "Cook eggs stirring gently",
          "Toast bread",
          "Serve together",
        ],
        isFavorite: true,
        isPopular: true,
        category: "Main Course",
      },
      {
        id: "2",
        name: "Chicken Caesar Salad",
        description:
          "Fresh romaine lettuce with grilled chicken and caesar dressing",
        prepTime: 15,
        cookTime: 20,
        servings: 4,
        difficulty: "Medium",
        ingredients: [
          "2 chicken breasts",
          "1 head romaine lettuce",
          "Caesar dressing",
          "Parmesan cheese",
          "Croutons",
        ],
        instructions: [
          "Grill chicken",
          "Chop lettuce",
          "Mix with dressing",
          "Add toppings",
          "Serve immediately",
        ],
        isFavorite: false,
        isPopular: true,
        category: "Main Course",
      },
      {
        id: "3",
        name: "Grilled Salmon with Vegetables",
        description: "Healthy grilled salmon with seasonal vegetables",
        prepTime: 10,
        cookTime: 25,
        servings: 4,
        difficulty: "Medium",
        ingredients: [
          "4 salmon fillets",
          "Mixed vegetables",
          "Olive oil",
          "Lemon",
          "Herbs",
        ],
        instructions: [
          "Preheat grill",
          "Season salmon",
          "Grill salmon and vegetables",
          "Serve with lemon",
        ],
        isFavorite: true,
        isPopular: false,
        category: "Main Course",
      },
    ];

    const mockMealPlans: MealPlan[] = [
      {
        id: "1",
        date: "2024-01-15",
        breakfast: mockRecipes[0],
        lunch: mockRecipes[1],
        dinner: mockRecipes[2],
      },
      {
        id: "2",
        date: "2024-01-16",
        breakfast: mockRecipes[0],
        dinner: mockRecipes[2],
      },
    ];

    setRecipes(mockRecipes);
    setMealPlans(mockMealPlans);
  }, []);

  const getWeekDates = (startDate: Date) => {
    const dates = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const handleCreateRecipe = async (formData: FormData) => {
    const newRecipe: Recipe = {
      id: Date.now().toString(),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      prepTime: Number.parseInt(formData.get("prepTime") as string),
      cookTime: Number.parseInt(formData.get("cookTime") as string),
      servings: Number.parseInt(formData.get("servings") as string),
      difficulty: formData.get("difficulty") as "Easy" | "Medium" | "Hard",
      ingredients: (formData.get("ingredients") as string)
        .split("\n")
        .filter((i) => i.trim()),
      instructions: (formData.get("instructions") as string)
        .split("\n")
        .filter((i) => i.trim()),
      isFavorite: false,
      isPopular: false,
      category: formData.get("category") as string,
    };

    setRecipes((prev) => [newRecipe, ...prev]);
    setIsCreateRecipeOpen(false);
  };

  const handleAssignMeal = (recipe: Recipe) => {
    if (!selectedMealSlot) return;

    setMealPlans((prev) => {
      const existingPlan = prev.find(
        (plan) => plan.date === selectedMealSlot.date
      );

      if (existingPlan) {
        return prev.map((plan) =>
          plan.date === selectedMealSlot.date
            ? { ...plan, [selectedMealSlot.type]: recipe }
            : plan
        );
      } else {
        const newPlan: MealPlan = {
          id: Date.now().toString(),
          date: selectedMealSlot.date,
          [selectedMealSlot.type]: recipe,
        };
        return [...prev, newPlan];
      }
    });

    setSelectedMealSlot(null);
  };

  const weekDates = getWeekDates(selectedWeek);
  const favoriteRecipes = recipes.filter((recipe) => recipe.isFavorite);
  const popularRecipes = recipes.filter((recipe) => recipe.isPopular);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                Meal Planning
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Plan your family's meals and manage recipes
              </p>
            </div>
            <Dialog
              open={isCreateRecipeOpen}
              onOpenChange={setIsCreateRecipeOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Recipe
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form action={handleCreateRecipe}>
                  <DialogHeader>
                    <DialogTitle>Create New Recipe</DialogTitle>
                    <DialogDescription>
                      Add a new recipe to your collection
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Recipe Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., Chicken Stir Fry"
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
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Brief description of the recipe"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="prepTime">Prep Time (min)</Label>
                        <Input
                          id="prepTime"
                          name="prepTime"
                          type="number"
                          placeholder="15"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cookTime">Cook Time (min)</Label>
                        <Input
                          id="cookTime"
                          name="cookTime"
                          type="number"
                          placeholder="30"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="servings">Servings</Label>
                        <Input
                          id="servings"
                          name="servings"
                          type="number"
                          placeholder="4"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select name="difficulty" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {difficulty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ingredients">
                        Ingredients (one per line)
                      </Label>
                      <Textarea
                        id="ingredients"
                        name="ingredients"
                        placeholder="2 chicken breasts&#10;1 cup rice&#10;2 tbsp soy sauce"
                        rows={4}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="instructions">
                        Instructions (one per line)
                      </Label>
                      <Textarea
                        id="instructions"
                        name="instructions"
                        placeholder="Heat oil in pan&#10;Cook chicken until done&#10;Add vegetables and stir"
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateRecipeOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Recipe</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="weekly" className="space-y-6">
          <TabsList>
            <TabsTrigger value="weekly">Weekly Plan</TabsTrigger>
            <TabsTrigger value="recipes">Recipe Collection</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() =>
                  setSelectedWeek(
                    new Date(selectedWeek.getTime() - 7 * 24 * 60 * 60 * 1000)
                  )
                }
              >
                Previous Week
              </Button>
              <h2 className="text-xl font-semibold">
                Week of {weekDates[0].toLocaleDateString()}
              </h2>
              <Button
                variant="outline"
                onClick={() =>
                  setSelectedWeek(
                    new Date(selectedWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
                  )
                }
              >
                Next Week
              </Button>
            </div>

            {/* Weekly Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {weekDates.map((date, index) => {
                const dateStr = date.toISOString().split("T")[0];
                const dayPlan = mealPlans.find((plan) => plan.date === dateStr);
                const dayNames = [
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                ];

                return (
                  <Card key={index} className="min-h-96">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-center">
                        {dayNames[index]}
                      </CardTitle>
                      <CardDescription className="text-center">
                        {date.toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mealTypes.slice(0, 3).map((mealType) => (
                        <div key={mealType} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium capitalize">
                              {mealType}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setSelectedMealSlot({
                                  date: dateStr,
                                  type: mealType,
                                })
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {dayPlan?.[mealType as keyof MealPlan] ? (
                            <div className="text-sm">
                              <p className="font-medium">
                                {
                                  (
                                    dayPlan[
                                      mealType as keyof MealPlan
                                    ] as Recipe
                                  )?.name
                                }
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {(
                                    dayPlan[
                                      mealType as keyof MealPlan
                                    ] as Recipe
                                  )?.prepTime +
                                    (
                                      dayPlan[
                                        mealType as keyof MealPlan
                                      ] as Recipe
                                    )?.cookTime}{" "}
                                  min
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No meal planned
                            </p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="recipes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{recipe.name}</CardTitle>
                      <div className="flex gap-1">
                        {recipe.isFavorite && (
                          <Heart className="h-4 w-4 text-red-500 fill-current" />
                        )}
                        {recipe.isPopular && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>
                    <CardDescription>{recipe.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{recipe.prepTime + recipe.cookTime} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{recipe.servings} servings</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{recipe.difficulty}</Badge>
                        <Badge variant="secondary">{recipe.category}</Badge>
                      </div>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() =>
                          selectedMealSlot && handleAssignMeal(recipe)
                        }
                        disabled={!selectedMealSlot}
                      >
                        <ChefHat className="mr-2 h-4 w-4" />
                        {selectedMealSlot ? "Assign to Meal" : "View Recipe"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Favorite Recipes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteRecipes.map((recipe) => (
                    <Card
                      key={recipe.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{recipe.name}</CardTitle>
                        <CardDescription>{recipe.description}</CardDescription>
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
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{recipe.servings} servings</span>
                            </div>
                          </div>
                          <Badge variant="outline">{recipe.difficulty}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Popular Recipes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularRecipes.map((recipe) => (
                    <Card
                      key={recipe.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{recipe.name}</CardTitle>
                        <CardDescription>{recipe.description}</CardDescription>
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
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{recipe.servings} servings</span>
                            </div>
                          </div>
                          <Badge variant="outline">{recipe.difficulty}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recipe Selection Dialog */}
        <Dialog
          open={!!selectedMealSlot}
          onOpenChange={() => setSelectedMealSlot(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                Select Recipe for {selectedMealSlot?.type} on{" "}
                {selectedMealSlot?.date &&
                  new Date(selectedMealSlot.date).toLocaleDateString()}
              </DialogTitle>
              <DialogDescription>
                Choose a recipe from your collection
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {recipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleAssignMeal(recipe)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{recipe.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>{recipe.prepTime + recipe.cookTime} min</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {recipe.difficulty}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedMealSlot(null)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
