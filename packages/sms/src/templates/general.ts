export interface GeneralSmsParams {
  body: string;
}

export function generalSms(params: GeneralSmsParams): string {
  return params.body;
}
