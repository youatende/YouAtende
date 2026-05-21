import api from "./api";

export type WhatsAppStatus = "starting" | "qr_code" | "connected" | "disconnected" | "error";

export interface WhatsAppSession {
  id: string;
  company_id: string;
  name: string;
  status: WhatsAppStatus;
  qr_code?: string;
  jid?: string;
  created_at: string;
  updated_at: string;
}

// Aliases para compatibilidade com Configuracoes.tsx
export const listConnections = async (): Promise<WhatsAppSession[]> => {
  const { data } = await api.get<WhatsAppSession[]>("/whatsapp-sessions");
  return Array.isArray(data) ? data : (data as any).sessions ?? [];
};

export const createConnection = async (name: string): Promise<{ id: string }> => {
  const { data } = await api.post("/whatsapp-sessions", { name });
  return data;
};

export const updateConnection = async (id: string, data: Record<string, any>): Promise<any> => {
  // Ainda não implementado no backend – placeholder
  console.warn("updateConnection not implemented");
  return {};
};

export const deleteConnection = async (id: string): Promise<void> => {
  await api.delete(`/whatsapp-sessions/${id}`);
};

export const restartConnection = async (id: string): Promise<void> => {
  // Ainda não implementado – placeholder
  console.warn("restartConnection not implemented");
};

export const getSessionQRCode = async (sessionId: string): Promise<{ qrcode: string }> => {
  const { data } = await api.get(`/whatsapp-sessions/${sessionId}/qrcode`);
  return data;
};
