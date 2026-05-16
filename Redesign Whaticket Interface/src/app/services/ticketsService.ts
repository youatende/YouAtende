import api from "./api";

export type TicketStatus = "open" | "pending" | "closed";

export interface Queue {
  id: number;
  name: string;
  color: string;
}

export interface TicketContact {
  id: number;
  name: string;
  number: string;
  profilePicUrl?: string;
  isGroup?: boolean;
}

export interface Ticket {
  id: number;
  status: TicketStatus;
  lastMessage?: string;
  unreadMessages: number;
  updatedAt: string;
  createdAt: string;
  contact: TicketContact;
  user?: { id: number; name: string };
  queue?: Queue;
  whatsapp?: { id: number; name: string };
}

export interface TicketsResponse {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

export interface TicketFilters {
  status?: TicketStatus | "all";
  searchParam?: string;
  pageNumber?: number;
  queueId?: number;
  userId?: number;
}

/** List tickets with optional filters. */
export async function listTickets(filters: TicketFilters = {}): Promise<TicketsResponse> {
  const { data } = await api.get<TicketsResponse>("/tickets", { params: filters });
  return data;
}

/** Get a single ticket by ID. */
export async function getTicket(id: number): Promise<Ticket> {
  const { data } = await api.get<Ticket>(`/tickets/${id}`);
  return data;
}

/** Create a new ticket. */
export async function createTicket(payload: {
  contactId: number;
  queueId?: number;
  status?: TicketStatus;
  whatsappId?: number;
}): Promise<Ticket> {
  const { data } = await api.post<Ticket>("/tickets", payload);
  return data;
}

/** Update ticket status or assignment. */
export async function updateTicket(
  id: number,
  payload: Partial<{ status: TicketStatus; userId: number; queueId: number }>
): Promise<Ticket> {
  const { data } = await api.put<Ticket>(`/tickets/${id}`, payload);
  return data;
}

/** Delete a ticket. */
export async function deleteTicket(id: number): Promise<void> {
  await api.delete(`/tickets/${id}`);
}

/** List queues. */
export async function listQueues(): Promise<Queue[]> {
  const { data } = await api.get<Queue[]>("/queue");
  return data;
}
