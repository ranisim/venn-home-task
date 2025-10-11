import { z } from 'zod';

// Canadian phone number regex: +1 followed by exactly 10 digits
const canadianPhoneRegex = /^\+1[2-9]\d{2}[2-9]\d{2}\d{4}$/;

export const onboardingFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less')
    .trim(),
  
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less')
    .trim(),
  
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(canadianPhoneRegex, 'Phone number must be a valid Canadian number starting with +1 followed by 10 digits')
    .trim(),
  
  corporationNumber: z
    .string()
    .min(1, 'Corporation number is required')
    .length(9, 'Corporation number must be exactly 9 characters')
    .regex(/^\d{9}$/, 'Corporation number must contain only digits'),
});

export type OnboardingFormSchema = z.infer<typeof onboardingFormSchema>;

// Utility function to validate phone number format
export const validatePhoneFormat = (phone: string): boolean => {
  return canadianPhoneRegex.test(phone);
};

// Utility function to clean phone number input
export const cleanPhoneInput = (input: string): string => {
  // Remove all non-digit characters except +
  const cleaned = input.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +1
  if (!cleaned.startsWith('+1')) {
    // If it starts with 1, add +
    if (cleaned.startsWith('1')) {
      return '+' + cleaned;
    }
    // If it doesn't start with 1, add +1
    return '+1' + cleaned.replace(/^\+?/, '');
  }
  
  // Limit to 12 characters (+1 + 10 digits)
  return cleaned.substring(0, 12);
};