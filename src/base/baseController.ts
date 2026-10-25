import { HttpException, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage.constant';

interface IMessage {
  message: string;
  status: number | HttpStatus;
  code: string;
}

export interface IResponseData {
  message: IMessage;
  data?: any;
}

export class BaseController {
  // Success response
  responseSuccess(@Res() res: Response, data: IResponseData) {
    return res.status(HttpStatus.OK).json({
      ...data.message,
      data: data.data || null
    });
  }

  responseCallbackSuccess(@Res() res: Response, data: IResponseData) {
    return res.status(HttpStatus.OK).json({
      ...data.message,
      data: data.data || null,
      merNotifyStatus: 1
    });
  }

  responseCreated(@Res() res: Response, data: IResponseData) {
    if ('data' in data && 'message' in data) {
      return res.status(HttpStatus.CREATED).json({
        ...data.message,
        data: data.data || null
      });
    }

    return res.status(HttpStatus.CREATED).json(data || null);
  }

  // Error responses
  responseBadRequest(@Res() res: Response, data: IResponseData) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      ...data.message,
      data: data.data || null
    });
  }

  responseNotFound(@Res() res: Response, data: IResponseData) {
    return res.status(HttpStatus.NOT_FOUND).json({
      ...data.message,
      data: data.data || null
    });
  }

  responseInternalServerError(@Res() res: Response, data: IResponseData) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ...data.message,
      data: data.data || null
    });
  }

  responseError(@Res() res: Response, error: unknown, data: IResponseData) {
    if (error instanceof HttpException) {
      return res.status(error.getStatus()).json({
        ...data.message,
        data: data.data || null
      });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      ...ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR,
      data: data.data || null
    });
  }
}
