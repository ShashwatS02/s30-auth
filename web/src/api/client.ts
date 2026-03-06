import type {
  ApiErrorResponse,
  LoginResponse,
  MeResponse,
  RefreshResponse,
  RegisterResponse,
} from "../types/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function parseJson<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await parseJson<ApiErrorResponse>(res).catch(() => ({
      error: "Request failed",
    }));

    if (typeof errorBody.error === "string") {
      throw new Error(errorBody.error);
    }

    throw new Error(
      errorBody.error.message || errorBody.error.code || "Request failed"
    );
  }

  return parseJson<T>(res);
}

export async function register(input: { email: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return handleResponse<RegisterResponse>(res);
}

export async function login(input: { email: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  return handleResponse<LoginResponse>(res);
}

export async function getMe(accessToken: string) {
  const res = await fetch(`${API_BASE_URL}/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  return handleResponse<MeResponse>(res);
}

export async function refreshSession() {
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  return handleResponse<RefreshResponse>(res);
}

export async function logout() {
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }
}

export async function logoutAll(accessToken: string) {
  const res = await fetch(`${API_BASE_URL}/auth/logout-all`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Logout all failed");
  }
}
