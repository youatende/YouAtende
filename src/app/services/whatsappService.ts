import api from "./api";

export type WhatsAppStatus = "starting" | "qr_code" | "connected" | "disconnected" | "error";

export interface WhatsAppSession {
  id: string;
  company_id: string;
  name: string;
  phone_number?: string;
  number?: string;
  status: WhatsAppStatus;
  qr_code?: string;
  jid?: string;
  token?: string;
  isDefault?: boolean;
  farewellMessage?: string;
  outOfHoursMessage?: string;
  integration?: string;
  created_at: string;
  updated_at: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const listConnections = async (): Promise<WhatsAppSession[]> => {
  const { data } = await api.get<WhatsAppSession[]>("/whatsapp-sessions", { headers: getAuthHeaders() });
  return Array.isArray(data) ? data : (data as any).sessions ?? [];
};

export const createConnection = async (payload: Partial<WhatsAppSession>): Promise<{ id: string }> => {
  const { data } = await api.post("/whatsapp-sessions", payload, { headers: getAuthHeaders() });
  return data;
};

export const updateConnection = async (id: string, payload: Partial<WhatsAppSession>): Promise<void> => {
  await api.put(`/whatsapp-sessions/${id}`, payload, { headers: getAuthHeaders() });
};

export const deleteConnection = async (id: string): Promise<void> => {
  await api.delete(`/whatsapp-sessions/${id}`, { headers: getAuthHeaders() });
};

export const getSessionQRCode = async (sessionId: string): Promise<{ qrcode: string }> => {
  const { data } = await api.get(`/whatsapp-sessions/${sessionId}/qrcode`, { headers: getAuthHeaders() });
  return data;
};

export const connectSession = (id: string): Promise<void> =>
  api.post(`/whatsapp-sessions/${id}/connect`, {}, { headers: getAuthHeaders() });

export const disconnectSession = (id: string): Promise<void> =>
  api.post(`/whatsapp-sessions/${id}/disconnect`, {}, { headers: getAuthHeaders() });
