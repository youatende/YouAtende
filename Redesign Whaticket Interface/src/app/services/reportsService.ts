import api from "./api";

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  pendingTickets: number;
  closedTickets: number;
  averageFirstResponseTime?: number;
  averageResponseTime?: number;
  satisfaction?: number;
  newContacts?: number;
}

export interface UserReport {
  userId: number;
  userName: string;
  openTickets: number;
  closedTickets: number;
  avgResponseTime?: number;
}

export interface TagReport {
  tagId: number;
  tagName: string;
  color: string;
  count: number;
}

export interface DailyTicketStat {
  date: string;
  count: number;
  open: number;
  closed: number;
  pending: number;
}

/** Get dashboard summary stats. */
export async function getDashboardStats(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("/reports/dashboard", { params });
  return data;
}

/** Get per-user report. */
export async function getUsersReport(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<UserReport[]> {
  const { data } = await api.get<UserReport[]>("/reports/users", { params });
  return data;
}

/** Get tickets grouped by day. */
export async function getDailyStats(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<DailyTicketStat[]> {
  const { data } = await api.get<DailyTicketStat[]>("/reports/tickets-per-day", { params });
  return data;
}

/** Get tag usage report. */
export async function getTagsReport(): Promise<TagReport[]> {
  const { data } = await api.get<TagReport[]>("/tags");
  return data;
}
