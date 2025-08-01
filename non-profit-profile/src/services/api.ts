import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
// Import mock auth for development
import { mockLogin } from './mockAuth';
import { netlifySettingsService } from './netlifySettingsService';

// Enhanced type definitions
interface ApplicationFormData {
  [key: string]: unknown;
}

interface ApplicationProgress {
  basicInfo: number;
  narrative: number;
  governance: number;
  management: number;
  financials: number;
  programs: number;
  impact: number;
  compliance: number;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await netlifySettingsService.getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await netlifySettingsService.remove('authToken');
      await netlifySettingsService.remove('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  organization?: string;
  role: 'user' | 'admin' | 'reviewer';
  createdAt?: string;
  lastLogin?: string;
  [key: string]: unknown;
}

export interface Application {
  _id: string;
  userId: string;
  ein: string;
  orgName: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  formData: ApplicationFormData;
  files: Array<{
    fieldName: string;
    originalName: string;
    filename: string;
    path: string;
    size: number;
    uploadedAt: Date;
  }>;
  progress: {
    basicInfo: number;
    narrative: number;
    governance: number;
    management: number;
    financials: number;
    programs: number;
    impact: number;
    compliance: number;
  };
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationStats {
  totalApplications: number;
  submittedApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalUsers: number;
  monthlyStats: Array<{
    _id: { year: number; month: number };
    count: number;
  }>;
}

// Authentication API
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    organization: string;
  }) => {
    // Mock implementation for development
    return {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: Date.now().toString(),
        email: data.email,
        name: data.name,
        organization: data.organization,
        role: 'user' as 'user' | 'admin' | 'reviewer',
      },
    };
    // const response = await api.post('/auth/register', data);
    // return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    // Mock implementation for development
    const result = mockLogin(data.email, data.password);
    if (result.success) {
      return result;
    }
    throw new Error(result.error || 'Login failed');
    // const response = await api.post('/auth/login', data);
    // return response.data;
  },

  logout: async () => {
    await netlifySettingsService.remove('authToken');
    await netlifySettingsService.remove('user');
  },

  getCurrentUser: async (): Promise<User | null> => {
    const user = await netlifySettingsService.getUserSession();
    return user as User | null;
  },

  setAuthData: async (token: string, user: User) => {
    await netlifySettingsService.setAuthToken(token);
    await netlifySettingsService.setUserSession(user);
  },
};

// Applications API
export const applicationsAPI = {
  create: async (data: { ein: string; orgName: string; formData: ApplicationFormData; progress: ApplicationProgress }) => {
    const response = await api.post('/applications', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/applications');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  update: async (id: string, data: { formData?: ApplicationFormData; progress?: ApplicationProgress; status?: string }) => {
    const response = await api.put(`/applications/${id}`, data);
    return response.data;
  },

  submit: async (id: string) => {
    const response = await api.post(`/applications/${id}/submit`);
    return response.data;
  },

  uploadFiles: async (id: string, files: File[], fieldName: string) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('fieldName', fieldName);

    const response = await api.post(`/applications/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteFile: async (id: string, filename: string) => {
    const response = await api.delete(`/applications/${id}/files/${filename}`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getAllApplications: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/admin/applications', { params });
    return response.data;
  },

  reviewApplication: async (id: string, data: { status: string; reviewNotes?: string }) => {
    const response = await api.put(`/admin/applications/${id}/review`, data);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  updateUserRole: async (id: string, role: string) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  getStats: async (): Promise<ApplicationStats> => {
    const response = await api.get('/admin/stats');
    return response.data as ApplicationStats;
  },
};

// Utility functions
export const apiUtils = {
  downloadFile: async (filePath: string, filename: string) => {
    const response = await api.get(`/files/${filePath}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  generatePDF: async (applicationId: string) => {
    const response = await api.get(`/applications/${applicationId}/pdf`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `application-${applicationId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  exportData: async (format: 'csv' | 'excel' | 'json') => {
    const response = await api.get(`/admin/export?format=${format}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `applications-export.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

// Error handling
export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object') {
    const axiosError = error as AxiosError<{ error?: string }>;
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;
