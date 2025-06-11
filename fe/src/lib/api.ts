// API utility functions for your food management backend

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, "Network error or invalid JSON response");
  }
}

// Shopping Lists API
export const shoppingListsApi = {
  getAll: () => apiRequest<any[]>("/shopping-lists"),
  getById: (id: string) => apiRequest<any>(`/shopping-lists/${id}`),
  create: (data: any) =>
    apiRequest<any>("/shopping-lists", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest<any>(`/shopping-lists/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/shopping-lists/${id}`, {
      method: "DELETE",
    }),
  addItem: (listId: string, item: any) =>
    apiRequest<any>(`/shopping-lists/${listId}/items`, {
      method: "POST",
      body: JSON.stringify(item),
    }),
  updateItem: (listId: string, itemId: string, data: any) =>
    apiRequest<any>(`/shopping-lists/${listId}/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Food Items API
export const foodItemsApi = {
  getAll: () => apiRequest<any[]>("/food-items"),
  getById: (id: string) => apiRequest<any>(`/food-items/${id}`),
  create: (data: any) =>
    apiRequest<any>("/food-items", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest<any>(`/food-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/food-items/${id}`, {
      method: "DELETE",
    }),
  getExpiring: (days = 3) =>
    apiRequest<any[]>(`/food-items/expiring?days=${days}`),
};

// Meal Plans API
export const mealPlansApi = {
  getAll: () => apiRequest<any[]>("/meal-plans"),
  getByDateRange: (startDate: string, endDate: string) =>
    apiRequest<any[]>(`/meal-plans?start=${startDate}&end=${endDate}`),
  create: (data: any) =>
    apiRequest<any>("/meal-plans", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest<any>(`/meal-plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/meal-plans/${id}`, {
      method: "DELETE",
    }),
};

// Recipes API
export const recipesApi = {
  getAll: () => apiRequest<any[]>("/recipes"),
  getById: (id: string) => apiRequest<any>(`/recipes/${id}`),
  create: (data: any) =>
    apiRequest<any>("/recipes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest<any>(`/recipes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/recipes/${id}`, {
      method: "DELETE",
    }),
  getFavorites: () => apiRequest<any[]>("/recipes/favorites"),
  getPopular: () => apiRequest<any[]>("/recipes/popular"),
  getSuggestions: (ingredients: string[]) =>
    apiRequest<any[]>("/recipes/suggestions", {
      method: "POST",
      body: JSON.stringify({ ingredients }),
    }),
};

// Reports API
export const reportsApi = {
  getPurchaseStats: (timeRange: string) =>
    apiRequest<any>(`/reports/purchases?range=${timeRange}`),
  getWasteStats: (timeRange: string) =>
    apiRequest<any>(`/reports/waste?range=${timeRange}`),
  getConsumptionTrends: () => apiRequest<any[]>("/reports/consumption-trends"),
  getCategoryBreakdown: (month: string) =>
    apiRequest<any>(`/reports/categories?month=${month}`),
};

// Family/User API
export const familyApi = {
  getMembers: () => apiRequest<any[]>("/family/members"),
  addMember: (data: any) =>
    apiRequest<any>("/family/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  shareList: (listId: string, memberIds: string[]) =>
    apiRequest<any>(`/shopping-lists/${listId}/share`, {
      method: "POST",
      body: JSON.stringify({ memberIds }),
    }),
};
