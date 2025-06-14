"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

interface SuggestedRecipe {
  recipe: {
    _id: string;
    title: string;
    description?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    instructions?: string;
    // ...other fields as needed
  };
  status: "can_make" | "partially_can_make";
  missingIngredients: {
    name: string;
    required: number;
    have: number;
    unit: string;
    category: string;
  }[];
}

export default function MealPlanSuggestions() {
  const { token } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestedRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
          }/meal-plans/suggestions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch suggestions");
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchSuggestions();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Meal Plan Suggestions</h1>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No suggestions found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((s) => (
              <Card key={s.recipe._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {s.recipe.title}
                    <Badge
                      variant={
                        s.status === "can_make" ? "default" : "secondary"
                      }
                    >
                      {s.status === "can_make"
                        ? "Can Make"
                        : "Missing Ingredients"}
                    </Badge>
                  </CardTitle>
                  {s.recipe.description && (
                    <CardDescription>{s.recipe.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {s.status === "partially_can_make" &&
                    s.missingIngredients.length > 0 && (
                      <div className="mb-2">
                        <strong>Missing Ingredients:</strong>
                        <ul className="list-disc ml-5">
                          {s.missingIngredients.map((mi, idx) => (
                            <li key={idx}>
                              {mi.name}: need {mi.required}, have {mi.have} (
                              {mi.unit}, {mi.category})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  <div>
                    <strong>Servings:</strong> {s.recipe.servings ?? "?"} <br />
                    <strong>Prep Time:</strong> {s.recipe.prepTime ?? "?"} min{" "}
                    <br />
                    <strong>Cook Time:</strong> {s.recipe.cookTime ?? "?"} min
                  </div>
                  {s.recipe.instructions && (
                    <div className="mt-2">
                      <strong>Instructions:</strong>
                      <ol className="list-decimal ml-5">
                        {s.recipe.instructions
                          .split("\n")
                          .filter((line) => line.trim())
                          .map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
