import * as ms from 'ms';

export const LOGIN_FAILURE_RULES = [
  { attempt: 5, duration: ms('5m') }, // 5 minutes
  { attempt: 6, duration: ms('10m') } // 10 minutes
];

export const MAX_FAILED_LOGIN_ATTEMPT: number = Math.max(...LOGIN_FAILURE_RULES.map((rule) => rule.attempt));
