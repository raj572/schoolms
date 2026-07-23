import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Library Statistics
export const getLibraryStatistics = async (schoolId: number) => {
  const response = await apiClient.get(`/library/statistics/${schoolId}`);
  return response.data;
};

// Books
export const getAllBooks = async (schoolId: number) => {
  const response = await apiClient.get(`/library/books/all/${schoolId}`);
  return response.data;
};

export const getAvailableBooks = async (schoolId: number) => {
  const response = await apiClient.get(`/library/books/available/${schoolId}`);
  return response.data;
};

export const searchBooks = async (schoolId: number, query: string) => {
  const response = await apiClient.get(`/library/books/search/${schoolId}?query=${query}`);
  return response.data;
};

export const getBook = async (id: number) => {
  const response = await apiClient.get(`/library/books/${id}`);
  return response.data;
};

export const createBook = async (data: any) => {
  const response = await apiClient.post(`/library/books/create`, data);
  return response.data;
};

export const updateBook = async (id: number, data: any) => {
  const response = await apiClient.put(`/library/books/update/${id}`, data);
  return response.data;
};

export const deleteBook = async (id: number) => {
  const response = await apiClient.delete(`/library/books/delete/${id}`);
  return response.data;
};

export const getCategories = async (schoolId: number) => {
  const response = await apiClient.get(`/library/categories/${schoolId}`);
  return response.data;
};

// Book Issues
export const issueBook = async (data: any) => {
  const response = await apiClient.post(`/library/issue`, data);
  return response.data;
};

export const returnBook = async (issueId: number, returnedTo: number, fineAmount?: number, remarks?: string) => {
  const response = await apiClient.post(`/library/return/${issueId}`, {
    returned_to: returnedTo,
    fine_amount: fineAmount,
    remarks: remarks
  });
  return response.data;
};

export const getAllIssues = async (schoolId: number) => {
  const response = await apiClient.get(`/library/issues/all/${schoolId}`);
  return response.data;
};

export const getActiveIssues = async (schoolId: number) => {
  const response = await apiClient.get(`/library/issues/active/${schoolId}`);
  return response.data;
};

export const getOverdueIssues = async (schoolId: number) => {
  const response = await apiClient.get(`/library/issues/overdue/${schoolId}`);
  return response.data;
};

export const extendDueDate = async (issueId: number, days: number) => {
  const response = await apiClient.post(`/library/issues/extend/${issueId}`, { days });
  return response.data;
};

