import { HttpException, HttpStatus } from '@nestjs/common';
import { IResponseData } from 'src/base/baseController';

export class LockedException extends HttpException {
  constructor(data: IResponseData) {
    super(data, HttpStatus.LOCKED);
  }
}
