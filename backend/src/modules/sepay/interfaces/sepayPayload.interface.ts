export interface SepayPayload {
  transaction_id: string;
  order_code?: string;
  amount: number;
  account_number?: string;
  description?: string;
  transfer_time?: string;
}
