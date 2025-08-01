export type ValidationRule = (value: unknown) => boolean | string;

export interface ConditionalValidationRule {
  condition: () => boolean;
  rules: ValidationRule[];
  dependsOn?: string[];
}

export const commonValidationRules = {
  required: [(value: unknown) => !!value],
  email: [(value: unknown) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)],
  zipCode: [(value: unknown) => typeof value === 'string' && /^\d{5}(-\d{4})?$/.test(value)],
  phone: [(value: unknown) => typeof value === 'string' && /^\(\d{3}\) \d{3}-\d{4}$/.test(value)],
  ein: [(value: unknown) => typeof value === 'string' && /^\d{2}-\d{7}$/.test(value)],
  url: [(value: unknown) => typeof value === 'string' && /^https?:\/\/.+/.test(value)],
  number: [(value: unknown) => !isNaN(Number(value))],
  date: [(value: unknown) => typeof value === 'string' && !isNaN(Date.parse(value))],
  positiveNumber: [(value: unknown) => Number(value) > 0],
  percentage: [(value: unknown) => Number(value) >= 0 && Number(value) <= 100],
  organizationName: [(value: unknown) => typeof value === 'string' && !!value && value.trim().length > 0],
  address: [(value: unknown) => typeof value === 'string' && !!value && value.trim().length > 0],
  city: [(value: unknown) => typeof value === 'string' && !!value && value.trim().length > 0],
  state: [(value: unknown) => typeof value === 'string' && !!value && value.trim().length > 0],
  website: [(value: unknown) => typeof value === 'string' && /^https?:\/\/.+/.test(value)],
};

export const runValidations = (data: Record<string, unknown>, rules: ValidationRule[]) => {
  for (const rule of rules) {
    if (typeof rule === 'function') {
      const result = rule(data);
      if (result === false) {
        return 'Validation failed';
      } else if (typeof result === 'string') {
        return result;
      }
    }
  }

  return null;
};

export const runSingleValueValidations = (value: unknown, rules: ValidationRule[]) => {
  for (const rule of rules) {
    if (typeof rule === 'function') {
      const result = rule(value);
      if (result === false) {
        return 'Validation failed';
      } else if (typeof result === 'string') {
        return result;
      }
    }
  }

  return null;
};

export const conditionalValidationRules: { [key: string]: ConditionalValidationRule[] } = {
  ein: [
    {
      condition: () => true,
      rules: [commonValidationRules.required[0], commonValidationRules.ein[0]],
      dependsOn: [],
    },
  ],
  email: [
    {
      condition: () => true,
      rules: [commonValidationRules.required[0], commonValidationRules.email[0]],
      dependsOn: [],
    },
  ],
  phone: [
    {
      condition: () => true,
      rules: [commonValidationRules.required[0], commonValidationRules.phone[0]],
      dependsOn: [],
    },
  ],
  zipCode: [
    {
      condition: () => true,
      rules: [commonValidationRules.required[0], commonValidationRules.zipCode[0]],
      dependsOn: [],
    },
  ],
};

export const runConditionalValidations = (
  value: unknown,
  rules: ConditionalValidationRule[],
  formData?: Record<string, unknown>
): string | null => {
  for (const conditionalRule of rules) {
    if (conditionalRule.condition()) {
      const result = runSingleValueValidations(value, conditionalRule.rules);
      if (result) {
        return result; // Return first error
      }
    }
  }
  return null;
};
