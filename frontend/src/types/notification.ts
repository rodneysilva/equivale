export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  entityType?: string | null;
  entityId?: string | null;
  description?: string | null;
  read: boolean;
  createdAt: string;
}
