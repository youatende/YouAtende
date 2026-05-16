import api, { setToken, setRefreshToken, clearTokens, getBackendUrl } from "./api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  profile: "admin" | "user";
  companyId?: number;
  company?: { id: number; name: string; plan?: string };
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

/** Login with email + password. Throws on failure. */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  setToken(data.token);
  if (data.refreshToken) setRefreshToken(data.refreshToken);
  return data;
}

/** Fetch the current authenticated user. */
export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/auth/me");
  return data;
}

/** Logout server-side and clear tokens. */
export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    /* ignore – clear locally anyway */
  }
  clearTokens();
}
