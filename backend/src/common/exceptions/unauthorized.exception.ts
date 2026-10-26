import { HttpException, HttpStatus } from '@nestjs/common';
import { IResponseData } from 'src/base/baseController';

export class UnauthorizedException extends HttpException {
  constructor(data: IResponseData) {
    super(data, HttpStatus.UNAUTHORIZED);
  }
}
