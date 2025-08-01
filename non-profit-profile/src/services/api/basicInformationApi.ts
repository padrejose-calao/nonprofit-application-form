import { BasicInformationFormData } from '../../components/BasicInformation2/types';
import { isDevelopment } from '../../config';
import { MockBasicInformationApi } from './mockBasicInformationApi';
import { netlifySettingsService } from '../netlifySettingsService';
import { logger } from '../../utils/logger';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
const USE_MOCK_API = isDevelopment() && !process.env.REACT_APP_USE_REAL_API;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SaveResponse {
  id: string;
  updatedAt: string;
  version: number;
}

export class BasicInformationApi {
  private static async getHeaders(): Promise<HeadersInit> {
    const token = await netlifySettingsService.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  private static async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data || data
    };
  }

  /**
   * Save basic information data
   */
  static async save(data: BasicInformationFormData): Promise<ApiResponse<SaveResponse>> {
    if (USE_MOCK_API) {
      return MockBasicInformationApi.save(data);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/organizations/basic-information`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify(data)
      });

      return await this.handleResponse<SaveResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save data'
      };
    }
  }

  /**
   * Get basic information data
   */
  static async get(organizationId?: string): Promise<ApiResponse<BasicInformationFormData>> {
    if (USE_MOCK_API) {
      return MockBasicInformationApi.get(organizationId);
    }

    try {
      const url = organizationId 
        ? `${API_BASE_URL}/organizations/${organizationId}/basic-information`
        : `${API_BASE_URL}/organizations/basic-information`;

      const response = await fetch(url, {
        method: 'GET',
        headers: await this.getHeaders()
      });

      return await this.handleResponse<BasicInformationFormData>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      };
    }
  }

  /**
   * Update basic information data
   */
  static async update(data: Partial<BasicInformationFormData>, organizationId?: string): Promise<ApiResponse<SaveResponse>> {
    if (USE_MOCK_API) {
      return MockBasicInformationApi.update(data, organizationId);
    }

    try {
      const url = organizationId 
        ? `${API_BASE_URL}/organizations/${organizationId}/basic-information`
        : `${API_BASE_URL}/organizations/basic-information`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: await this.getHeaders(),
        body: JSON.stringify(data)
      });

      return await this.handleResponse<SaveResponse>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update data'
      };
    }
  }

  /**
   * Auto-save basic information data (debounced)
   */
  static async autoSave(data: BasicInformationFormData): Promise<ApiResponse<SaveResponse>> {
    if (USE_MOCK_API) {
      return MockBasicInformationApi.autoSave(data);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/organizations/basic-information/auto-save`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({
          data,
          timestamp: new Date().toISOString()
        })
      });

      return await this.handleResponse<SaveResponse>(response);
    } catch (error) {
      // Auto-save failures should be silent
      logger.error('Auto-save failed:', error);
      return {
        success: false,
        error: 'Auto-save failed'
      };
    }
  }

  /**
   * Export basic information data
   */
  static async export(format: 'pdf' | 'json' | 'csv', hideEmptyFields: boolean = false): Promise<ApiResponse<Blob>> {
    if (USE_MOCK_API) {
      return MockBasicInformationApi.export(format, hideEmptyFields);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/organizations/basic-information/export`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({ format, hideEmptyFields })
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      const blob = await response.blob();
      return {
        success: true,
        data: blob
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export data'
      };
    }
  }

  /**
   * Upload document for a specific section
   */
  static async uploadDocument(file: File, section: string, fieldName: string): Promise<ApiResponse<{ url: string; id: string }>> {
    if (USE_MOCK_API) {
      return MockBasicInformationApi.uploadDocument(file, section, fieldName);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('section', section);
      formData.append('fieldName', fieldName);

      const token = await netlifySettingsService.getAuthToken();
      const response = await fetch(`${API_BASE_URL}/organizations/documents/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      return await this.handleResponse<{ url: string; id: string }>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload document'
      };
    }
  }

  /**
   * Delete document
   */
  static async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    if (USE_MOCK_API) {
      return MockBasicInformationApi.deleteDocument(documentId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/organizations/documents/${documentId}`, {
        method: 'DELETE',
        headers: await this.getHeaders()
      });

      return await this.handleResponse<void>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete document'
      };
    }
  }

  /**
   * Validate section data
   */
  static async validateSection(section: string, data: unknown): Promise<ApiResponse<{ valid: boolean; errors?: Record<string, string> }>> {
    if (USE_MOCK_API) {
      return MockBasicInformationApi.validateSection(section, data);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/organizations/basic-information/validate`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({ section, data })
      });

      return await this.handleResponse<{ valid: boolean; errors?: Record<string, string> }>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate data'
      };
    }
  }
}