export interface ConditionalValidationRule {
  condition: () => boolean;
  rules: any[];
  dependsOn?: string[];
}

export const commonValidationRules = {
  required: [(value: any) => !!value],
  email: [(value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)],
  zipCode: [(value: string) => /^\d{5}(-\d{4})?$/.test(value)],
  phone: [(value: string) => /^\(\d{3}\) \d{3}-\d{4}$/.test(value)],
  ein: [(value: string) => /^\d{2}-\d{7}$/.test(value)],
  url: [(value: string) => /^https?:\/\/.+/.test(value)],
  number: [(value: any) => !isNaN(Number(value))],
  date: [(value: string) => !isNaN(Date.parse(value))],
  positiveNumber: [(value: any) => Number(value) > 0],
  percentage: [(value: any) => Number(value) >= 0 && Number(value) <= 100],
  organizationName: [(value: string) => !!value && value.trim().length > 0],
  address: [(value: string) => !!value && value.trim().length > 0],
  city: [(value: string) => !!value && value.trim().length > 0],
  state: [(value: string) => !!value && value.trim().length > 0],
  website: [(value: string) => /^https?:\/\/.+/.test(value)],
};

export const runValidations = (data: any, rules: any[]) => {
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
  value: any,
  rules: ConditionalValidationRule[],
  formData?: any
): string | null => {
  for (const conditionalRule of rules) {
    if (conditionalRule.condition()) {
      const result = runValidations(value, conditionalRule.rules);
      if (result) {
        return result; // Return first error
      }
    }
  }
  return null;
};
