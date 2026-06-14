export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/;

export const PASSWORD_POLICY_MESSAGE =
  "Use 8-128 characters with uppercase, lowercase, a number, and a symbol.";

export const PASSWORD_RECOMMENDATION_MESSAGE =
  "Recommended: 12+ characters for better resistance against guessing and reuse attacks.";

export function isPasswordPolicyValid(password: string) {
  return PASSWORD_POLICY_REGEX.test(password);
}
