import { HttpStatus } from '@nestjs/common';

export const ERROR_MESSAGES = {
  common: {
    UNAUTHORIZED_ACCESS_DENIED: {
      message: 'UNAUTHORIZED_ACCESS_DENIED',
      status: HttpStatus.UNAUTHORIZED,
      code: 'UNAUTHORIZED_ACCESS_DENIED'
    },
    FORBIDDEN: {
      message: 'FORBIDDEN',
      status: HttpStatus.FORBIDDEN,
      code: 'FORBIDDEN'
    },
    BAD_REQUEST: {
      message: 'BAD_REQUEST',
      status: HttpStatus.BAD_REQUEST,
      code: 'BAD_REQUEST'
    },
    NOT_FOUND: {
      message: 'NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
      code: 'NOT_FOUND'
    },
    INTERNAL_SERVER_ERROR: {
      message: 'INTERNAL_SERVER_ERROR',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR'
    },
    SUCCESSFUL: {
      message: 'SUCCESSFUL',
      status: HttpStatus.OK,
      code: 'SUCCESSFUL'
    },
    PERMISSION_DENIED: {
      message: 'PERMISSION_DENIED',
      status: HttpStatus.FORBIDDEN,
      code: 'PERMISSION_DENIED'
    },
    CREATED: {
      message: 'SUCCESSFUL',
      status: HttpStatus.CREATED,
      code: 'CREATED'
    },
    INVALID_HASHCODE: {
      message: 'INVALID_HASHCODE',
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_HASHCODE'
    }
  },
  auth: {
    // error messages
    INVALID_CREDENTIALS: {
      message: 'INVALID_CREDENTIALS',
      status: HttpStatus.UNAUTHORIZED,
      code: 'INVALID_CREDENTIALS'
    },
    USER_NOT_ACTIVE: {
      message: 'USER_NOT_ACTIVE',
      status: HttpStatus.UNAUTHORIZED,
      code: 'USER_NOT_ACTIVE'
    },
    INVALID_TOKEN: {
      message: 'INVALID_TOKEN',
      status: HttpStatus.UNAUTHORIZED,
      code: 'INVALID_TOKEN'
    },
    TOKEN_EXPIRED: {
      message: 'TOKEN_EXPIRED',
      status: HttpStatus.UNAUTHORIZED,
      code: 'TOKEN_EXPIRED'
    },
    INVALID_TOKEN_TYPE: {
      message: 'INVALID_TOKEN_TYPE',
      status: HttpStatus.UNAUTHORIZED,
      code: 'INVALID_TOKEN_TYPE'
    },
    TOKEN_REVOKED: {
      message: 'TOKEN_REVOKED',
      status: HttpStatus.UNAUTHORIZED,
      code: 'TOKEN_REVOKED'
    },
    INVALID_REFRESH_TOKEN: {
      message: 'INVALID_REFRESH_TOKEN',
      status: HttpStatus.UNAUTHORIZED,
      code: 'INVALID_REFRESH_TOKEN'
    },
    AUTHORIZATION_HEADER_REQUIRED: {
      message: 'AUTHORIZATION_HEADER_REQUIRED',
      status: HttpStatus.UNAUTHORIZED,
      code: 'AUTHORIZATION_HEADER_REQUIRED'
    },
    INVALID_AUTHORIZATION_FORMAT: {
      message: 'INVALID_AUTHORIZATION_FORMAT',
      status: HttpStatus.UNAUTHORIZED,
      code: 'INVALID_AUTHORIZATION_FORMAT'
    },
    PASSWORD_MISMATCH: {
      message: 'PASSWORD_MISMATCH',
      status: HttpStatus.BAD_REQUEST,
      code: 'PASSWORD_MISMATCH'
    },
    EMAIL_ALREADY_EXISTS: {
      message: 'EMAIL_ALREADY_EXISTS',
      status: HttpStatus.BAD_REQUEST,
      code: 'EMAIL_ALREADY_EXISTS'
    },
    REGISTRATION_FAILED: {
      message: 'REGISTRATION_FAILED',
      status: HttpStatus.BAD_REQUEST,
      code: 'REGISTRATION_FAILED'
    },
    INVALID_VERIFICATION_CODE: {
      message: 'INVALID_VERIFICATION_CODE',
      status: HttpStatus.UNAUTHORIZED,
      code: 'INVALID_VERIFICATION_CODE'
    },
    VERIFICATION_CODE_EXPIRED: {
      message: 'VERIFICATION_CODE_EXPIRED',
      status: HttpStatus.BAD_REQUEST,
      code: 'VERIFICATION_CODE_EXPIRED'
    },
    TOO_MANY_ATTEMPTS: {
      message: 'TOO_MANY_ATTEMPTS',
      status: HttpStatus.TOO_MANY_REQUESTS,
      code: 'TOO_MANY_ATTEMPTS'
    },
    INVALID_RESET_TOKEN: {
      message: 'INVALID_RESET_TOKEN',
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_RESET_TOKEN'
    },
    ACCOUNT_SUSPENDED: {
      message: 'ACCOUNT_SUSPENDED',
      status: HttpStatus.LOCKED,
      code: 'ACCOUNT_SUSPENDED'
    },
    ACCOUNT_BLOCKED: {
      message: 'ACCOUNT_BLOCKED',
      status: HttpStatus.LOCKED,
      code: 'ACCOUNT_BLOCKED'
    },

    // success messages
    VERIFICATION_CODE_SENT: {
      message: 'VERIFICATION_CODE_SENT',
      status: HttpStatus.OK,
      code: 'VERIFICATION_CODE_SENT'
    },
    VALID_VERIFICATION_CODE: {
      message: 'VALID_VERIFICATION_CODE',
      status: HttpStatus.OK,
      code: 'VALID_VERIFICATION_CODE'
    },
    PASSWORD_RESET_SUCCESSFUL: {
      message: 'PASSWORD_RESET_SUCCESSFUL',
      status: HttpStatus.OK,
      code: 'PASSWORD_RESET_SUCCESSFUL'
    }
  },
  user: {
    // error messages
    USER_NOT_FOUND: {
      message: 'USER_NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
      code: 'USER_NOT_FOUND'
    },
    EMAIL_ALREADY_EXISTS: {
      message: 'EMAIL_ALREADY_EXISTS',
      status: HttpStatus.BAD_REQUEST,
      code: 'EMAIL_ALREADY_EXISTS'
    },
    INVALID_PASSWORD_FORMAT: {
      message: 'INVALID_PASSWORD_FORMAT',
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_PASSWORD_FORMAT'
    },

    // success messages
    USER_CREATED_SUCCESSFULLY: {
      message: 'USER_CREATED_SUCCESSFULLY',
      status: HttpStatus.CREATED,
      code: 'USER_CREATED_SUCCESSFULLY'
    },
    USER_UPDATED_SUCCESSFULLY: {
      message: 'USER_UPDATED_SUCCESSFULLY',
      status: HttpStatus.OK,
      code: 'USER_UPDATED_SUCCESSFULLY'
    },
    USER_DELETED_SUCCESSFULLY: {
      message: 'USER_DELETED_SUCCESSFULLY',
      status: HttpStatus.OK,
      code: 'USER_DELETED_SUCCESSFULLY'
    },
    USER_STATUS_UPDATED_SUCCESSFULLY: {
      message: 'USER_STATUS_UPDATED_SUCCESSFULLY',
      status: HttpStatus.OK,
      code: 'USER_STATUS_UPDATED_SUCCESSFULLY'
    },
    USERS_RETRIEVED_SUCCESSFULLY: {
      message: 'USERS_RETRIEVED_SUCCESSFULLY',
      status: HttpStatus.OK,
      code: 'USERS_RETRIEVED_SUCCESSFULLY'
    },
    USER_RETRIEVED_SUCCESSFULLY: {
      message: 'USER_RETRIEVED_SUCCESSFULLY',
      status: HttpStatus.OK,
      code: 'USER_RETRIEVED_SUCCESSFULLY'
    }
  }
};
