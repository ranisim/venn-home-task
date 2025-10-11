import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { OnboardingFormData, ApiError } from '../types';

export const useFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const submitForm = useCallback(async (formData: OnboardingFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setIsSuccess(false);

    try {
      await apiService.submitProfileDetails(formData);
      setIsSuccess(true);
      return { success: true };
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Failed to submit form';
      setSubmitError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const resetSubmission = useCallback(() => {
    setSubmitError(null);
    setIsSuccess(false);
  }, []);

  return {
    isSubmitting,
    submitError,
    isSuccess,
    submitForm,
    resetSubmission,
  };
};
