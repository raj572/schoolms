import axios from 'axios';

import { API_BASE_URL } from '@/lib/axios';

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

export interface SyllabusCompletion {
  id: number;
  class_id: number;
  class_name: string;
  section: string;
  subject_id: number;
  subject_name: string;
  total_chapters: number;
  completed_chapters: number;
  completion_percentage: number;
  last_updated: string | null;
  remarks?: string;
}

export interface CompletionHistory {
  recorded_date: string;
  completed_chapters: number;
  completion_percentage: number;
}

export interface PrincipalOverview {
  statistics: {
    total_subjects: number;
    average_completion: number;
    completed_subjects: number;
    behind_schedule: number;
  };
  classwise: Array<{
    class_id: number;
    class_name: string;
    section: string;
    total_subjects: number;
    average_completion: number;
  }>;
  subjectwise: Array<{
    subject_id: number;
    subject_name: string;
    total_classes: number;
    average_completion: number;
  }>;
  teacherwise: Array<{
    teacher_id: number;
    teacher_name: string;
    total_subjects: number;
    average_completion: number;
  }>;
}

export interface DetailedView {
  id: number;
  teacher_id: number;
  teacher_name: string;
  class_id: number;
  class_name: string;
  section: string;
  subject_id: number;
  subject_name: string;
  total_chapters: number;
  completed_chapters: number;
  completion_percentage: number;
  last_updated: string | null;
  remarks?: string;
}

/**
 * Get all syllabus completions for logged-in teacher
 */
export const getTeacherCompletion = async () => {
  try {
    const response = await apiClient.get('/teacher/syllabus/completion');
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher completion:', error);
    throw error;
  }
};

/**
 * Get specific completion details
 */
export const getCompletionDetails = async (classId: number, subjectId: number) => {
  try {
    const response = await apiClient.get(`/teacher/syllabus/completion/${classId}/${subjectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching completion details:', error);
    throw error;
  }
};

/**
 * Update syllabus completion
 */
export const updateCompletion = async (data: {
  class_id: number;
  subject_id: number;
  total_chapters: number;
  completed_chapters: number;
  remarks?: string;
}) => {
  try {
    const response = await apiClient.post('/teacher/syllabus/completion', data);
    return response.data;
  } catch (error) {
    console.error('Error updating completion:', error);
    throw error;
  }
};

/**
 * Get completion history
 */
export const getCompletionHistory = async (classId: number, subjectId: number) => {
  try {
    const response = await apiClient.get(`/teacher/syllabus/history/${classId}/${subjectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};

/**
 * Get principal overview
 */
export const getPrincipalOverview = async () => {
  try {
    const response = await apiClient.get('/principal/syllabus/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching overview:', error);
    throw error;
  }
};

/**
 * Get principal detailed view with filters
 */
export const getPrincipalDetailedView = async (filters?: {
  teacher_id?: number;
  class_id?: number;
  subject_id?: number;
}) => {
  try {
    const response = await apiClient.get('/principal/syllabus/detailed', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching detailed view:', error);
    throw error;
  }
};

/**
 * Get syllabus completion for a specific teacher (for principal view)
 */
export const getTeacherCompletionForPrincipal = async (teacherId: number) => {
  try {
    const response = await apiClient.get(`/principal/syllabus/teacher/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher completion:', error);
    throw error;
  }
};

