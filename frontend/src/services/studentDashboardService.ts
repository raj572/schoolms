import axios from 'axios';
import { StudentDashboardResponse } from '@/types/student';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get complete dashboard data for a student
 */
export const getStudentDashboard = async (
  studentId: number,
  schoolId: number
): Promise<StudentDashboardResponse> => {
  try {
    const response = await apiClient.get(`/student/dashboard/${studentId}`, {
      params: { school_id: schoolId },
    });
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching student dashboard:', error);
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || error;
  }
};

/**
 * Get student info
 */
export const getStudentInfo = async (studentId: number): Promise<StudentDashboardResponse> => {
  try {
    const response = await apiClient.get(`/student/info/${studentId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching student info:', error);
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || error;
  }
};

/**
 * Get today's classes for a student
 */
export const getTodayClasses = async (
  studentId: number,
  schoolId: number
): Promise<StudentDashboardResponse> => {
  try {
    const response = await apiClient.get(`/student/today-classes/${studentId}`, {
      params: { school_id: schoolId },
    });
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching today\'s classes:', error);
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || error;
  }
};

/**
 * Get syllabus progress for a student
 */
export const getSyllabusProgress = async (
  studentId: number,
  schoolId: number
): Promise<StudentDashboardResponse> => {
  try {
    const response = await apiClient.get(`/student/syllabus-progress/${studentId}`, {
      params: { school_id: schoolId },
    });
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching syllabus progress:', error);
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || error;
  }
};

