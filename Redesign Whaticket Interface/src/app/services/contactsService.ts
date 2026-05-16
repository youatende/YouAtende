import api from "./api";

export interface ContactExtraInfo {
  id?: number;
  name: string;
  value: string;
}

export interface Contact {
  id: number;
  name: string;
  number: string;
  email?: string;
  profilePicUrl?: string;
  isGroup?: boolean;
  isUser?: boolean;
  createdAt?: string;
  updatedAt?: string;
  extraInfo?: ContactExtraInfo[];
  tickets?: Array<{ id: number; status: string; createdAt: string }>;
}

export interface ContactsResponse {
  contacts: Contact[];
  count: number;
  hasMore: boolean;
}

/** List contacts with optional search and pagination. */
export async function listContacts(
  searchParam: string = "",
  pageNumber: number = 1
): Promise<ContactsResponse> {
  const { data } = await api.get<ContactsResponse>("/contacts", {
    params: { searchParam, pageNumber },
  });
  return data;
}

/** Get a single contact by ID. */
export async function getContact(id: number): Promise<Contact> {
  const { data } = await api.get<Contact>(`/contacts/${id}`);
  return data;
}

/** Create a new contact. */
export async function createContact(payload: {
  name: string;
  number: string;
  email?: string;
  extraInfo?: ContactExtraInfo[];
}): Promise<Contact> {
  const { data } = await api.post<Contact>("/contacts", payload);
  return data;
}

/** Update an existing contact. */
export async function updateContact(
  id: number,
  payload: Partial<{ name: string; number: string; email: string; extraInfo: ContactExtraInfo[] }>
): Promise<Contact> {
  const { data } = await api.put<Contact>(`/contacts/${id}`, payload);
  return data;
}

/** Delete a contact. */
export async function deleteContact(id: number): Promise<void> {
  await api.delete(`/contacts/${id}`);
}

/** Check if a WhatsApp number is valid. */
export async function checkNumber(number: string, whatsappId: number): Promise<{ exists: boolean }> {
  const { data } = await api.post<{ exists: boolean }>("/contacts/check", { number, whatsappId });
  return data;
}
