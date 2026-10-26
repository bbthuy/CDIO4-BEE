import { HttpStatus } from '@nestjs/common';

export const ERROR_MESSAGES = {
  common: {
    // success messages
    SUCCESSFUL: {
      message: 'SUCCESSFUL',
      status: HttpStatus.OK,
      code: 'SUCCESSFUL'
    },
    CREATED: {
      message: 'SUCCESSFUL',
      status: HttpStatus.CREATED,
      code: 'CREATED'
    },

    // error messages
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
    PERMISSION_DENIED: {
      message: 'PERMISSION_DENIED',
      status: HttpStatus.FORBIDDEN,
      code: 'PERMISSION_DENIED'
    },
    INVALID_HASHCODE: {
      message: 'INVALID_HASHCODE',
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_HASHCODE'
    },
    INVALID_REQUEST_DATA: {
      message: 'INVALID_REQUEST_DATA',
      status: HttpStatus.BAD_REQUEST,
      code: 'VALIDATION_ERROR'
    }
  },
  auth: {
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
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_TOKEN'
    },
    INVALID_TOKEN_TYPE: {
      message: 'INVALID_TOKEN_TYPE',
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_TOKEN_TYPE'
    },
    TOKEN_REVOKED: {
      message: 'TOKEN_REVOKED',
      status: HttpStatus.UNAUTHORIZED,
      code: 'TOKEN_REVOKED'
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
    INVALID_CODE: {
      message: 'INVALID_CODE',
      status: HttpStatus.UNAUTHORIZED,
      code: 'INVALID_CODE'
    },
    INVALID_OR_EXPIRED_AUTH_CODE: {
      message: 'INVALID_OR_EXPIRED_AUTH_CODE',
      status: HttpStatus.UNAUTHORIZED,
      code: 'INVALID_OR_EXPIRED_AUTH_CODE'
    },
    CODE_INVALID_LENGTH: {
      message: 'CODE_INVALID_LENGTH',
      status: HttpStatus.BAD_REQUEST,
      code: 'CODE_INVALID_LENGTH'
    },
    ACCOUNT_TEMPORARILY_BLOCKED: {
      message: 'ACCOUNT_TEMPORARILY_BLOCKED',
      status: HttpStatus.LOCKED,
      code: 'ACCOUNT_TEMPORARILY_BLOCKED'
    },
    ACCOUNT_PERMANENTLY_BLOCKED: {
      message: 'ACCOUNT_PERMANENTLY_BLOCKED',
      status: HttpStatus.LOCKED,
      code: 'ACCOUNT_PERMANENTLY_BLOCKED'
    },
    PASSWORD_MISSING_REQUIREMENTS: {
      message: 'PASSWORD_MISSING_REQUIREMENTS',
      status: HttpStatus.BAD_REQUEST,
      code: 'PASSWORD_MISSING_REQUIREMENTS'
    },
    EMAIL_NOT_FOUND: {
      message: 'EMAIL_NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
      code: 'EMAIL_NOT_FOUND'
    },
    USER_NOT_FOUND: {
      message: 'USER_NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
      code: 'USER_NOT_FOUND'
    },
    INVALID_PASSWORD: {
      message: 'INVALID_PASSWORD',
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_PASSWORD'
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
    PASSWORD_MISSING_REQUIREMENTS: {
      message: 'PASSWORD_MISSING_REQUIREMENTS',
      status: HttpStatus.BAD_REQUEST,
      code: 'PASSWORD_MISSING_REQUIREMENTS'
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
  },
  doctor: {
    DOCTOR_NOT_FOUND: {
      message: 'DOCTOR_NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
      code: 'DOCTOR_NOT_FOUND'
    },
    DOCTOR_EMAIL_ALREADY_EXISTS: {
      message: 'DOCTOR_EMAIL_ALREADY_EXISTS',
      status: HttpStatus.BAD_REQUEST,
      code: 'DOCTOR_EMAIL_ALREADY_EXISTS'
    },
    DOCTOR_ALREADY_EXISTS: {
      message: 'DOCTOR_ALREADY_EXISTS',
      status: HttpStatus.BAD_REQUEST,
      code: 'DOCTOR_ALREADY_EXISTS'
    },

    INVALID_SPECIALTY: {
      message: 'INVALID_SPECIALTY',
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_SPECIALTY'
    },

    INVALID_EXPERIENCE_YEARS: {
      message: 'INVALID_EXPERIENCE_YEARS',
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_EXPERIENCE_YEARS'
    }
  },
  role: {
    INVALID_ROLE: {
      message: 'INVALID_ROLE',
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_ROLE'
    }
  },
  permission: {
    INVALID_PERMISSION: {
      message: 'INVALID_PERMISSION',
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_PERMISSION'
    },
    DEFAULT_PERMISSIONS_NOT_FOUND: {
      message: 'DEFAULT_PERMISSIONS_NOT_FOUND',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'DEFAULT_PERMISSIONS_NOT_FOUND'
    }
  },
  attachment: {
    INVALID_FILE_PATH: {
      message: 'INVALID_FILE_PATH',
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_FILE_PATH'
    },
    NOT_FOUND: {
      message: 'NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
      code: 'NOT_FOUND'
    }
  },

  specialty: {
    SPECIALTY_NOT_FOUND: {
      message: 'SPECIALTY_NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
      code: 'SPECIALTY_NOT_FOUND'
    },
    SPECIALTY_NAME_ALREADY_EXISTS: {
      message: 'SPECIALTY_NAME_ALREADY_EXISTS',
      status: HttpStatus.BAD_REQUEST,
      code: 'SPECIALTY_NAME_ALREADY_EXISTS'
    },
    INVALID_SPECIALTY_ID: {
      message: 'INVALID_SPECIALTY_ID',
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_SPECIALTY_ID'
    },

    // === Success Messages ===
    SPECIALTY_CREATED_SUCCESSFULLY: {
      message: 'SPECIALTY_CREATED_SUCCESSFULLY',
      status: HttpStatus.CREATED,
      code: 'SPECIALTY_CREATED_SUCCESSFULLY'
    },
    SPECIALTY_UPDATED_SUCCESSFULLY: {
      message: 'SPECIALTY_UPDATED_SUCCESSFULLY',
      status: HttpStatus.OK,
      code: 'SPECIALTY_UPDATED_SUCCESSFULLY'
    },
    SPECIALTY_DELETED_SUCCESSFULLY: {
      message: 'SPECIALTY_DELETED_SUCCESSFULLY',
      status: HttpStatus.OK,
      code: 'SPECIALTY_DELETED_SUCCESSFULLY'
    },
    SPECIALTIES_RETRIEVED_SUCCESSFULLY: {
      message: 'SPECIALTIES_RETRIEVED_SUCCESSFULLY',
      status: HttpStatus.OK,
      code: 'SPECIALTIES_RETRIEVED_SUCCESSFULLY'
    },
    SPECIALTY_RETRIEVED_SUCCESSFULLY: {
      message: 'SPECIALTY_RETRIEVED_SUCCESSFULLY',
      status: HttpStatus.OK,
      code: 'SPECIALTY_RETRIEVED_SUCCESSFULLY'
    }
  },
  review: {
    REVIEW_NOT_FOUND: {
      message: 'REVIEW_NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
      code: 'REVIEW_NOT_FOUND'
    }
  },
  notification: {
    NOTIFICATION_NOT_FOUND: {
      message: 'NOTIFICATION_NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
      code: 'NOTIFICATION_NOT_FOUND'
    }
  },
  schedule: {
    NOT_FOUND: {
      message: 'SCHEDULE_NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
      code: 'SCHEDULE_NOT_FOUND'
    },
    INVALID_SCHEDULE: {
      message: 'INVALID_SCHEDULE',
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_SCHEDULE'
    },
    FORBIDDEN_DELETE: {
      message: 'FORBIDDEN_DELETE',
      status: HttpStatus.FORBIDDEN,
      code: 'FORBIDDEN_DELETE'
    }
  },
  booking: {
    // --- Errors ---
    NOT_FOUND: {
      message: 'BOOKING_NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
      code: 'BOOKING_NOT_FOUND'
    },
    ALREADY_CONFIRMED: {
      message: 'BOOKING_ALREADY_CONFIRMED',
      status: HttpStatus.BAD_REQUEST,
      code: 'BOOKING_ALREADY_CONFIRMED'
    },
    ALREADY_CANCELLED: {
      message: 'BOOKING_ALREADY_CANCELLED',
      status: HttpStatus.BAD_REQUEST,
      code: 'BOOKING_ALREADY_CANCELLED'
    },
    INVALID_STATUS: {
      message: 'INVALID_BOOKING_STATUS',
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_BOOKING_STATUS'
    },
    PAYMENT_REQUIRED: {
      message: 'ONLINE_BOOKING_REQUIRES_PAYMENT',
      status: HttpStatus.PAYMENT_REQUIRED, // Hoặc BAD_REQUEST
      code: 'ONLINE_BOOKING_REQUIRES_PAYMENT'
    },
    FORBIDDEN_ACCESS: {
      message: 'FORBIDDEN_ACCESS_TO_BOOKING',
      status: HttpStatus.FORBIDDEN,
      code: 'FORBIDDEN_ACCESS_TO_BOOKING'
    },

    // --- Success ---
    CREATE_SUCCESS: {
      message: 'BOOKING_CREATED_SUCCESSFULLY',
      status: HttpStatus.CREATED,
      code: 'BOOKING_CREATED_SUCCESSFULLY'
    },
    CONFIRM_SUCCESS: {
      message: 'BOOKING_CONFIRMED_SUCCESSFULLY',
      status: HttpStatus.OK,
      code: 'BOOKING_CONFIRMED_SUCCESSFULLY'
    },
    CANCEL_SUCCESS: {
      message: 'BOOKING_CANCELLED_SUCCESSFULLY',
      status: HttpStatus.OK,
      code: 'BOOKING_CANCELLED_SUCCESSFULLY'
    },
    DELETE_SUCCESS: {
      message: 'BOOKING_DELETED_SUCCESSFULLY',
      status: HttpStatus.OK,
      code: 'BOOKING_DELETED_SUCCESSFULLY'
    },
    GET_SUCCESS: {
      message: 'BOOKING_RETRIEVED_SUCCESSFULLY',
      status: HttpStatus.OK,
      code: 'BOOKING_RETRIEVED_SUCCESSFULLY'
    }
  },
  medicalRecord: {
    CREATE_SUCCESS: {
      message: 'MEDICAL_RECORD_CREATED_SUCCESSFULLY',
      status: HttpStatus.CREATED,
      code: 'MEDICAL_RECORD_CREATED_SUCCESSFULLY'
    },
    NOT_FOUND: {
      message: 'MEDICAL_RECORD_NOT_FOUND',
      status: HttpStatus.NOT_FOUND,
      code: 'MEDICAL_RECORD_NOT_FOUND'
    },
    INVALID_BOOKING_STATUS: {
      message: 'Lịch hẹn chưa được xác nhận hoặc đã hoàn thành',
      status: HttpStatus.BAD_REQUEST,
      code: 'INVALID_BOOKING_STATUS'
    }
  }
};
