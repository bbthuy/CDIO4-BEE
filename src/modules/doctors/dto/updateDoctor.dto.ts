import { PartialType } from '@nestjs/swagger';
import { CreateDoctorDto } from './createDoctor.dto';

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {}
