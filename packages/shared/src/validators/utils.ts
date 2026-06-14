import { z } from "zod";

type WholeNumberOptions = {
  min?: number;
  max?: number;
};

type NumberRangeOptions = {
  min?: number;
  max?: number;
  greaterThan?: number;
};

export function providerSafeNumber(description: string) {
  return z.number().describe(description);
}

export function providerSafeOptionalNumber(description: string) {
  return z.number().optional().describe(description);
}

export function providerSafeWholeNumber(description: string) {
  return z.number().describe(description);
}

export function providerSafeOptionalWholeNumber(description: string) {
  return z.number().optional().describe(description);
}

export function validateWholeNumber(
  value: number | undefined,
  fieldLabel: string,
  options: WholeNumberOptions = {},
): string | null {
  if (value === undefined) {
    return null;
  }

  if (!Number.isInteger(value)) {
    return `${fieldLabel} must be a whole number.`;
  }

  if (options.min !== undefined && value < options.min) {
    return `${fieldLabel} must be at least ${options.min}.`;
  }

  if (options.max !== undefined && value > options.max) {
    return `${fieldLabel} must be at most ${options.max}.`;
  }

  return null;
}

export function validateNumberRange(
  value: number | undefined,
  fieldLabel: string,
  options: NumberRangeOptions = {},
): string | null {
  if (value === undefined) {
    return null;
  }

  if (!Number.isFinite(value)) {
    return `${fieldLabel} must be a valid number.`;
  }

  if (options.greaterThan !== undefined && value <= options.greaterThan) {
    return `${fieldLabel} must be greater than ${options.greaterThan}.`;
  }

  if (options.min !== undefined && value < options.min) {
    return `${fieldLabel} must be at least ${options.min}.`;
  }

  if (options.max !== undefined && value > options.max) {
    return `${fieldLabel} must be at most ${options.max}.`;
  }

  return null;
}
