import { PickType } from '@nestjs/swagger';
import { BaseUserDto } from 'src/modules/users/dto/baseUser.dto';

export class RegisterDto extends PickType(BaseUserDto, ['firstName', 'lastName', 'email', 'password'] as const) {}
