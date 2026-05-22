import api, { setToken, setRefreshToken, clearTokens } from './api';

export interface User {
  id: string;
  email: string;
  companyId: string;
  role: string;
  createdAt: string;
  name?: string;          // ainda não preenchido pelo backend, mas existirá futuramente
  company?: {              // idem
    name: string;
  };
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  setToken(data.token);
  setRefreshToken(data.refreshToken);
  return data;
}

export async function refreshToken(): Promise<AuthResponse> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');
  const { data } = await api.post<AuthResponse>('/auth/refresh_token', { refreshToken });
  setToken(data.token);
  setRefreshToken(data.refreshToken);
  return data;
}

export async function getProfile(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try { await api.post('/auth/logout', { refreshToken }); } catch {}
  }
  clearTokens();
}
