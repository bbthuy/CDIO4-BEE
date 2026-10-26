import { HttpException, HttpStatus } from '@nestjs/common';
import { IResponseData } from 'src/base/baseController';

export class ForbiddenException extends HttpException {
  constructor(data: IResponseData) {
    super(data, HttpStatus.FORBIDDEN);
  }
}
