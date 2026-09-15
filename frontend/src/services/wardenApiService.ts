import axios from 'axios';

import { API_BASE_URL } from '@/lib/axios';

const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all wardens
export const getAllWardens = async () => {
  const response = await apiClient.get('/principal/wardens/');
  return response.data;
};

// Get paginated wardens
export const getPaginatedWardens = async (params: { per_page?: number; page?: number; search?: string; status?: string }) => {
  const response = await apiClient.get('/principal/wardens/paginated', { params });
  return response.data;
};

// Get unassigned wardens
export const getUnassignedWardens = async () => {
  const response = await apiClient.get('/principal/wardens/unassigned');
  return response.data;
};

// Get warden by ID
export const getWarden = async (wardenId: number) => {
  const response = await apiClient.get(`/principal/wardens/${wardenId}`);
  return response.data;
};

// Create warden
export const createWarden = async (data: {
  full_name: string;
  email: string;
  phone: string;
  username: string;
  status?: string;
}) => {
  const response = await apiClient.post('/principal/wardens/create', data);
  return response.data;
};

// Update warden
export const updateWarden = async (wardenId: number, data: {
  full_name?: string;
  email?: string;
  phone?: string;
  username?: string;
  status?: string;
}) => {
  const response = await apiClient.put(`/principal/wardens/update/${wardenId}`, data);
  return response.data;
};

// Delete warden
export const deleteWarden = async (wardenId: number) => {
  const response = await apiClient.delete(`/principal/wardens/delete/${wardenId}`);
  return response.data;
};

// Toggle warden status
export const toggleWardenStatus = async (wardenId: number) => {
  const response = await apiClient.patch(`/principal/wardens/toggle-status/${wardenId}`);
  return response.data;
};

// Reset warden password
export const resetWardenPassword = async (wardenId: number) => {
  const response = await apiClient.post(`/principal/wardens/reset-password/${wardenId}`);
  return response.data;
};

