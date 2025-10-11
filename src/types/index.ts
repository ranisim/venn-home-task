export interface OnboardingFormData {
  firstName: string;
  lastName: string;
  phone: string;
  corporationNumber: string;
}

export interface CorporationValidationResponse {
  corporationNumber: string;
  valid: boolean;
  message?: string;
}

export interface ProfileSubmissionResponse {
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export type FormField = 'firstName' | 'lastName' | 'phone' | 'corporationNumber';

export interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  corporationNumber?: string;
}
