export interface INotification {
  id: number;
  message: string;
  receiverId: number;
  createdAt: Date;
  deletedAt?: Date | null;
}
