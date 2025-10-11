import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { 
  CorporationValidationResponse, 
  ProfileSubmissionResponse, 
  OnboardingFormData,
  ApiError 
} from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://fe-hometask-api.qa.vault.tryvault.com',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.message || 'An unexpected error occurred',
          status: error.response?.status,
        };
        console.error('API Error:', apiError);
        return Promise.reject(apiError);
      }
    );
  }

  async validateCorporationNumber(corporationNumber: string): Promise<CorporationValidationResponse> {
    try {
      const response = await this.client.get<CorporationValidationResponse>(
        `/corporation-number/${corporationNumber}`
      );
      return response.data;
    } catch (error) {
      // Error 400 === not a corp number
      if (error instanceof Error && 'status' in error && (error as ApiError).status === 400) {
        return {
          corporationNumber,
          valid: false,
          message: (error as ApiError).message,
        };
      }
      throw error;
    }
  }

  async submitProfileDetails(formData: OnboardingFormData): Promise<void> {
    await this.client.post<ProfileSubmissionResponse>('/profile-details', formData);
  }
}

export const apiService = new ApiService();
