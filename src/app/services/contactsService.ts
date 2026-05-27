import api from "./api";

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  lastMessage?: string;
  lastMessageAt?: string;
  ticketStatus?: "open" | "closed";
  ticketId?: string;
  createdAt: string;
}

export interface ContactListResponse {
  contacts: Contact[];
}

export interface Message {
  id: string;
  contactId: string;
  ticketId: string;
  fromMe: boolean;
  body: string;
  timestamp: string;
  ack: string;
  isSystem?: boolean;
}

/** List all contacts enriched with lastMessage and ticketStatus */
export async function listContacts(): Promise<Contact[]> {
  const { data } = await api.get<Contact[]>("/contacts");
  return Array.isArray(data) ? data : (data as any).contacts ?? [];
}

/** Get messages timeline for a contact (includes ticket events) */
export async function getContactMessages(contactId: string): Promise<Message[]> {
  const { data } = await api.get<Message[]>(`/contacts/${contactId}/messages`);
  return Array.isArray(data) ? data : (data as any).messages ?? [];
}

/** Create a new contact */
export async function createContact(payload: {
  name: string;
  phoneNumber: string;
}): Promise<Contact> {
  const { data } = await api.post("/contacts", payload);
  return data;
}

/** Update an existing contact */
export async function updateContact(
  id: string,
  payload: { name?: string; phoneNumber?: string }
): Promise<Contact> {
  const { data } = await api.put(`/contacts/${id}`, payload);
  return data;
}

/** Delete a contact */
export async function deleteContact(id: string): Promise<void> {
  await api.delete(`/contacts/${id}`);
}

/** Open a ticket for a contact (assigns to current user) */
export async function openTicket(contactId: string): Promise<{ ticketId: string }> {
  const { data } = await api.post(`/contacts/${contactId}/open-ticket`);
  return data;
}

/** Close the open ticket for a contact */
export async function closeTicket(contactId: string): Promise<void> {
  await api.post(`/contacts/${contactId}/close-ticket`);
}
