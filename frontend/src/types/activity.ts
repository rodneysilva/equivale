export interface UserActivity {
  id: string;
  type: string;
  entityType?: string;
  entityId?: string;
  entityTitle?: string;
  description?: string;
  createdAt: string;
}
