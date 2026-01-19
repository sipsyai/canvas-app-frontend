import { apiClient } from './client';

// Application Types
export interface Application {
  id: string;
  name: string;
  label: string | null;
  description: string | null;
  icon: string | null;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by: string;
  published_at: string | null;
}

export interface CreateApplicationData {
  name: string;
  label?: string;
  description?: string;
  icon?: string;
  config?: Record<string, any>;
}

export interface UpdateApplicationData {
  name?: string;
  label?: string;
  description?: string;
  icon?: string;
  config?: Record<string, any>;
}

// API Functions
export const applicationsApi = {
  // List all applications
  list: async (params?: { skip?: number; limit?: number }): Promise<Application[]> => {
    const response = await apiClient.get<Application[]>('/api/applications', { params });
    return response.data;
  },

  // Create new application
  create: async (data: CreateApplicationData): Promise<Application> => {
    const response = await apiClient.post<Application>('/api/applications', data);
    return response.data;
  },

  // Get single application
  get: async (appId: string): Promise<Application> => {
    const response = await apiClient.get<Application>(`/api/applications/${appId}`);
    return response.data;
  },

  // Update application
  update: async (appId: string, data: UpdateApplicationData): Promise<Application> => {
    const response = await apiClient.patch<Application>(`/api/applications/${appId}`, data);
    return response.data;
  },

  // Publish application
  publish: async (appId: string): Promise<Application> => {
    const response = await apiClient.post<Application>(`/api/applications/${appId}/publish`);
    return response.data;
  },

  // Delete application
  delete: async (appId: string): Promise<void> => {
    await apiClient.delete(`/api/applications/${appId}`);
  },
};
