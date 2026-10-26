import { ERROR_MESSAGES } from '../constants/errorMessage.constant';
import { ForbiddenException } from '../exceptions/forbidden.exception';

export const checkProjectIdConsistency = (headerProjectId: number, projectId: number): boolean => {
  if (headerProjectId !== projectId) {
    throw new ForbiddenException({ message: ERROR_MESSAGES.common.PERMISSION_DENIED });
  }
  return true;
};
