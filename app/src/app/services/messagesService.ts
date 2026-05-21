import api from "./api";

export interface SendMessagePayload {
  contactId: string;
  body: string;
}

export interface SendMessageResponse {
  status: string;
  messageId: string;
}

/** Send a text message to a contact */
export async function sendMessage(
  payload: SendMessagePayload
): Promise<SendMessageResponse> {
  const { data } = await api.post<SendMessageResponse>("/messages", payload);
  return data;
}
