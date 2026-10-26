import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export const EmailVerificationTemplate = (verificationToken: string) => {
  return `Hi! <br><br> Thank you for registering.<br><br>
    <a href=${configService.get('WEB_APP_URL')}}/verify/${verificationToken}>
    Click here to activate your account</a>
    </br>Regards,</br>Orange Cleaning Team`;
};

export const EmailVerifiedTemplate = () => {
  return `Hi! <br><br> Thanks for your verifying your email.<br><br>
    <p>Please continue using the services form Orange Cleaning.</p>
    <a href='${configService.get('WEB_APP_URL')}}/signIn'>Click here to Login</a>
    <br>Regards,<br>Orange Cleaning Team`;
};

export const ForgotPasswordTemplate = (newPasswordToken: string) => {
  return `Hi! <br><br> If you requested to reset your password<br><br>
  <p>Here is the link to reset your password. Please click the link below to continue.</p><br>
  <a href=${configService.get('WEB_APP_URL')}/reset-password/${newPasswordToken}>Click here</a>
  <br>Regards,</br>Orange Cleaning Team`;
};

export const PasswordResetTemplate = () => {
  return `Hi! <br><br> You've successfully reset your password.<br><br>
  <p>Please click the link below to continue.</p><br>
  <a href='${configService.get('WEB_APP_URL')}/signIn'>Click here</a>
  <br>Regards,</br>Orange Cleaning Team`;
};

export const TEMPLATE_MAIL = {
  VERIFY_EMAIL: {
    name: 'verifyEmail',
    subject: 'Clinic Care - Confirm your email address'
  },
  RESEND_VERIFICATION_CODE: {
    name: 'resendVerificationCode',
    subject: 'Clinic Care - Resend verification code'
  },
  SEND_RESET_PASSWORD: {
    name: 'sendResetPasswordCode',
    subject: 'Clinic Care - Reset your password'
  },
  INVITE_MEMBER_TO_PROJECT: {
    name: 'inviteMemberToProject',
    subject: 'Clinic Care - doctor invitation'
  },
  WELCOME_DOCTOR: {
    name: 'welcomeDoctor',
    subject: 'Clinic Care - Welcome Doctor'
  },
  BOOKING_REMINDER_PATIENT: {
    name: 'bookingReminderPatient',
    subject: 'Nhắc nhở: Lịch khám của bạn sắp diễn ra'
  },
  BOOKING_NOTIFICATION_DOCTOR: {
    name: 'bookingNotificationDoctor',
    subject: 'Thông báo: Có bệnh nhân sắp đến giờ khám'
  },
  // 2. Bác sĩ xác nhận lịch
  BOOKING_OFFLINE: {
    name: 'bookingOffline',
    subject: 'Xác nhận lịch khám tại phòng khám - CLINIC CARE'
  },

  BOOKING_ONLINE: {
    name: 'bookingOnline',
    subject: 'Link tham gia khám bệnh Online - CLINIC CARE'
  },

  // 3. Hủy lịch -> File: bookingCancelled.hbs
  BOOKING_CANCELLED: {
    name: 'bookingCancelled',
    subject: 'Thông báo hủy lịch khám - CLINIC CARE'
  }
} as const;

export const MAIL_FROM = 'no-reply@cliniccare.com';
