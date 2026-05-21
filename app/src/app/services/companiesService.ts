import api from './api';

export interface Company {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  adminEmail?: string;
}

export async function listCompanies(): Promise<Company[]> {
  const { data } = await api.get<Company[]>('/companies');
  return Array.isArray(data) ? data : (data as any).companies ?? [];
}

export async function createCompany(payload: {
  companyName: string;
  adminEmail: string;
  adminPassword: string;
}): Promise<{ companyId: string; userId: string }> {
  const { data } = await api.post('/companies', payload);
  return data;
}

export async function updateCompany(id: string, payload: { name?: string; status?: string }): Promise<void> {
  await api.put(`/companies/${id}`, payload);
}

export async function deleteCompany(id: string): Promise<void> {
  await api.delete(`/companies/${id}`);
}
