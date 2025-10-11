import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingFormSchema, cleanPhoneInput } from '../utils/validation';
import { useCorporationValidation } from '../hooks/useCorporationValidation';
import { useFormSubmission } from '../hooks/useFormSubmission';
import type { OnboardingFormData } from '../types';

export const OnboardingForm: React.FC = () => {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFormSchema),
    mode: 'onBlur',
  });

  const { isValidating, validationResult, validateCorporationNumber } = useCorporationValidation();
  const { isSubmitting, submitError, isSuccess, submitForm, resetSubmission } = useFormSubmission();

  const watchedCorporationNumber = watch('corporationNumber');

  const handleCorporationNumberBlur = useCallback(async () => {
    const currentValue = watchedCorporationNumber;
    if (currentValue && currentValue.length === 9) {
      await validateCorporationNumber(currentValue);
    }
  }, [watchedCorporationNumber, validateCorporationNumber]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = cleanPhoneInput(e.target.value);
    setValue('phone', cleaned);
    trigger('phone');
  }, [setValue, trigger]);

  const handleCorporationNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 9) {
      setValue('corporationNumber', value);
      trigger('corporationNumber');
    }
  }, [setValue, trigger]);

  const onSubmit = useCallback(async (data: OnboardingFormData) => {
    setFormErrors({});
    resetSubmission();

    if (data.corporationNumber && (!validationResult || validationResult.corporationNumber !== data.corporationNumber)) {
      const corpValidation = await validateCorporationNumber(data.corporationNumber);
      if (corpValidation && !corpValidation.valid) {
        setFormErrors({ corporationNumber: corpValidation.message || 'Invalid corporation number' });
        return;
      }
    }

    if (validationResult && !validationResult.valid) {
      setFormErrors({ corporationNumber: validationResult.message || 'Invalid corporation number' });
      return;
    }

    const result = await submitForm(data);
    if (!result.success) {
      setFormErrors({ submit: result.error || 'Failed to submit form' });
    }
  }, [validationResult, validateCorporationNumber, submitForm, resetSubmission]);

  const corporationNumberError = 
    errors.corporationNumber?.message || 
    (validationResult && !validationResult.valid ? validationResult.message : undefined) ||
    formErrors.corporationNumber;

  if (isSuccess) {
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="success-title">Form Submitted Successfully!</h1>
          <p className="success-message">
            Thank you for completing the onboarding form. Your information has been successfully submitted.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="form-button form-button-secondary"
          >
            Submit Another Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-step">
          <span className="form-step-text">Step 1 of 5</span>
        </div>
        <h3 className="form-title">Onboarding Form</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="firstName" className="form-label">
                First Name<span className="form-label-required">*</span>
              </label>
              <input
                id="firstName"
                {...register('firstName')}
                className={`form-input ${errors.firstName ? 'form-input-error' : ''}`}
                maxLength={50}
                placeholder="Enter your first name"
                aria-invalid={errors.firstName ? 'true' : 'false'}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              />
              {errors.firstName && (
                <p id="firstName-error" className="form-error" role="alert">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="lastName" className="form-label">
                Last Name<span className="form-label-required">*</span>
              </label>
              <input
                id="lastName"
                {...register('lastName')}
                className={`form-input ${errors.lastName ? 'form-input-error' : ''}`}
                maxLength={50}
                placeholder="Enter your last name"
                aria-invalid={errors.lastName ? 'true' : 'false'}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              />
              {errors.lastName && (
                <p id="lastName-error" className="form-error" role="alert">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="phone" className="form-label">
              Phone Number<span className="form-label-required">*</span>
            </label>
            <input
              id="phone"
              {...register('phone')}
              className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
              onChange={handlePhoneChange}
              placeholder="+1XXXXXXXXXX"
              maxLength={12}
              aria-invalid={errors.phone ? 'true' : 'false'}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <p id="phone-error" className="form-error" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="corporationNumber" className="form-label">
              Corporation Number<span className="form-label-required">*</span>
            </label>
            <input
              id="corporationNumber"
              {...register('corporationNumber')}
              className={`form-input ${corporationNumberError ? 'form-input-error' : ''}`}
              onChange={handleCorporationNumberChange}
              onBlur={handleCorporationNumberBlur}
              placeholder="123456789"
              maxLength={9}
              aria-invalid={corporationNumberError ? 'true' : 'false'}
              aria-describedby={corporationNumberError ? 'corporationNumber-error' : undefined}
            />
            {isValidating && (
              <p className="validation-loading">Validating corporation number...</p>
            )}
            {corporationNumberError && (
              <p id="corporationNumber-error" className="form-error" role="alert">
                {corporationNumberError}
              </p>
            )}
          </div>

          {submitError && (
            <div className="form-error-banner">
              <p className="form-error-banner-text">{submitError}</p>
            </div>
          )}

          {formErrors.submit && (
            <div className="form-error-banner">
              <p className="form-error-banner-text">{formErrors.submit}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="submit"
              disabled={!isValid || isValidating}
              className="form-button form-button-primary"
            >
              {isSubmitting && (
                <svg
                  className="form-button-loading"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    style={{ opacity: 0.25 }}
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    style={{ opacity: 0.75 }}
                  />
                </svg>
              )}
              Submit
              {!isSubmitting && (
                <svg
                  className="form-button-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

