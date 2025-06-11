import { ApiError } from "./api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Determine if input is email or username
    const isEmail = credentials.emailOrUsername.includes("@");

    const requestBody = {
      password: credentials.password,
      ...(isEmail
        ? { email: credentials.emailOrUsername }
        : { username: credentials.emailOrUsername }),
    };

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || "Failed to login. Please check your credentials."
      );
    }

    return response.json();
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: data.email, // Use email as username or adjust based on your backend
        password: data.password,
        fullName: data.name,
        email: data.email,
        role: "USER", // Set default role or make it configurable
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || "Failed to register. Please try again."
      );
    }

    return response.json();
  },

  getCurrentUser: async (): Promise<User> => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new ApiError(401, "Not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, "Failed to get user data");
    }

    return response.json();
  },

  logout: (): void => {
    localStorage.removeItem("auth_token");
  },
};
