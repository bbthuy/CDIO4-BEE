import { BaseUserDto } from './baseUser.dto';
import { OmitType } from '@nestjs/swagger';

export class CreateUserDto extends OmitType(BaseUserDto, [] as const) {}
