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
  token: string;
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

  const requestBody = isEmail(identifier)
    ? { email: identifier, password }
    : { username: identifier, password };

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
        // fallback
      }
      throw new ApiError(response.status, errorMessage);
    }

    const data = await response.json();

    // Store JWT token in localStorage
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return {
      message: data.message,
      user: {
        id: data.user.id,
        username: data.user.username,
        fullName: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
      },
      token: data.token,
    };
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
        // fallback
      }
      throw new ApiError(response.status, errorMessage);
    }

    const data = await response.json();

    // Store JWT token in localStorage
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return {
      message: data.message,
      user: {
        id: data.user.id,
        username: data.user.username,
        fullName: data.user.fullName,
        email: data.user.email,
        role: data.user.role,
      },
      token: data.token,
    };
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
