import { BasicInformationFormData } from '../../components/BasicInformation2/types';
import { ApiResponse, SaveResponse } from './basicInformationApi';
import { storageService } from '../storageService';

// Mock data storage
const STORAGE_KEY = 'nonprofit_basic_information';

export class MockBasicInformationApi {
  private static delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static async getStoredData(): Promise<BasicInformationFormData | null> {
    const stored = await storageService.get(STORAGE_KEY);
    return stored || null;
  }

  private static async setStoredData(data: BasicInformationFormData): Promise<void> {
    await storageService.set(STORAGE_KEY, data);
  }

  static async save(data: BasicInformationFormData): Promise<ApiResponse<SaveResponse>> {
    await this.delay();
    
    try {
      await this.setStoredData(data);
      
      return {
        success: true,
        data: {
          id: `org-${Date.now()}`,
          updatedAt: new Date().toISOString(),
          version: 1
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to save data to local storage'
      };
    }
  }

  static async get(organizationId?: string): Promise<ApiResponse<BasicInformationFormData>> {
    await this.delay();
    
    try {
      const data = await this.getStoredData();
      
      if (data) {
        return {
          success: true,
          data
        };
      }
      
      // Return empty data if none exists
      return {
        success: true,
        data: null as any
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load data from local storage'
      };
    }
  }

  static async update(data: Partial<BasicInformationFormData>, organizationId?: string): Promise<ApiResponse<SaveResponse>> {
    await this.delay();
    
    try {
      const existing = await this.getStoredData();
      const updated = { ...existing, ...data } as BasicInformationFormData;
      await this.setStoredData(updated);
      
      return {
        success: true,
        data: {
          id: organizationId || `org-${Date.now()}`,
          updatedAt: new Date().toISOString(),
          version: 2
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update data in local storage'
      };
    }
  }

  static async autoSave(data: BasicInformationFormData): Promise<ApiResponse<SaveResponse>> {
    // Shorter delay for auto-save
    await this.delay(100);
    
    return this.save(data);
  }

  static async export(format: 'pdf' | 'json' | 'csv', hideEmptyFields: boolean = false): Promise<ApiResponse<Blob>> {
    await this.delay();
    
    try {
      const data = await this.getStoredData();
      
      if (!data) {
        return {
          success: false,
          error: 'No data to export'
        };
      }

      let content: string;
      let mimeType: string;

      switch (format) {
        case 'json':
          content = JSON.stringify(data, null, 2);
          mimeType = 'application/json';
          break;
          
        case 'csv':
          // Simple CSV conversion
          content = this.convertToCSV(data);
          mimeType = 'text/csv';
          break;
          
        case 'pdf':
          // For PDF, we'll just create a text representation
          content = this.convertToPDFText(data);
          mimeType = 'text/plain'; // Would be application/pdf with real PDF generation
          break;
          
        default:
          return {
            success: false,
            error: 'Invalid export format'
          };
      }

      const blob = new Blob([content], { type: mimeType });
      return {
        success: true,
        data: blob
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to export data'
      };
    }
  }

  static async uploadDocument(file: File, section: string, fieldName: string): Promise<ApiResponse<{ url: string; id: string }>> {
    await this.delay(500);
    
    try {
      // Create a mock URL using FileReader
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Store document info
      const docId = `doc-${Date.now()}`;
      const docInfo = {
        id: docId,
        name: file.name,
        size: file.size,
        type: file.type,
        section,
        fieldName,
        uploadedAt: new Date().toISOString(),
        dataUrl
      };

      // Store in localStorage
      const docs = (await storageService.get('nonprofit_documents')) || [];
      docs.push(docInfo);
      await storageService.set('nonprofit_documents', docs);

      return {
        success: true,
        data: {
          url: dataUrl,
          id: docId
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to upload document'
      };
    }
  }

  static async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    await this.delay();
    
    try {
      const docs = (await storageService.get('nonprofit_documents')) || [];
      const filtered = docs.filter((doc: unknown) => (doc as any).id !== documentId);
      await storageService.set('nonprofit_documents', filtered);
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete document'
      };
    }
  }

  static async validateSection(section: string, data: unknown): Promise<ApiResponse<{ valid: boolean; errors?: Record<string, string> }>> {
    await this.delay(100);
    
    // Simple validation logic
    const errors: Record<string, string> = {};
    
    // Add validation rules based on section
    if (section === 'taxIdentification' && !(data as any).ein) {
      errors.ein = 'EIN is required';
    }
    
    return {
      success: true,
      data: {
        valid: Object.keys(errors).length === 0,
        errors: Object.keys(errors).length > 0 ? errors : undefined
      }
    };
  }

  private static convertToCSV(data: unknown): string {
    // Simple CSV conversion - flatten the object
    const rows: string[] = ['Field,Value'];
    
    const flattenObject = (obj: unknown, prefix = ''): void => {
      Object.keys(obj as any).forEach(key => {
        const value = (obj as any)[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flattenObject(value, newKey);
        } else if (Array.isArray(value)) {
          rows.push(`"${newKey}","${value.join(', ')}"`);
        } else {
          rows.push(`"${newKey}","${value || ''}"`);
        }
      });
    };
    
    flattenObject(data);
    return rows.join('\n');
  }

  private static convertToPDFText(data: unknown): string {
    // Simple text representation for mock PDF
    let text = 'BASIC INFORMATION FORM\n';
    text += '======================\n\n';
    
    const formatSection = (obj: unknown, indent = ''): string => {
      let result = '';
      
      Object.keys(obj as any).forEach(key => {
        const value = (obj as any)[key];
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          result += `${indent}${label}:\n`;
          result += formatSection(value, indent + '  ');
        } else if (Array.isArray(value)) {
          result += `${indent}${label}: ${value.join(', ')}\n`;
        } else if (value) {
          result += `${indent}${label}: ${value}\n`;
        }
      });
      
      return result;
    };
    
    text += formatSection(data);
    return text;
  }
}