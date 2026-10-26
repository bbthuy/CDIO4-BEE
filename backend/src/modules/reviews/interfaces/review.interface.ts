export interface IReview {
  id: number;
  rating: number;
  comment?: string;

  doctorId: number;
  userId: number;

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
