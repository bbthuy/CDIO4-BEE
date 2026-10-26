import { HttpException, HttpStatus } from '@nestjs/common';
import { IResponseData } from 'src/base/baseController';

export class BadRequestException extends HttpException {
  constructor(data: IResponseData) {
    super(data, HttpStatus.BAD_REQUEST);
  }
}
