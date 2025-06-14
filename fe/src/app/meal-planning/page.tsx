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
import {
  ChefHat,
  Clock,
  Users,
  Plus,
  Star,
  Heart,
  Edit,
  Trash2,
} from "lucide-react";
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
  _id: string;
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
  recipes: { _id: string; title: string }[]; // Array of recipe objects
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
  const [isEditRecipeOpen, setIsEditRecipeOpen] = useState(false);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [editIngredientInputs, setEditIngredientInputs] = useState<
    IngredientInput[]
  >([]);
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
              _id: r._id,
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
              recipes: Array.isArray(plan.recipes)
                ? plan.recipes.map((r: any) =>
                    typeof r === "object"
                      ? { _id: r._id, title: r.title }
                      : { _id: r, title: "" }
                  )
                : [],
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

  // --- Edit Ingredient Dynamic Form ---
  const handleEditIngredientChange = (
    idx: number,
    field: keyof IngredientInput,
    value: string
  ) => {
    setEditIngredientInputs((prev) =>
      prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing))
    );
  };
  const addEditIngredientRow = () => {
    setEditIngredientInputs((prev) => [
      ...prev,
      { name: "", quantity: "", unit: "", category: "" },
    ]);
  };
  const removeEditIngredientRow = (idx: number) => {
    setEditIngredientInputs((prev) => prev.filter((_, i) => i !== idx));
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
          _id: created._id,
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

  // --- Edit Recipe ---
  useEffect(() => {
    if (editRecipe) {
      setEditIngredientInputs(
        editRecipe.ingredients.map((ing) => ({
          name: ing.name,
          quantity: String(ing.quantity),
          unit: ing.unit,
          category: ing.category,
        }))
      );
    }
  }, [editRecipe]);

  const handleEditRecipe = async (formData: FormData) => {
    if (!editRecipe) return;
    const updatedRecipe = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      prepTime: Number(formData.get("prepTime")),
      cookTime: Number(formData.get("cookTime")),
      servings: Number(formData.get("servings")),
      instructions: (formData.get("instructions") as string).trim(),
      ingredients: editIngredientInputs.map((ing) => ({
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
        }/recipes/${editRecipe._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedRecipe),
        }
      );
      if (!res.ok) throw new Error("Failed to update recipe");
      const updated = await res.json();
      setRecipes((prev) =>
        prev.map((r) =>
          r._id === updated._id ? { ...updated, _id: updated._id } : r
        )
      );
      setIsEditRecipeOpen(false);
      toast({ title: "Success", description: "Recipe updated!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update recipe.",
        variant: "destructive",
      });
    }
  };

  // --- Delete Recipe ---
  const handleDeleteRecipe = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        }/recipes/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete recipe");
      setRecipes((prev) => prev.filter((r) => r._id !== id));
      toast({ title: "Success", description: "Recipe deleted!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete recipe.",
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
        {
          ...created,
          id: created._id || created.id,
          recipes: Array.isArray(created.recipes)
            ? created.recipes.map((r: any) =>
                typeof r === "object"
                  ? { _id: r._id, title: r.title }
                  : { _id: r, title: "" }
              )
            : [],
        },
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
            <div className="flex gap-2">
              <Button onClick={() => setIsCreateRecipeOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Recipe
              </Button>
              <Button onClick={() => setIsCreateMealPlanOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Meal Plan
              </Button>
            </div>
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
                        {plan.recipes.map((r) => (
                          <li key={r._id}>{r.title}</li>
                        ))}
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
                  key={recipe._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{recipe.title}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditRecipe(recipe);
                            setIsEditRecipeOpen(true);
                          }}
                          aria-label="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteRecipe(recipe._id)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

        {/* Create Recipe Dialog */}
        <Dialog open={isCreateRecipeOpen} onOpenChange={setIsCreateRecipeOpen}>
          <DialogContent className="max-w-2xl">
            <form action={handleCreateRecipe}>
              <DialogHeader>
                <DialogTitle>Add New Recipe</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new recipe.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="prepTime">Prep Time (min)</Label>
                    <Input
                      id="prepTime"
                      name="prepTime"
                      type="number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cookTime">Cook Time (min)</Label>
                    <Input
                      id="cookTime"
                      name="cookTime"
                      type="number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="servings">Servings</Label>
                    <Input
                      id="servings"
                      name="servings"
                      type="number"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea id="instructions" name="instructions" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ingredients</Label>
                  <div className="space-y-2">
                    {ingredientInputs.map((ing, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          placeholder="Name"
                          value={ing.name}
                          onChange={(e) =>
                            handleIngredientChange(idx, "name", e.target.value)
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
                            {units.map((u) => (
                              <SelectItem key={u._id} value={u._id}>
                                {u.name}
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
                            {categories.map((c) => (
                              <SelectItem key={c._id} value={c._id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeIngredientRow(idx)}
                          disabled={ingredientInputs.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addIngredientRow}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Ingredient
                    </Button>
                  </div>
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
                <Button type="submit">Add Recipe</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Recipe Dialog */}
        <Dialog open={isEditRecipeOpen} onOpenChange={setIsEditRecipeOpen}>
          <DialogContent className="max-w-2xl">
            <form
              action={handleEditRecipe}
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                handleEditRecipe(new FormData(form));
              }}
            >
              <DialogHeader>
                <DialogTitle>Edit Recipe</DialogTitle>
                <DialogDescription>
                  Update the recipe details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    defaultValue={editRecipe?.title}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editRecipe?.description}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="prepTime">Prep Time (min)</Label>
                    <Input
                      id="prepTime"
                      name="prepTime"
                      type="number"
                      required
                      defaultValue={editRecipe?.prepTime}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cookTime">Cook Time (min)</Label>
                    <Input
                      id="cookTime"
                      name="cookTime"
                      type="number"
                      required
                      defaultValue={editRecipe?.cookTime}
                    />
                  </div>
                  <div>
                    <Label htmlFor="servings">Servings</Label>
                    <Input
                      id="servings"
                      name="servings"
                      type="number"
                      required
                      defaultValue={editRecipe?.servings}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    required
                    defaultValue={editRecipe?.instructions}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    name="category"
                    required
                    defaultValue={editRecipe?.category}
                    onValueChange={(val) => {
                      if (editRecipe)
                        setEditRecipe({ ...editRecipe, category: val });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ingredients</Label>
                  <div className="space-y-2">
                    {editIngredientInputs.map((ing, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          placeholder="Name"
                          value={ing.name}
                          onChange={(e) =>
                            handleEditIngredientChange(
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
                            handleEditIngredientChange(
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
                            handleEditIngredientChange(idx, "unit", val)
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((u) => (
                              <SelectItem key={u._id} value={u._id}>
                                {u.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={ing.category}
                          onValueChange={(val) =>
                            handleEditIngredientChange(idx, "category", val)
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c._id} value={c._id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEditIngredientRow(idx)}
                          disabled={editIngredientInputs.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addEditIngredientRow}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Ingredient
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditRecipeOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
                      key={recipe._id}
                      variant={
                        selectedRecipes.includes(recipe._id)
                          ? "secondary"
                          : "outline"
                      }
                      onClick={() => {
                        setSelectedRecipes((prev) =>
                          prev.includes(recipe._id)
                            ? prev.filter((id) => id !== recipe._id)
                            : [...prev, recipe._id]
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
