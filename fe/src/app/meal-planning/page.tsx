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
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  _id: string;
  name: string;
}
interface Unit {
  _id: string;
  name: string;
  abbreviation: string;
}
interface IngredientInput {
  name: string;
  quantity: string;
  unit: string; // unit _id
  category: string; // category _id
}
interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  instructions: string;
  ingredients: IngredientInput[];
  category: string; // category _id
}
interface MealPlan {
  id: string;
  title: string;
  date: string;
  type: "DAILY" | "WEEKLY";
  recipes: string[]; // Array of recipe IDs
}

export default function MealPlanning() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [ingredientInputs, setIngredientInputs] = useState<IngredientInput[]>([
    { name: "", quantity: "", unit: "", category: "" },
  ]);
  const [selectedMealDate, setSelectedMealDate] = useState<string | null>(null);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const { token } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchUnits();
    fetchRecipes();
    fetchMealPlans();
    // eslint-disable-next-line
  }, [token]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/food-categories`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setUnits(Array.isArray(data) ? data : []);
    } catch {
      setUnits([]);
    }
  };

  const fetchRecipes = async () => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/recipes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setRecipes(
        Array.isArray(data)
          ? data.map((r: any) => ({
              id: r._id || r.id,
              title: r.title,
              description: r.description,
              prepTime: r.prepTime,
              cookTime: r.cookTime,
              servings: r.servings,
              instructions: r.instructions,
              ingredients: r.ingredients,
              category:
                typeof r.category === "object" ? r.category._id : r.category,
            }))
          : []
      );
    } catch {
      setRecipes([]);
    }
  };

  const fetchMealPlans = async () => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/meal-plans`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setMealPlans(
        Array.isArray(data)
          ? data.map((plan: any) => ({
              id: plan._id || plan.id,
              title: plan.title,
              date: plan.date,
              type: plan.type,
              recipes: plan.recipes.map((r: any) =>
                typeof r === "object" ? r._id : r
              ),
            }))
          : []
      );
    } catch {
      setMealPlans([]);
    }
  };

  // --- Ingredient Dynamic Form ---
  const handleIngredientChange = (
    idx: number,
    field: keyof IngredientInput,
    value: string
  ) => {
    setIngredientInputs((prev) =>
      prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing))
    );
  };
  const addIngredientRow = () => {
    setIngredientInputs((prev) => [
      ...prev,
      { name: "", quantity: "", unit: "", category: "" },
    ]);
  };
  const removeIngredientRow = (idx: number) => {
    setIngredientInputs((prev) => prev.filter((_, i) => i !== idx));
  };

  // --- Create Recipe ---
  const handleCreateRecipe = async (formData: FormData) => {
    const newRecipe = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      prepTime: Number(formData.get("prepTime")),
      cookTime: Number(formData.get("cookTime")),
      servings: Number(formData.get("servings")),
      instructions: (formData.get("instructions") as string).trim(),
      ingredients: ingredientInputs.map((ing) => ({
        name: ing.name,
        quantity: Number(ing.quantity),
        unit: ing.unit,
        category: ing.category,
      })),
      category: formData.get("category") as string,
    };

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/recipes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newRecipe),
        }
      );
      if (!res.ok) throw new Error("Failed to create recipe");
      const created = await res.json();
      setRecipes((prev) => [
        {
          ...created,
          id: created._id || created.id,
        },
        ...prev,
      ]);
      setIsCreateRecipeOpen(false);
      setIngredientInputs([{ name: "", quantity: "", unit: "", category: "" }]);
      toast({ title: "Success", description: "Recipe created successfully!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create recipe.",
        variant: "destructive",
      });
    }
  };

  // --- Create Meal Plan ---
  const handleCreateMealPlan = async () => {
    if (!selectedMealDate || selectedRecipes.length === 0) return;
    const newPlan = {
      title: `Meal Plan for ${selectedMealDate}`,
      date: selectedMealDate,
      type: "DAILY",
      recipes: selectedRecipes,
    };
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/meal-plans`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newPlan),
        }
      );
      if (!res.ok) throw new Error("Failed to create meal plan");
      const created = await res.json();
      setMealPlans((prev) => [
        ...prev,
        { ...created, id: created._id || created.id },
      ]);
      setSelectedMealDate(null);
      setSelectedRecipes([]);
      toast({ title: "Success", description: "Meal plan created!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create meal plan.",
        variant: "destructive",
      });
    }
  };

  // --- Week Dates ---
  const getWeekDates = (startDate: Date) => {
    const dates = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - start.getDay());
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(selectedWeek);

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
                        <Label htmlFor="title">Recipe Title</Label>
                        <Input
                          id="title"
                          name="title"
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
                      <Label>Ingredients</Label>
                      {ingredientInputs.map((ing, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <Input
                            placeholder="Name"
                            value={ing.name}
                            onChange={(e) =>
                              handleIngredientChange(
                                idx,
                                "name",
                                e.target.value
                              )
                            }
                            required
                          />
                          <Input
                            placeholder="Qty"
                            type="number"
                            value={ing.quantity}
                            onChange={(e) =>
                              handleIngredientChange(
                                idx,
                                "quantity",
                                e.target.value
                              )
                            }
                            required
                          />
                          <Select
                            value={ing.unit}
                            onValueChange={(val) =>
                              handleIngredientChange(idx, "unit", val)
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem key={unit._id} value={unit._id}>
                                  {unit.name} ({unit.abbreviation})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={ing.category}
                            onValueChange={(val) =>
                              handleIngredientChange(idx, "category", val)
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat._id} value={cat._id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeIngredientRow(idx)}
                            disabled={ingredientInputs.length === 1}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addIngredientRow}
                        className="mt-2"
                      >
                        + Add Ingredient
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="instructions">
                        Instructions (one step per line)
                      </Label>
                      <Textarea
                        id="instructions"
                        name="instructions"
                        placeholder="Step 1&#10;Step 2&#10;Step 3"
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
                const plansForDay = mealPlans.filter(
                  (plan) => plan.date === dateStr
                );
                return (
                  <Card key={index} className="min-h-96">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-center">
                        {
                          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                            index
                          ]
                        }
                      </CardTitle>
                      <CardDescription className="text-center">
                        {date.toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMealDate(dateStr);
                            setSelectedRecipes([]);
                          }}
                        >
                          <Plus className="h-4 w-4" /> Add Meal Plan
                        </Button>
                        {plansForDay.length > 0 && (
                          <ul className="mt-2 space-y-2">
                            {plansForDay.map((plan) => (
                              <li key={plan.id}>
                                <div className="font-medium">{plan.title}</div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {plan.recipes.map((rid) => {
                                    const recipe = recipes.find(
                                      (r) => r.id === rid
                                    );
                                    return recipe ? (
                                      <Badge key={rid} variant="secondary">
                                        {recipe.title}
                                      </Badge>
                                    ) : null;
                                  })}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
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
                      <CardTitle className="text-lg">{recipe.title}</CardTitle>
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
                        <Badge variant="outline">
                          {categories.find((c) => c._id === recipe.category)
                            ?.name || "Unknown"}
                        </Badge>
                      </div>
                      <div>
                        <strong>Ingredients:</strong>
                        <ul className="list-disc ml-5">
                          {recipe.ingredients.map((ing, idx) => (
                            <li key={idx}>
                              {ing.quantity}{" "}
                              {units.find((u) => u._id === ing.unit)
                                ?.abbreviation || "unit"}{" "}
                              {ing.name} (
                              {categories.find((c) => c._id === ing.category)
                                ?.name || "category"}
                              )
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Instructions:</strong>
                        <ol className="list-decimal ml-5">
                          {recipe.instructions
                            .split("\n")
                            .filter((line) => line.trim())
                            .map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Meal Plan Creation Dialog */}
        <Dialog
          open={!!selectedMealDate}
          onOpenChange={() => {
            setSelectedMealDate(null);
            setSelectedRecipes([]);
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Create Meal Plan for{" "}
                {selectedMealDate &&
                  new Date(selectedMealDate).toLocaleDateString()}
              </DialogTitle>
              <DialogDescription>Select recipes for this day</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Recipes</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {recipes.map((recipe) => (
                    <Button
                      key={recipe.id}
                      variant={
                        selectedRecipes.includes(recipe.id)
                          ? "secondary"
                          : "outline"
                      }
                      onClick={() => {
                        setSelectedRecipes((prev) =>
                          prev.includes(recipe.id)
                            ? prev.filter((id) => id !== recipe.id)
                            : [...prev, recipe.id]
                        );
                      }}
                    >
                      {recipe.title}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedMealDate(null);
                  setSelectedRecipes([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateMealPlan}
                disabled={selectedRecipes.length === 0}
              >
                Create Meal Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
