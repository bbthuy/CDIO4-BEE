import { HttpException, HttpStatus } from '@nestjs/common';
import { IResponseData } from 'src/base/baseController';

export class NotFoundException extends HttpException {
  constructor(data: IResponseData) {
    super(data, HttpStatus.NOT_FOUND);
  }
}
