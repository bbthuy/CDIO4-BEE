import { PartialType } from '@nestjs/swagger';
import { CreateDoctorDto } from './createDoctor.dto';
import { UserRole } from 'src/modules/users/interfaces/user.interface';

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
  role?: UserRole;
}
