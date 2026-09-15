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

// Menus
export const getMenus = async (schoolId: number, params?: {
  start_date?: string;
  end_date?: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner';
}) => {
  const response = await apiClient.get(`/principal/mess/menus/${schoolId}`, { params });
  return response.data;
};

export const createMenu = async (data: {
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  items: string[];
  description?: string;
}) => {
  const response = await apiClient.post('/principal/mess/menus/create', data);
  return response.data;
};

export const updateMenu = async (menuId: number, data: {
  date?: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner';
  items?: string[];
  description?: string;
}) => {
  const response = await apiClient.put(`/principal/mess/menus/update/${menuId}`, data);
  return response.data;
};

export const deleteMenu = async (menuId: number) => {
  const response = await apiClient.delete(`/principal/mess/menus/delete/${menuId}`);
  return response.data;
};

// Bookings
export const getBookings = async (schoolId: number, params?: {
  start_date?: string;
  end_date?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'consumed';
  student_id?: number;
}) => {
  const response = await apiClient.get(`/principal/mess/bookings/${schoolId}`, { params });
  return response.data;
};

export const createBooking = async (data: {
  student_id: number;
  menu_id: number;
  booking_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  remarks?: string;
}) => {
  const response = await apiClient.post('/principal/mess/bookings/create', data);
  return response.data;
};

export const updateBookingStatus = async (bookingId: number, status: 'pending' | 'confirmed' | 'cancelled' | 'consumed') => {
  const response = await apiClient.put(`/principal/mess/bookings/update-status/${bookingId}`, { status });
  return response.data;
};

