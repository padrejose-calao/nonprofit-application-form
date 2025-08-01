export interface ConditionalValidationRule {
  condition: () => boolean;
  rules: any[];
}

export const commonValidationRules = {
  required: (value: any) => !!value,
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
};

export const runValidations = (data: any, rules: any[]) => {
  return [];
};

export const conditionalValidationRules: ConditionalValidationRule[] = [];

export const runConditionalValidations = (data: any, rules: ConditionalValidationRule[]) => {
  return [];
}; 