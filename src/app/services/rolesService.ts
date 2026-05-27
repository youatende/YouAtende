import api from './api';

export interface Role {
  id: string;
  team_id: string;
  name: string;
  permissions: string[];
  created_at: string;
}

export const listRoles = (teamId?: string): Promise<Role[]> => {
  const params = teamId ? `?team_id=${teamId}` : '';
  return api.get(`/roles${params}`).then(r => r.data);
};

export const createRole = (data: { teamId: string; name: string; permissions: string[] }): Promise<{id: string}> =>
  api.post('/roles', data).then(r => r.data);

export const updateRole = (id: string, data: Partial<Role>): Promise<void> =>
  api.put(`/roles/${id}`, data);

export const deleteRole = (id: string): Promise<void> =>
  api.delete(`/roles/${id}`);
