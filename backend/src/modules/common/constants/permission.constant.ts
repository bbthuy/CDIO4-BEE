import { Admin } from 'typeorm';

/**
 * Permission constants for Healthcare System
 * Format: [RESOURCE]:[ACTION]
 */
export const PERMISSIONS = {
  // ==================== USER MANAGEMENT ====================
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_STATUS_CHANGE: 'user:status_change',
  USER_VIEW_ALL: 'user:view_all',
  USER_VIEW_PROFILE: 'user:view_profile',

  // ==================== ROLE MANAGEMENT ====================
  ROLE_MANAGE: 'role:manage',
  ROLE_VIEW: 'role:view',
  ROLE_ASSIGN: 'role:assign',

  // ==================== DOCTOR MANAGEMENT ====================
  DOCTOR_CREATE: 'doctor:create',
  DOCTOR_DELETE: 'doctor:delete',
  DOCTOR_VIEW: 'doctor:view',
  DOCTOR_VIEW_ALL: 'doctor:view_all',
  DOCTOR_UPDATE: 'doctor:update',
  DOCTOR_UPDATE_PROFILE: 'doctor:update_profile',
  DOCTOR_SCHEDULE_MANAGE: 'doctor_schedule:manage',
  DOCTOR_AVAILABILITY_MANAGE: 'doctor_availability:manage',

  // ==================== PATIENT MANAGEMENT ====================
  PATIENT_VIEW: 'patient:view',
  PATIENT_VIEW_ALL: 'patient:view_all',
  PATIENT_UPDATE: 'patient:update',
  PATIENT_UPDATE_PROFILE: 'patient:update_profile',
  PATIENT_HISTORY_VIEW: 'patient:history_view',

  // ==================== APPOINTMENT MANAGEMENT ====================
  APPOINTMENT_CREATE: 'appointment:create',
  APPOINTMENT_VIEW: 'appointment:view',
  APPOINTMENT_VIEW_ALL: 'appointment:view_all',
  APPOINTMENT_VIEW_OWN: 'appointment:view_own',
  APPOINTMENT_UPDATE: 'appointment:update',
  APPOINTMENT_CANCEL: 'appointment:cancel',
  APPOINTMENT_CONFIRM: 'appointment:confirm',
  APPOINTMENT_COMPLETE: 'appointment:complete',
  APPOINTMENT_RESCHEDULE: 'appointment:reschedule',
  APPOINTMENT_FORCE_CANCEL: 'appointment:force_cancel',
  APPOINTMENT_ASSIGN_DOCTOR: 'appointment:assign_doctor',

  // ==================== PAYMENT MANAGEMENT ====================
  PAYMENT_CREATE: 'payment:create',
  PAYMENT_VIEW: 'payment:view',
  PAYMENT_VIEW_ALL: 'payment:view_all',
  PAYMENT_VIEW_OWN: 'payment:view_own',
  PAYMENT_PROCESS: 'payment:process',
  PAYMENT_REFUND: 'payment:refund',
  PAYMENT_VERIFY: 'payment:verify',

  // ==================== MEDICAL RECORD ====================
  MEDICAL_RECORD_VIEW: 'medical_record:view',
  MEDICAL_RECORD_VIEW_OWN: 'medical_record:view_own',
  MEDICAL_RECORD_CREATE: 'medical_record:create',
  MEDICAL_RECORD_UPDATE: 'medical_record:update',
  MEDICAL_RECORD_DELETE: 'medical_record:delete',

  // ==================== PRESCRIPTION ====================
  PRESCRIPTION_CREATE: 'prescription:create',
  PRESCRIPTION_VIEW: 'prescription:view',
  PRESCRIPTION_VIEW_OWN: 'prescription:view_own',
  PRESCRIPTION_UPDATE: 'prescription:update',
  PRESCRIPTION_DELETE: 'prescription:delete',

  // ==================== CONSULTATION (Chat/Video) ====================
  CONSULTATION_START: 'consultation:start',
  CONSULTATION_JOIN: 'consultation:join',
  CONSULTATION_CHAT: 'consultation:chat',
  CONSULTATION_VIDEO: 'consultation:video',
  CONSULTATION_END: 'consultation:end',
  CONSULTATION_VIEW_HISTORY: 'consultation:view_history',

  // ==================== AI SERVICES ====================
  AI_TRIAGE: 'ai:triage',
  AI_QA: 'ai:qa',
  AI_SUMMARY: 'ai:summary',
  AI_MODERATE: 'ai:moderate',
  AI_DIAGNOSE_ASSIST: 'ai:diagnose_assist',

  // ==================== REVIEW & RATING ====================
  REVIEW_CREATE: 'review:create',
  REVIEW_VIEW: 'review:view',
  REVIEW_DELETE: 'review:delete',

  // ==================== SPECIALTY MANAGEMENT ====================
  SPECIALTY_CREATE: 'specialty:create',
  SPECIALTY_VIEW: 'specialty:view',
  SPECIALTY_UPDATE: 'specialty:update',
  SPECIALTY_DELETE: 'specialty:delete',

  // ==================== NOTIFICATION ====================
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_VIEW: 'notification:view',
  NOTIFICATION_DELETE: 'notification:delete',

  // ==================== REPORT & ANALYTICS ====================
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',
  REPORT_FINANCIAL: 'report:financial',
  REPORT_APPOINTMENT: 'report:appointment',
  REPORT_DOCTOR_PERFORMANCE: 'report:doctor_performance',

  // ==================== SYSTEM SETTINGS ====================
  SETTING_VIEW: 'setting:view',
  SETTING_UPDATE: 'setting:update',
  SETTING_SYSTEM: 'setting:system',

  // ==================== AUDIT LOGS ====================
  AUDIT_LOG_VIEW: 'audit_log:view',
  AUDIT_LOG_EXPORT: 'audit_log:export',

  // ==================== SCHEDULE ====================
  SCHEDULE_CREATE: 'schedule:create',
  SCHEDULE_VIEW: 'schedule:view',
  SCHEDULE_UPDATE: 'schedule:update',
  SCHEDULE_DELETE: 'schedule:delete',

  DOCTOR_MEDICAL_RECORDS: 'doctor:medical_records',
  DOCTOR_UPDATE_MEDICAL_RECORDS: 'doctor:update',
  ADMIN_VIEW: 'admin:view',

  BOOKING_DELETE: 'booking:delete'
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
