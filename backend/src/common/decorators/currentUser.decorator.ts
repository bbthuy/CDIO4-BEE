import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getClient } from '../utils/getClient';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => getClient(ctx)?.user);
