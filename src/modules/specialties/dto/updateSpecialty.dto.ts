import { PartialType } from '@nestjs/swagger';
import { CreateSpecialtyDto } from './createSpecialty.dto';

export class UpdateSpecialtyDto extends PartialType(CreateSpecialtyDto) {}
