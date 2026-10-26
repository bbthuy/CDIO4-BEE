import { PartialType } from '@nestjs/swagger';
import { CreateMedicalRecordDto } from './createMedicalRecord.dto';

export class UpdateMedicalRecordDto extends PartialType(CreateMedicalRecordDto) {}
