const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

// Helper function to determine if input is email or username
const isEmail = (input: string): boolean => {
  return input.includes("@");
};

export async function login(
  identifier: string,
  password: string
): Promise<AuthResponse> {
  const url = `${API_BASE_URL}/auth/login`;

  // Your backend expects email, so if username is provided, we need to handle it
  const requestBody = isEmail(identifier)
    ? { email: identifier, password }
    : { username: identifier, password };

  console.log("Login request:", { url, body: requestBody });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

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

    const data = await response.json();
    console.log("Login response:", data);

    return {
      message: data.message,
      user: {
        id: data.user.id,
        username: data.user.username,
        fullName: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      0,
      error instanceof Error ? error.message : "Network error"
    );
  }
}

export async function register(
  username: string,
  email: string,
  password: string,
  fullName: string
): Promise<AuthResponse> {
  const url = `${API_BASE_URL}/auth/register`;

  const requestBody = {
    username,
    email,
    password,
    fullName,
    role: "HOMEMAKER", // Default role
  };

  console.log("Register request:", { url, body: requestBody });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

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

    const data = await response.json();
    console.log("Register response:", data);

    return {
      message: data.message,
      user: {
        id: data.user.id,
        username: data.user.username,
        fullName: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
      },
    };
  } catch (error) {
    console.error("Register error:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      0,
      error instanceof Error ? error.message : "Network error"
    );
  }
}

export async function getCurrentUser(): Promise<User> {
  // Since your backend doesn't have JWT, we'll get user from localStorage
  const userData = localStorage.getItem("user");
  if (!userData) {
    throw new ApiError(401, "No user data found");
  }
  return JSON.parse(userData);
}

export async function logout(): Promise<void> {
  // Since there's no backend logout endpoint, just clear local storage
  localStorage.removeItem("user");
}
