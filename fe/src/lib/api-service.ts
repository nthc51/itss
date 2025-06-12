import { ApiError } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Get current user ID from localStorage
function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  const userData = localStorage.getItem("user");
  if (!userData) return null;
  try {
    const user = JSON.parse(userData);
    return user.id;
  } catch {
    return null;
  }
}

// Generic API request function with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If parsing fails, use default error message
      }

      throw new ApiError(response.status, errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      0,
      error instanceof Error ? error.message : "Network error"
    );
  }
}

// Shopping Lists API
export const shoppingListsApi = {
  getAll: () => {
    const userId = getCurrentUserId();
    return apiRequest<any[]>(
      `/shopping-lists${userId ? `?userId=${userId}` : ""}`
    ).then((lists) =>
      lists.map((list) => ({
        ...list,
        name: list.title, // Map title to name for frontend
        sharedWith: list.sharedWithGroup || [],
        completedItems: 0,
        totalItems: list.items ? list.items.length : 0,
      }))
    );
  },
  getById: (id: string) => apiRequest<any>(`/shopping-lists/${id}`),
  create: (data: any) => {
    const userId = getCurrentUserId();
    return apiRequest<any>("/shopping-lists", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        createdBy: userId,
        items: [], // Initialize with empty items array
      }),
    });
  },
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
  deleteItem: (listId: string, itemId: string) =>
    apiRequest<void>(`/shopping-lists/${listId}/items/${itemId}`, {
      method: "DELETE",
    }),
};

// Food Items API (Fridge) - change back to pantry-items
export const foodItemsApi = {
  getAll: () => {
    const userId = getCurrentUserId();
    return apiRequest<any[]>(`/pantry-items${userId ? `?userId=${userId}` : ""}`);
  },
  getById: (id: string) => apiRequest<any>(`/pantry-items/${id}`),
  create: (data: any) => {
    const userId = getCurrentUserId();
    return apiRequest<any>("/pantry-items", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        ownedBy: userId,
      }),
    });
  },
  update: (id: string, data: any) =>
    apiRequest<any>(`/pantry-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/pantry-items/${id}`, {
      method: "DELETE",
    }),
  getExpiring: (days = 3) => {
    const userId = getCurrentUserId();
    return apiRequest<any[]>(
      `/pantry-items/expiring-soon${
        userId ? `?userId=${userId}&daysThreshold=${days}` : ""
      }`
    );
  },
};

// Meal Plans API
export const mealPlansApi = {
  getAll: () => {
    const userId = getCurrentUserId();
    return apiRequest<any[]>(`/meal-plans${userId ? `?userId=${userId}` : ""}`);
  },
  getByDateRange: (startDate: string, endDate: string) => {
    const userId = getCurrentUserId();
    return apiRequest<any[]>(
      `/meal-plans${
        userId
          ? `?userId=${userId}&start=${startDate}&end=${endDate}`
          : `?start=${startDate}&end=${endDate}`
      }`
    );
  },
  create: (data: any) => {
    const userId = getCurrentUserId();
    return apiRequest<any>("/meal-plans", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        createdBy: userId,
      }),
    });
  },
  update: (id: string, data: any) =>
    apiRequest<any>(`/meal-plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/meal-plans/${id}`, {
      method: "DELETE",
    }),
  getSuggestions: () => {
    const userId = getCurrentUserId();
    return apiRequest<any[]>(
      `/meal-plans/suggestions${userId ? `?userId=${userId}` : ""}`
    );
  },
};

// Recipes API
export const recipesApi = {
  getAll: () => apiRequest<any[]>("/recipes"),
  getById: (id: string) => apiRequest<any>(`/recipes/${id}`),
  create: (data: any) => {
    const userId = getCurrentUserId();
    return apiRequest<any>("/recipes", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        createdBy: userId,
      }),
    });
  },
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

// Reports API (you'll need to create these endpoints in your backend)
export const reportsApi = {
  getPurchaseStats: (timeRange: string) =>
    apiRequest<any>(`/reports/purchases?range=${timeRange}`),
  getWasteStats: (timeRange: string) =>
    apiRequest<any>(`/reports/waste?range=${timeRange}`),
  getConsumptionTrends: () => apiRequest<any[]>("/reports/consumption-trends"),
  getCategoryBreakdown: (month: string) =>
    apiRequest<any>(`/reports/categories?month=${month}`),
};

// User API
export const userApi = {
  getProfile: () => apiRequest<any>("/users/profile"),
  updateProfile: (data: any) =>
    apiRequest<any>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  changePassword: (data: any) =>
    apiRequest<any>("/users/change-password", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Family API
export const familyApi = {
  getMembers: () => apiRequest<any[]>("/family/members"),
  addMember: (data: any) =>
    apiRequest<any>("/family/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateMember: (id: string, data: any) =>
    apiRequest<any>(`/family/members/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteMember: (id: string) =>
    apiRequest<void>(`/family/members/${id}`, {
      method: "DELETE",
    }),
};
