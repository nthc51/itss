import { ApiError } from "./auth";

// Point all requests to the backend API prefix
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

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

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// Generic API request with built‑in error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const config: RequestInit = { ...options, headers };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // fallback
      }
      throw new ApiError(response.status, errorMessage);
    }
    if (response.status === 204) {
      return {} as T;
    }
    return (await response.json()) as T;
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
        name: list.title,
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
      body: JSON.stringify({ ...data, createdBy: userId, items: [] }),
    });
  },
  update: (id: string, data: any) =>
    apiRequest<any>(`/shopping-lists/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/shopping-lists/${id}`, {
      method: "DELETE",
    }),
};

// Food Items API (Fridge)
export const foodItemsApi = {
  getAll: () => {
    const userId = getCurrentUserId();
    return apiRequest<any[]>(
      `/pantry-items${userId ? `?userId=${userId}` : ""}`
    );
  },
  getById: (id: string) => apiRequest<any>(`/pantry-items/${id}`),
  create: (data: any) => {
    const userId = getCurrentUserId();
    return apiRequest<any>("/pantry-items", {
      method: "POST",
      body: JSON.stringify({ ...data, ownedBy: userId }),
    });
  },
  update: (id: string, data: any) =>
    apiRequest<any>(`/pantry-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/pantry-items/${id}`, {
      method: "DELETE",
    }),
  getExpiring: (days = 3) => {
    const userId = getCurrentUserId();
    return apiRequest<any[]>(
      `/pantry-items/expiring-soon${
        userId
          ? `?userId=${userId}&daysThreshold=${days}`
          : `?daysThreshold=${days}`
      }`
    );
  },
  getExpired: () => {
    const userId = getCurrentUserId();
    return apiRequest<any[]>(
      `/pantry-items/expired${userId ? `?userId=${userId}` : ""}`
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
      body: JSON.stringify({ ...data, createdBy: userId }),
    });
  },
  update: (id: string, data: any) =>
    apiRequest<any>(`/meal-plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/meal-plans/${id}`, {
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
      body: JSON.stringify({ ...data, createdBy: userId }),
    });
  },
  update: (id: string, data: any) =>
    apiRequest<any>(`/recipes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/recipes/${id}`, {
      method: "DELETE",
    }),
};

// Auth API
export const authApi = {
  register: (data: {
    username: string;
    password: string;
    fullName: string;
    email: string;
    role?: string;
  }) =>
    apiRequest<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    apiRequest<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
