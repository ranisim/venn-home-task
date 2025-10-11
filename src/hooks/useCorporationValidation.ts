import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import type { CorporationValidationResponse, ApiError } from '../types';

export const useCorporationValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<CorporationValidationResponse | null>(null);

  const validateCorporationNumber = useCallback(async (corporationNumber: string) => {
    if (!corporationNumber || corporationNumber.length !== 9) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    try {
      const result = await apiService.validateCorporationNumber(corporationNumber);
      setValidationResult(result);
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      const result: CorporationValidationResponse = {
        corporationNumber,
        valid: false,
        message: apiError.message || 'Failed to validate corporation number',
      };
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    isValidating,
    validationResult,
    validateCorporationNumber,
    clearValidation,
  };
};
