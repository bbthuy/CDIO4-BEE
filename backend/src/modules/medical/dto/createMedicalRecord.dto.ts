import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer'; // 🔥 Quan trọng: Để validate nested object

// 1. Định nghĩa Class con cho từng viên thuốc (Có validation đàng hoàng)
export class MedicineItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  quantity: any;

  @IsString()
  @IsOptional()
  unit: string;

  @IsString()
  @IsOptional()
  dosage: string;
}

// 2. DTO chính
export class CreateMedicalRecordDto {
  @IsNumber()
  @IsNotEmpty()
  bookingId: number;

  @IsString()
  @IsOptional()
  subjective: string;

  @IsString()
  @IsOptional()
  objective: string;

  @IsString()
  @IsNotEmpty()
  assessment: string;

  @IsString()
  @IsOptional()
  plan: string;

  @IsString()
  @IsOptional()
  diagnosis: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MedicineItemDto)
  medicines?: MedicineItemDto[];
}
