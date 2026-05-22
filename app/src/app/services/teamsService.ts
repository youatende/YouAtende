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
}

export const listTeams = (): Promise<Team[]> => api.get('/teams').then(r => r.data);

export const createTeam = (name: string): Promise<{id: string}> =>
  api.post('/teams', { name }).then(r => r.data);

export const updateTeam = (id: string, name: string): Promise<void> =>
  api.put(`/teams/${id}`, { name });

export const deleteTeam = (id: string): Promise<void> =>
  api.delete(`/teams/${id}`);

export const getTeamMembers = (teamId: string): Promise<TeamMember[]> =>
  api.get(`/teams/${teamId}/members`).then(r => r.data);

export const addTeamMember = (teamId: string, userId: string): Promise<void> =>
  api.post(`/teams/${teamId}/members`, { userId });

export const removeTeamMember = (teamId: string, userId: string): Promise<void> =>
  api.delete(`/teams/${teamId}/members/${userId}`);
