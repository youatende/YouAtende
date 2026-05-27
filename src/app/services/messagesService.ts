import api from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const sendMessage = (payload: { contactId: string; body: string }) =>
  api.post('/messages', payload, { headers: getAuthHeaders() });
