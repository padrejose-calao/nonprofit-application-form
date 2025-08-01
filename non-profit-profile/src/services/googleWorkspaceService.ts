/**
 * Google Workspace Integration Service
 * Leverages Google Workspace features for nonprofit organizations
 * Including Sheets, Forms, Docs, and advanced Drive features
 */

import { toast } from 'react-hot-toast';
import { logger } from '../utils/logger';

// Google API interfaces
interface GapiAuth2 {
  getAuthInstance(): {
    isSignedIn: { get(): boolean };
    signIn(): Promise<void>;
    signOut(): Promise<void>;
  };
}

interface GapiClient {
  init(config: {
    apiKey: string;
    clientId: string;
    discoveryDocs: string[];
    scope: string;
  }): Promise<void>;
  sheets: {
    spreadsheets: {
      create(request: { properties: { title: string } }): Promise<{ result: { spreadsheetId: string } }>;
      values: {
        update(request: {
          spreadsheetId: string;
          range: string;
          valueInputOption: string;
          values: unknown[][];
        }): Promise<unknown>;
        get(request: {
          spreadsheetId: string;
          range: string;
        }): Promise<{ result: { values?: unknown[][] } }>;
      };
    };
  };
  drive: {
    files: {
      create(request: {
        resource: {
          name: string;
          mimeType: string;
          parents?: string[];
        };
        fields: string;
      }): Promise<{ result: { id: string; webViewLink?: string } }>;
      list(request: {
        q: string;
        fields: string;
        orderBy?: string;
        pageSize?: number;
      }): Promise<{ result: { files: Array<{ id: string; name: string; mimeType: string; webViewLink: string }> } }>;
    };
    permissions: {
      create(request: {
        fileId: string;
        resource: {
          type: string;
          role: string;
          domain?: string;
        };
      }): Promise<unknown>;
    };
    about: {
      get(request: { fields: string }): Promise<{ result: { storageQuota: { usage?: string; limit?: string } } }>;
    };
  };
  forms: {
    forms: {
      create(request: { info: { title: string; documentTitle: string } }): Promise<{ result: { formId: string } }>;
      batchUpdate(request: {
        formId: string;
        requests: Array<{
          createItem: {
            item: {
              title: string;
              questionItem: {
                question: {
                  required: boolean;
                  textQuestion: { paragraph: boolean };
                };
              };
            };
            location: { index: number };
          };
        }>;
      }): Promise<unknown>;
    };
  };
  docs: {
    documents: {
      create(request: { title: string }): Promise<{ result: { documentId: string } }>;
      batchUpdate(request: {
        documentId: string;
        requests: Array<{ insertText: { location: { index: number }; text: string } }>;
      }): Promise<unknown>;
    };
  };
}

interface GapiInstance {
  load(apis: string, callback: () => void): void;
  client: GapiClient;
  auth2: GapiAuth2;
}

declare global {
  interface Window {
    gapi: GapiInstance;
  }
}

interface WorkspaceConfig {
  clientId: string;
  apiKey: string;
  discoveryDocs: string[];
  scopes: string[];
}

interface GoogleForm {
  id: string;
  title: string;
  description?: string;
  publishedUrl?: string;
  editUrl?: string;
}

interface GoogleSheet {
  id: string;
  name: string;
  url: string;
  lastModified?: string;
}

interface GoogleDoc {
  id: string;
  name: string;
  url: string;
  mimeType: string;
}

class GoogleWorkspaceService {
  private initialized = false;
  private gapi: GapiInstance | null = null;
  private config: WorkspaceConfig;

  constructor() {
    this.config = {
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
      apiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
      discoveryDocs: [
        'https://sheets.googleapis.com/$discovery/rest?version=v4',
        'https://docs.googleapis.com/$discovery/rest?version=v1',
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
        'https://forms.googleapis.com/$discovery/rest?version=v1'
      ],
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/forms',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
      ]
    };
  }

  /**
   * Initialize Google Workspace APIs
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadGoogleAPIs();
      this.initialized = true;
      logger.debug('Google Workspace APIs initialized');
    } catch (error) {
      logger.error('Failed to initialize Google Workspace:', error);
      throw error;
    }
  }

  /**
   * Load Google APIs script
   */
  private loadGoogleAPIs(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              apiKey: this.config.apiKey,
              clientId: this.config.clientId,
              discoveryDocs: this.config.discoveryDocs,
              scope: this.config.scopes.join(' ')
            });
            this.gapi = window.gapi;
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    return this.gapi?.auth2?.getAuthInstance()?.isSignedIn?.get() || false;
  }

  /**
   * Sign in to Google Workspace
   */
  async signIn(): Promise<void> {
    if (!this.initialized) await this.initialize();
    
    if (!this.gapi) {
      throw new Error('Google API not initialized');
    }
    
    const authInstance = (this.gapi as any).auth2.getAuthInstance();
    await authInstance.signIn();
  }

  /**
   * Sign out from Google Workspace
   */
  /**
   * Get GAPI instance with null check
   */
  private getGapi(): GapiInstance {
    if (!this.gapi) {
      throw new Error('Google API not initialized. Please call initialize() first.');
    }
    return this.gapi;
  }

  async signOut(): Promise<void> {
    const authInstance = this.gapi?.auth2?.getAuthInstance();
    if (authInstance) {
      await authInstance.signOut();
    }
  }

  /**
   * Create a Google Sheet for data export
   */
  async createSheet(title: string, data: unknown[][]): Promise<GoogleSheet> {
    try {
      // Create new spreadsheet
      const response = await this.getGapi().client.sheets.spreadsheets.create({
        properties: {
          title: title
        }
      });

      const spreadsheetId = response.result.spreadsheetId;

      // Add data to the sheet
      if (data.length > 0) {
        await this.getGapi().client.sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheetId,
          range: 'A1',
          valueInputOption: 'USER_ENTERED',
          values: data
        });
      }

      // Set permissions to anyone with link can view
      await this.getGapi().client.drive.permissions.create({
        fileId: spreadsheetId,
        resource: {
          type: 'anyone',
          role: 'reader'
        }
      });

      return {
        id: spreadsheetId,
        name: title,
        url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
      };
    } catch (error) {
      logger.error('Failed to create sheet:', error);
      throw error;
    }
  }

  /**
   * Export form data to Google Sheets
   */
  async exportToSheets(formData: Record<string, unknown>, profileName: string): Promise<GoogleSheet> {
    const timestamp = new Date().toISOString();
    const title = `${profileName} - Export ${timestamp}`;

    // Convert form data to rows
    const rows: unknown[][] = [['Field', 'Value', 'Last Updated']];
    
    const flattenObject = (obj: Record<string, unknown>, prefix = ''): void => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const fieldName = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flattenObject(value as Record<string, unknown>, fieldName);
        } else {
          rows.push([
            fieldName,
            Array.isArray(value) ? value.join(', ') : String(value || ''),
            timestamp
          ]);
        }
      });
    };

    flattenObject(formData);
    
    const sheet = await this.createSheet(title, rows);
    toast.success('Data exported to Google Sheets');
    return sheet;
  }

  /**
   * Create a Google Form for data collection
   */
  async createForm(title: string, fields: Array<{name: string, type: string, required: boolean}>): Promise<GoogleForm> {
    try {
      // Create form using Google Forms API
      const form = await this.getGapi().client.forms.forms.create({
        info: {
          title: title,
          documentTitle: title
        }
      });

      const formId = form.result.formId;

      // Add fields to the form
      const requests = fields.map((field, index) => ({
        createItem: {
          item: {
            title: field.name,
            questionItem: {
              question: {
                required: field.required,
                textQuestion: {
                  paragraph: field.type === 'textarea'
                }
              }
            }
          },
          location: { index }
        }
      }));

      if (requests.length > 0) {
        await this.getGapi().client.forms.forms.batchUpdate({
          formId: formId,
          requests: requests
        });
      }

      return {
        id: formId,
        title: title,
        editUrl: `https://docs.google.com/forms/d/${formId}/edit`,
        publishedUrl: `https://docs.google.com/forms/d/e/${formId}/viewform`
      };
    } catch (error) {
      logger.error('Failed to create form:', error);
      throw error;
    }
  }

  /**
   * Create a Google Doc template
   */
  async createDocTemplate(title: string, content: string): Promise<GoogleDoc> {
    try {
      // Create new document
      const doc = await this.getGapi().client.docs.documents.create({
        title: title
      });

      const documentId = doc.result.documentId;

      // Add content to the document
      if (content) {
        const requests = [{
          insertText: {
            location: { index: 1 },
            text: content
          }
        }];

        await this.getGapi().client.docs.documents.batchUpdate({
          documentId: documentId,
          requests: requests
        });
      }

      return {
        id: documentId,
        name: title,
        url: `https://docs.google.com/document/d/${documentId}/edit`,
        mimeType: 'application/vnd.google-apps.document'
      };
    } catch (error) {
      logger.error('Failed to create document:', error);
      throw error;
    }
  }

  /**
   * Create organization folder structure in Google Drive
   */
  async createOrganizationStructure(orgName: string): Promise<{folderId: string, structure: Record<string, unknown>}> {
    try {
      // Create main organization folder
      const mainFolder = await this.getGapi().client.drive.files.create({
        resource: {
          name: orgName,
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id, webViewLink'
      });

      const mainFolderId = mainFolder.result.id;

      // Create subfolders
      const subfolders = [
        'Documents',
        'Forms & Applications',
        'Reports & Analytics',
        'Board Materials',
        'Financial Records',
        'Program Documentation',
        'Communications',
        'Compliance & Legal'
      ];

      const structure: {
        id: string;
        name: string;
        folders: Record<string, string>;
      } = {
        id: mainFolderId,
        name: orgName,
        folders: {}
      };

      for (const folderName of subfolders) {
        const subfolder = await this.getGapi().client.drive.files.create({
          resource: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [mainFolderId]
          },
          fields: 'id'
        });

        structure.folders[folderName] = subfolder.result.id;
      }

      // Set permissions for organization access
      await this.getGapi().client.drive.permissions.create({
        fileId: mainFolderId,
        resource: {
          type: 'domain',
          role: 'reader',
          domain: 'your-nonprofit-domain.org' // Replace with actual domain
        }
      });

      return {
        folderId: mainFolderId,
        structure: structure as Record<string, unknown>
      };
    } catch (error) {
      logger.error('Failed to create organization structure:', error);
      throw error;
    }
  }

  /**
   * Import data from Google Sheets
   */
  async importFromSheets(spreadsheetId: string, range: string = 'A:Z'): Promise<unknown[][]> {
    try {
      const response = await this.getGapi().client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range
      });

      return response.result.values || [];
    } catch (error) {
      logger.error('Failed to import from sheets:', error);
      throw error;
    }
  }

  /**
   * Search files in Google Drive
   */
  async searchFiles(query: string, mimeType?: string): Promise<GoogleDoc[]> {
    try {
      let q = `name contains '${query}'`;
      if (mimeType) {
        q += ` and mimeType='${mimeType}'`;
      }
      q += ' and trashed=false';

      const response = await this.getGapi().client.drive.files.list({
        q: q,
        fields: 'files(id, name, mimeType, webViewLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 20
      });

      return response.result.files.map((file) => ({
        id: file.id,
        name: file.name,
        url: file.webViewLink,
        mimeType: file.mimeType
      }));
    } catch (error) {
      logger.error('Failed to search files:', error);
      throw error;
    }
  }

  /**
   * Get workspace quota information
   */
  async getQuotaInfo(): Promise<{used: number, limit: number, unlimited: boolean}> {
    try {
      const response = await this.getGapi().client.drive.about.get({
        fields: 'storageQuota'
      });

      const quota = response.result.storageQuota;
      
      return {
        used: parseInt(quota.usage || '0'),
        limit: parseInt(quota.limit || '0'),
        unlimited: !quota.limit || quota.limit === '-1'
      };
    } catch (error) {
      logger.error('Failed to get quota info:', error);
      throw error;
    }
  }
}

export const googleWorkspaceService = new GoogleWorkspaceService();