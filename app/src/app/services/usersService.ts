import api from './api';

export interface User {
  id: string;
  email: string;
  companyId: string;
  role: string;
  createdAt: string;
}

export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users');
  return Array.isArray(data) ? data : (data as any).users ?? [];
}

export async function createUser(payload: {
  email: string;
  password: string;
  name: string;
  role: string;
}): Promise<{ id: string }> {
  const { data } = await api.post('/users', payload);
  return data;
}
