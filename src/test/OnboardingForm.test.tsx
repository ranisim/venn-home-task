import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OnboardingForm } from '../components/OnboardingForm';

vi.mock('../services/api', () => ({
  apiService: {
    validateCorporationNumber: vi.fn(),
    submitProfileDetails: vi.fn(),
  },
}));


describe('OnboardingForm Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the form with all required fields', () => {
    render(<OnboardingForm />);
    
    expect(screen.getByText('Onboarding Form')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/corporation number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

});
