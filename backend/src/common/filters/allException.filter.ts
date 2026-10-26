import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { ERROR_MESSAGES } from '../constants/errorMessage.constant';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger: Logger = new Logger('AllExceptionsFilter');

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.status || HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception?.response) {
      if (exception.response.errors?.length) {
        exception.response.message = Object.values(exception.response.errors[0].constraints)[0].toString().toUpperCase().replace(/ /g, '_');
        exception.response.code = Object.values(exception.response.errors[0].constraints)[0].toString().toUpperCase().replace(/ /g, '_');
        exception.response.data = null;
        delete exception.response.errors;
      } else {
        if (typeof exception.response.message === 'object') {
          exception.response.message = exception.response.message[0]
            ? exception.response.message[0].toString().toUpperCase().replace(/ /g, '_')
            : exception.response.message.message;
          exception.response.code = exception.response.message;
          exception.response.data = null;
        } else {
          exception.response.message = exception.response.message.toString().toUpperCase().replace(/ /g, '_');
          exception.response.data = null;
          exception.response.code = exception.response.message.toString().toUpperCase().replace(/ /g, '_');
        }
      }
      delete exception.response.statusCode;
      delete exception.response.error;
      exception.response.status = status;
    } else {
      const errorResponse = {
        data: null,
        message: exception.message?.message || ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR.message,
        code: exception.message?.code || ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR.code,
        status: exception.message?.status || ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR.status
      };

      this.logger.warn(`Exception: ${JSON.stringify(errorResponse)}`);

      response.status(status).json(errorResponse);

      return;
    }

    // Logging stack trace as standard output
    this.logger.warn(`Exception: ${JSON.stringify(exception?.response || exception)}`);

    // Sends formatted response to client
    response.status(status).json(exception?.response ?? exception);
  }
}
