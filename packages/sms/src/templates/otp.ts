export interface OtpSmsParams {
  code: string;
}

export function otpSms(params: OtpSmsParams): string {
  return `Your verification code is ${params.code}. Don't share this code.`;
}
