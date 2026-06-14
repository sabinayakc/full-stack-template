export type { GeneralSmsParams } from "./templates/general";
export { generalSms } from "./templates/general";
export type { OtpSmsParams } from "./templates/otp";
export { otpSms } from "./templates/otp";
export type { SendSmsOptions, SendSmsResponse } from "./transport";
export { getSmsProvider, sendSms, setSmsProvider } from "./transport";
