import api from "./api";

export interface Message {
  id: string;
  body: string;
  fromMe: boolean;
  read: boolean;
  mediaType?: "image" | "video" | "audio" | "document" | "sticker" | "";
  mediaUrl?: string;
  timestamp: number;
  ticketId: number;
  contact?: { id: number; name: string; number: string; profilePicUrl?: string };
  ack?: number; // 0=pending 1=sent 2=received 3=read
}

export interface MessagesResponse {
  messages: Message[];
  ticket: { id: number; status: string; contact: { id: number; name: string; number: string } };
  count: number;
  hasMore?: boolean;
}

/** List messages for a ticket. */
export async function listMessages(
  ticketId: number,
  pageNumber: number = 1
): Promise<MessagesResponse> {
  const { data } = await api.get<MessagesResponse>(`/messages/${ticketId}`, {
    params: { pageNumber },
  });
  return data;
}

/** Send a message. */
export async function sendMessage(payload: {
  ticketId: number;
  body: string;
  fromMe?: boolean;
  quotedMsg?: string;
  mediaBase64?: string;
  mediaName?: string;
}): Promise<Message> {
  const { data } = await api.post<Message>("/messages", payload);
  return data;
}

/** Delete a message. */
export async function deleteMessage(messageId: string): Promise<void> {
  await api.delete(`/messages/${messageId}`);
}
