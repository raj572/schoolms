import axios from 'axios';

import { API_BASE_URL } from '@/lib/axios';

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

export interface StudentProfile {
  id: number;
  username: string;
  email: string;
  school_id: number;
  status: string;
  role: string;
  created_at: string;
  candidate_name: string | null;
  class: string;
  section: string | null;
  roll_no: string | null;
  gender: string | null;
  dob: string | null;
  phone: string | null;
  address: string | null;
  father_name: string | null;
  mother_name: string | null;
  admission_date: string | null;
  addhar: string | null;
}

export interface ProfileResponse {
  status: boolean;
  message: string;
  data?: StudentProfile;
  error?: string;
}

export interface UpdatePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateProfileData {
  email?: string;
  phone?: string;
}

/**
 * Get student profile
 */
export const getStudentProfile = async (studentId: number): Promise<ProfileResponse> => {
  try {
    const response = await apiClient.get(`/student/profile/${studentId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching student profile:', error);
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || error;
  }
};

/**
 * Update student password
 */
export const updateStudentPassword = async (
  studentId: number,
  data: UpdatePasswordData
): Promise<ProfileResponse> => {
  try {
    const response = await apiClient.put(`/student/password/${studentId}`, data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error updating password:', error);
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || error;
  }
};

/**
 * Update student profile
 */
export const updateStudentProfile = async (
  studentId: number,
  data: UpdateProfileData
): Promise<ProfileResponse> => {
  try {
    const response = await apiClient.put(`/student/profile/${studentId}`, data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error updating profile:', error);
    const err = error as { response?: { data?: unknown } };
    throw err.response?.data || error;
  }
};

