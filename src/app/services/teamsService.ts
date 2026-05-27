import api from './api';

export interface Team {
  id: string;
  name: string;
  company_id: string;
  created_at: string;
}

export interface TeamMember {
  userId: string;
  email?: string;
  name?: string;
  roleId?: string;   // adicionado
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const listTeams = (): Promise<Team[]> =>
  api.get('/teams', { headers: getAuthHeaders() }).then(r => r.data);

export const createTeam = (name: string): Promise<{id: string}> =>
  api.post('/teams', { name }, { headers: getAuthHeaders() }).then(r => r.data);

export const updateTeam = (id: string, name: string): Promise<void> =>
  api.put(`/teams/${id}`, { name }, { headers: getAuthHeaders() });

export const deleteTeam = (id: string): Promise<void> =>
  api.delete(`/teams/${id}`, { headers: getAuthHeaders() });

export const getTeamMembers = (teamId: string): Promise<TeamMember[]> =>
  api.get(`/teams/${teamId}/members`, { headers: getAuthHeaders() }).then(r => r.data);

export const addTeamMember = (teamId: string, userId: string, roleId?: string): Promise<void> =>
  api.post(`/teams/${teamId}/members`, { userId, roleId }, { headers: getAuthHeaders() });

export const removeTeamMember = (teamId: string, userId: string): Promise<void> =>
  api.delete(`/teams/${teamId}/members/${userId}`, { headers: getAuthHeaders() });
