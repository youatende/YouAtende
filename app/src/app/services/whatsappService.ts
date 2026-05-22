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
  number?: string;
  token?: string;
  isDefault?: boolean;
  farewellMessage?: string;
  outOfHoursMessage?: string;
}

/** Tipo antigo usado apenas para compatibilidade interna */
export interface WhatsApp {
  id: string;
  name: string;
  number: string;
  status: string;
  updatedAt: string;
  isDefault: boolean;
  token: string;
  farewellMessage: string;
  outOfHoursMessage: string;
}

export const listConnections = async (): Promise<WhatsAppSession[]> => {
  const { data } = await api.get<WhatsAppSession[]>("/whatsapp-sessions");
  return Array.isArray(data) ? data : (data as any).sessions ?? [];
};

export const createConnection = async (name: string): Promise<{ id: string }> => {
  const { data } = await api.post("/whatsapp-sessions", { name });
  return data;
};

export const updateConnection = async (id: string, payload: Partial<WhatsAppSession>): Promise<any> => {
  // futura implementação
  return {};
};

export const deleteConnection = async (id: string): Promise<void> => {
  await api.delete(`/whatsapp-sessions/${id}`);
};

export const restartConnection = async (id: string): Promise<void> => {
  // placeholder
};
