import api from "./api";

export type CampaignStatus = "inactive" | "scheduled" | "processing" | "paused" | "canceled" | "finished";

export interface CampaignShipping {
  id: number;
  contactId: number;
  deliveredAt?: string;
  confirmationAt?: string;
}

export interface Campaign {
  id: number;
  name: string;
  status: CampaignStatus;
  message1?: string;
  message2?: string;
  message3?: string;
  confirmation?: boolean;
  whatsappId?: number;
  scheduledAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  contactListId?: number;
  contactList?: { id: number; name: string; contactsCount?: number };
  whatsapp?: { id: number; name: string };
  shipments?: CampaignShipping[];
}

export interface CampaignsResponse {
  records: Campaign[];
  count: number;
  hasMore: boolean;
}

/** List campaigns. */
export async function listCampaigns(pageNumber: number = 1): Promise<CampaignsResponse> {
  const { data } = await api.get<CampaignsResponse>("/campaigns", { params: { pageNumber } });
  return data;
}

/** Get a single campaign. */
export async function getCampaign(id: number): Promise<Campaign> {
  const { data } = await api.get<Campaign>(`/campaigns/${id}`);
  return data;
}

/** Create a new campaign. */
export async function createCampaign(payload: Partial<Campaign>): Promise<Campaign> {
  const { data } = await api.post<Campaign>("/campaigns", payload);
  return data;
}

/** Update a campaign. */
export async function updateCampaign(id: number, payload: Partial<Campaign>): Promise<Campaign> {
  const { data } = await api.put<Campaign>(`/campaigns/${id}`, payload);
  return data;
}

/** Delete a campaign. */
export async function deleteCampaign(id: number): Promise<void> {
  await api.delete(`/campaigns/${id}`);
}

/** Start a campaign. */
export async function startCampaign(id: number): Promise<void> {
  await api.post(`/campaigns/${id}/start`);
}

/** Pause a campaign. */
export async function pauseCampaign(id: number): Promise<void> {
  await api.post(`/campaigns/${id}/pause`);
}
