import api from './api';

export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  role: string;
  roleId?: string;
  avatarUrl?: string;
  schedule?: string;
  createdAt: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const listUsers = (): Promise<User[]> =>
  api.get('/users', { headers: getAuthHeaders() }).then(r => r.data);

export const createUser = (data: {
  email: string;
  password: string;
  username: string;
  name: string;
  role: string;
  teams?: { teamId: string; roleId: string }[];
  teamId?: string;
  roleId?: string;
  schedule?: string;
}): Promise<{ id: string }> =>
  api.post('/users', data, { headers: getAuthHeaders() }).then(r => r.data);

export const updateUser = (id: string, data: Partial<{
  name: string;
  username: string;
  email: string;
  role: string;
  schedule: string;
}>): Promise<void> =>
  api.put(`/users/${id}`, data, { headers: getAuthHeaders() });

export const resetUserPassword = (userId: string, password: string): Promise<void> =>
  api.put(`/users/${userId}/reset-password`, { password }, { headers: getAuthHeaders() });
