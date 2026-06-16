import { api } from './api';

export interface ChatMessage {
  id: string;
  transactionId: string;
  senderId: string;
  senderName?: string | null;
  senderAvatarUrl?: string | null;
  content: string;
  createdAt: string;
}

interface BackendChatMessageDto {
  id: string;
  transactionId: string;
  senderId: string;
  senderName?: string | null;
  senderAvatarUrl?: string | null;
  content: string;
  createdAt: string;
}

function mapMessage(d: BackendChatMessageDto): ChatMessage {
  return {
    id: d.id,
    transactionId: d.transactionId,
    senderId: d.senderId,
    senderName: d.senderName,
    senderAvatarUrl: d.senderAvatarUrl,
    content: d.content,
    createdAt: d.createdAt,
  };
}

export const chatService = {
  async getMessages(transactionId: string): Promise<ChatMessage[]> {
    const raw = await api.get<BackendChatMessageDto[]>(`/transactions/${transactionId}/chat`);
    return raw.map(mapMessage);
  },

  async sendMessage(transactionId: string, content: string): Promise<ChatMessage> {
    const raw = await api.post<BackendChatMessageDto>(
      `/transactions/${transactionId}/chat`,
      { content },
    );
    return mapMessage(raw);
  },
};
