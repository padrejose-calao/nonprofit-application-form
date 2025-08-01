import axios from 'axios';
// Import mock auth for development
import { mockLogin } from './mockAuth';

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
  (config: any) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  email: string;
  name: string;
  organization?: string;
  role: 'user' | 'admin' | 'reviewer';
  createdAt?: string;
  lastLogin?: string;
}

export interface Application {
  _id: string;
  userId: string;
  ein: string;
  orgName: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  formData: any;
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
        id: Date.now(),
        email: data.email,
        name: data.name,
        organization: data.organization,
        role: 'user',
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

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setAuthData: (token: string, user: User) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
};

// Applications API
export const applicationsAPI = {
  create: async (data: { ein: string; orgName: string; formData: any; progress: any }) => {
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

  update: async (id: string, data: { formData?: any; progress?: any; status?: string }) => {
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
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;
