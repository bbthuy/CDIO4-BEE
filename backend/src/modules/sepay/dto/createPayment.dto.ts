import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  orderCode: string;

  @IsNumber()
  @Min(1000)
  amount: number;
}
