import api from "./api";

export type WhatsAppStatus = "CONNECTED" | "DISCONNECTED" | "PAIRING" | "TIMEOUT" | "qrcode" | "OPENING";

export interface WhatsApp {
  id: number;
  name: string;
  number?: string;
  status: WhatsAppStatus;
  qrcode?: string;
  retries?: number;
  isDefault?: boolean;
  farewellMessage?: string;
  greetingMessage?: string;
  outOfHoursMessage?: string;
  token?: string;
  type?: "baileys" | "meta" | "official";
  updatedAt?: string;
}

export interface WhatsAppListResponse {
  whatsapps: WhatsApp[];
}

/** List all WhatsApp connections. */
export async function listConnections(): Promise<WhatsApp[]> {
  const { data } = await api.get<WhatsApp[] | WhatsAppListResponse>("/whatsapp");
  return Array.isArray(data) ? data : data.whatsapps ?? [];
}

/** Get a single connection and its QR code. */
export async function getConnection(id: number): Promise<WhatsApp> {
  const { data } = await api.get<WhatsApp>(`/whatsapp/${id}`);
  return data;
}

/** Create a new WhatsApp connection. */
export async function createConnection(payload: Partial<WhatsApp>): Promise<WhatsApp> {
  const { data } = await api.post<WhatsApp>("/whatsapp", payload);
  return data;
}

/** Update an existing connection. */
export async function updateConnection(id: number, payload: Partial<WhatsApp>): Promise<WhatsApp> {
  const { data } = await api.put<WhatsApp>(`/whatsapp/${id}`, payload);
  return data;
}

/** Delete a connection. */
export async function deleteConnection(id: number): Promise<void> {
  await api.delete(`/whatsapp/${id}`);
}

/** Force a session restart. */
export async function restartConnection(id: number): Promise<void> {
  await api.post(`/whatsapp/${id}/restart`);
}
