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

// Transport Statistics
export const getTransportStatistics = async (schoolId: number) => {
  const response = await apiClient.get(`/principal/transport/statistics/${schoolId}`);
  return response.data;
};

// Bus Management
export const getAllBuses = async (schoolId: number) => {
  const response = await apiClient.get(`/principal/transport/buses/all/${schoolId}`);
  return response.data;
};

export const getBus = async (busId: number) => {
  const response = await apiClient.get(`/principal/transport/buses/${busId}`);
  return response.data;
};

export const createBus = async (data: any) => {
  const response = await apiClient.post(`/principal/transport/buses/create`, data);
  return response.data;
};

export const updateBus = async (busId: number, data: any) => {
  const response = await apiClient.put(`/principal/transport/buses/update/${busId}`, data);
  return response.data;
};

export const deleteBus = async (busId: number) => {
  const response = await apiClient.delete(`/principal/transport/buses/delete/${busId}`);
  return response.data;
};

// Transport Assignments
export const getAssignments = async (schoolId: number) => {
  const response = await apiClient.get(`/principal/transport/assignments/all/${schoolId}`);
  return response.data;
};

export const getStudentsOnBus = async (busId: number) => {
  const response = await apiClient.get(`/principal/transport/assignments/bus/${busId}`);
  return response.data;
};

export const assignStudent = async (data: any) => {
  const response = await apiClient.post(`/principal/transport/assignments/create`, data);
  return response.data;
};

export const updateAssignment = async (assignmentId: number, data: any) => {
  const response = await apiClient.put(`/principal/transport/assignments/update/${assignmentId}`, data);
  return response.data;
};

export const removeAssignment = async (assignmentId: number) => {
  const response = await apiClient.delete(`/principal/transport/assignments/delete/${assignmentId}`);
  return response.data;
};

