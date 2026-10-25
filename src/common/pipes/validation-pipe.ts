import { Injectable, PipeTransform, ArgumentMetadata, HttpException, HttpStatus } from '@nestjs/common';
import { BadRequestException } from 'src/common/exceptions/badRequest.exception';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ERROR_MESSAGES } from '../constants/errorMessage.constant';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException({ message: { message: 'No request payload provided', status: 400, code: 'VALIDATION_ERROR' } });
    }

    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);

    const errors = await validate(object);

    if (errors.length > 0) {
      throw new HttpException({ message: ERROR_MESSAGES.common.BAD_REQUEST, errors: errors }, HttpStatus.BAD_REQUEST);
    }

    return value;
  }

  /**
   * Build Errors to send it to the frontend
   * @param errors
   * @returns
   */
  private formatErrors(errors) {
    console.log(errors);
    const result = {};

    errors.forEach((el) => {
      const prop = el.property;

      if (el?.children) {
        this.formatErrors(el?.children);
      } else {
        Object.entries(el?.constraints).forEach((constraint) => {
          result[prop] = constraint[1];
        });
      }
    });

    return result;
  }

  /**
   * To Validate
   * @param metatype
   * @returns
   */
  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find((type) => metatype === type);
  }
}
