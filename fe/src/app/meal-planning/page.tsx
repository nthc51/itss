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
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [ingredientInputs, setIngredientInputs] = useState<IngredientInput[]>([
    { name: "", quantity: "", unit: "", category: "" },
  ]);
  const [isCreateMealPlanOpen, setIsCreateMealPlanOpen] = useState(false);
  const [planTitle, setPlanTitle] = useState("");
  const [planType, setPlanType] = useState<"DAILY" | "WEEKLY">("DAILY");
  const [planDate, setPlanDate] = useState("");
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
    if (!planTitle || !planDate || selectedRecipes.length === 0) return;
    const newPlan = {
      title: planTitle,
      date: planDate,
      type: planType,
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
      setPlanTitle("");
      setPlanDate("");
      setPlanType("DAILY");
      setSelectedRecipes([]);
      setIsCreateMealPlanOpen(false);
      toast({ title: "Success", description: "Meal plan created!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create meal plan.",
        variant: "destructive",
      });
    }
  };

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
            <Button onClick={() => setIsCreateMealPlanOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Meal Plan
            </Button>
          </div>
        </div>

        <Tabs defaultValue="weekly" className="space-y-6">
          <TabsList>
            <TabsTrigger value="weekly">Meal Plans</TabsTrigger>
            <TabsTrigger value="recipes">Recipe Collection</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mealPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <CardTitle>{plan.title}</CardTitle>
                    <CardDescription>
                      {plan.type} -{" "}
                      {plan.date
                        ? new Date(plan.date).toLocaleDateString()
                        : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <strong>Recipes:</strong>
                      <ul className="list-disc ml-5">
                        {plan.recipes.map((rid) => {
                          const recipe = recipes.find((r) => r.id === rid);
                          return recipe ? (
                            <li key={rid}>{recipe.title}</li>
                          ) : (
                            <li key={rid}>{rid}</li>
                          );
                        })}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
          open={isCreateMealPlanOpen}
          onOpenChange={setIsCreateMealPlanOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Meal Plan</DialogTitle>
              <DialogDescription>
                Enter the plan title, date, type, and select recipes.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Plan Title</Label>
                <Input
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={planDate}
                  onChange={(e) => setPlanDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Plan Type</Label>
                <Select
                  value={planType}
                  onValueChange={(val) =>
                    setPlanType(val as "DAILY" | "WEEKLY")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                onClick={() => setIsCreateMealPlanOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateMealPlan}
                disabled={
                  !planTitle || !planDate || selectedRecipes.length === 0
                }
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
