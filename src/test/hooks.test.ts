import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCorporationValidation } from '../hooks/useCorporationValidation';
import { useFormSubmission } from '../hooks/useFormSubmission';
import { apiService } from '../services/api';
import { validatePhoneFormat, cleanPhoneInput } from '../utils/validation';

vi.mock('../services/api', () => ({
  apiService: {
    validateCorporationNumber: vi.fn(),
    submitProfileDetails: vi.fn(),
  },
}));

const mockApiService = vi.mocked(apiService);

describe('useCorporationValidation Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useCorporationValidation());

    expect(result.current.isValidating).toBe(false);
    expect(result.current.validationResult).toBe(null);
  });

  it('should validate corporation number successfully', async () => {
    const mockResponse = {
      corporationNumber: '123456789',
      valid: true,
    };
    mockApiService.validateCorporationNumber.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCorporationValidation());

    await act(async () => {
      const response = await result.current.validateCorporationNumber('123456789');
      expect(response).toEqual(mockResponse);
    });

    expect(result.current.validationResult).toEqual(mockResponse);
    expect(result.current.isValidating).toBe(false);
    expect(mockApiService.validateCorporationNumber).toHaveBeenCalledWith('123456789');
  });

  it('should handle validation errors', async () => {
    const mockError = {
      message: 'Invalid corporation number',
      status: 400,
    };
    mockApiService.validateCorporationNumber.mockRejectedValue(mockError);

    const { result } = renderHook(() => useCorporationValidation());

    await act(async () => {
      const response = await result.current.validateCorporationNumber('123456789');
      expect(response).toEqual({
        corporationNumber: '123456789',
        valid: false,
        message: 'Invalid corporation number',
      });
    });

    expect(result.current.validationResult).toEqual({
      corporationNumber: '123456789',
      valid: false,
      message: 'Invalid corporation number',
    });
    expect(result.current.isValidating).toBe(false);
  });

  it('should not validate if corporation number is not 9 digits', async () => {
    const { result } = renderHook(() => useCorporationValidation());

    await act(async () => {
      await result.current.validateCorporationNumber('123');
    });

    expect(mockApiService.validateCorporationNumber).not.toHaveBeenCalled();
    expect(result.current.validationResult).toBe(null);
  });

  it('should clear validation result', () => {
    const { result } = renderHook(() => useCorporationValidation());

    act(() => {
      result.current.clearValidation();
    });

    expect(result.current.validationResult).toBe(null);
  });
});

describe('useFormSubmission Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useFormSubmission());

    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.submitError).toBe(null);
    expect(result.current.isSuccess).toBe(false);
  });

  it('should submit form successfully', async () => {
    const mockFormData = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+13062776103',
      corporationNumber: '123456789',
    };
    mockApiService.submitProfileDetails.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFormSubmission());

    await act(async () => {
      const response = await result.current.submitForm(mockFormData);
      expect(response.success).toBe(true);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.submitError).toBe(null);
    expect(result.current.isSubmitting).toBe(false);
    expect(mockApiService.submitProfileDetails).toHaveBeenCalledWith(mockFormData);
  });

  it('should handle submission errors', async () => {
    const mockFormData = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+13062776103',
      corporationNumber: '123456789',
    };
    const mockError = {
      message: 'Invalid phone number',
      status: 400,
    };
    mockApiService.submitProfileDetails.mockRejectedValue(mockError);

    const { result } = renderHook(() => useFormSubmission());

    await act(async () => {
      const response = await result.current.submitForm(mockFormData);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid phone number');
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.submitError).toBe('Invalid phone number');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should reset submission state', () => {
    const { result } = renderHook(() => useFormSubmission());

    act(() => {
      result.current.resetSubmission();
    });

    expect(result.current.submitError).toBe(null);
    expect(result.current.isSuccess).toBe(false);
  });
});

describe('Validation Utilities', () => {
  describe('validatePhoneFormat', () => {
    it('should validate Canadian phone numbers correctly', () => {
      expect(validatePhoneFormat('+13062776103')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneFormat('3062776103')).toBe(false); // Missing +1
      expect(validatePhoneFormat('+2234567890')).toBe(false); // Wrong country code
      expect(validatePhoneFormat('+1-306-277-6103')).toBe(false); // Special characters
      expect(validatePhoneFormat('+1 306 277 6103')).toBe(false); // Spaces
      expect(validatePhoneFormat('+1000000000')).toBe(false); // Invalid area code (starts with 0)
      expect(validatePhoneFormat('+1100000000')).toBe(false); // Invalid area code (starts with 1)
    });
  });

  describe('cleanPhoneInput', () => {
    it('should clean phone input correctly', () => {
      expect(cleanPhoneInput('3062776103')).toBe('+13062776103');
      expect(cleanPhoneInput('1-306-277-6103')).toBe('+13062776103');
      expect(cleanPhoneInput('+1 306 277 6103')).toBe('+13062776103');
      expect(cleanPhoneInput('+13062776103')).toBe('+13062776103');
      expect(cleanPhoneInput('13062776103')).toBe('+13062776103');
    });

    it('should handle edge cases', () => {
      expect(cleanPhoneInput('')).toBe('+1');
      expect(cleanPhoneInput('abc')).toBe('+1');
      expect(cleanPhoneInput('+')).toBe('+1');
      expect(cleanPhoneInput('1')).toBe('+1');
    });
  });
});
