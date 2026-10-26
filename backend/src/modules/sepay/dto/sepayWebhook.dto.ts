import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SepayWebhookDto {
  // Log trả về 'id', không phải 'transaction_id'
  @IsNumber()
  @IsOptional()
  id: number;

  @IsString()
  @IsOptional()
  gateway: string;

  // Log trả về 'transactionDate', không phải 'transfer_time'
  @IsString()
  @IsOptional()
  transactionDate: string;

  // Log trả về 'accountNumber', không phải 'account_number'
  @IsString()
  @IsOptional()
  accountNumber: string;

  @IsString()
  @IsOptional()
  content: string;

  // ✅ Cái này bạn sửa ĐÚNG rồi
  @IsNumber()
  @IsOptional()
  transferAmount: number;

  @IsString()
  @IsOptional()
  description: string;
}
