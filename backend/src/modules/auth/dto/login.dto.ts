import { PickType } from '@nestjs/swagger';
import { BaseUserDto } from 'src/modules/users/dto/baseUser.dto';

export class LoginDto extends PickType(BaseUserDto, ['email', 'password'] as const) {}
