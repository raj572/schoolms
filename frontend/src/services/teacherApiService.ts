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

// ==================== TEACHER DASHBOARD ====================

export interface TodayClass {
  id: number;
  start_time: string;
  end_time: string;
  subject_name: string; // This matches the 'subject_name' column from school_subjects table
  class: string;
  section: string;
  room_no: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface TimetableEntry {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject_name: string;
  class: string;
  section: string;
  room_no: string | null;
}

export interface WeeklyTimetable {
  Monday: TimetableEntry[];
  Tuesday: TimetableEntry[];
  Wednesday: TimetableEntry[];
  Thursday: TimetableEntry[];
  Friday: TimetableEntry[];
  Saturday: TimetableEntry[];
  Sunday: TimetableEntry[];
}

export interface TeacherDashboardStats {
  classes_today: number;
  total_students: number;
  assigned_classes: number;
  attendance: {
    total_days: number;
    present_days: number;
    absent_days: number;
    attendance_percentage: number;
  };
}

/**
 * Get teacher's full week timetable
 */
export const getWeeklyTimetable = async (teacherId: number, schoolId: number) => {
  try {
    const response = await apiClient.get(`/teacher/weekly-timetable/${teacherId}/${schoolId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly timetable:', error);
    throw error;
  }
};

/**
 * Get today's classes for a teacher
 */
export const getTodayClasses = async (teacherId: number, schoolId: number) => {
  try {
    const response = await apiClient.get(`/teacher/today-classes/${teacherId}/${schoolId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching today\'s classes:', error);
    throw error;
  }
};

/**
 * Get teacher dashboard statistics
 */
export const getTeacherDashboardStats = async (teacherId: number, schoolId: number) => {
  try {
    const response = await apiClient.get(`/teacher/dashboard-stats/${teacherId}/${schoolId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export interface AssignedClass {
  class_id: number;
  class_name: string;
  section: string;
  room_no: string;
  student_count: number;
  subjects: Array<{
    subject_id: number;
    subject_name: string;
  }>;
  schedule: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
  }>;
  next_class: {
    day_of_week: string;
    start_time: string;
  } | null;
}

/**
 * Get all classes assigned to a teacher
 */
export const getTeacherAssignedClasses = async (teacherId: number, schoolId: number) => {
  try {
    const response = await apiClient.get(`/teacher/assigned-classes/${teacherId}/${schoolId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned classes:', error);
    throw error;
  }
};

/**
 * Get class details for a teacher
 */
export const getTeacherClassDetails = async (teacherId: number, schoolId: number, classId: number) => {
  try {
    const response = await apiClient.get(`/teacher/class-details/${teacherId}/${schoolId}/${classId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching class details:', error);
    throw error;
  }
};

/**
 * Get students list for a class
 */
export const getStudentDetailsList = async (data: { school_id: number; class: string; section: string }) => {
  try {
    const response = await apiClient.post('/teacher/student-details', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching student details:', error);
    throw error;
  }
};

/**
 * Update student attendance
 */
export const updateStudentAttendance = async (data: {
  school_id: number;
  class: {
    id: number;
    class: string;
    section: string | null;
  };
  section: string;
  date: string;
  attendance: Array<{
    student_id: number;
    status: 'present' | 'absent' | 'leave' | 'late';
    remarks?: string;
  }>;
}) => {
  try {
    const response = await apiClient.post('/teacher/attendance/update', data);
    return response.data;
  } catch (error) {
    console.error('Error updating attendance:', error);
    throw error;
  }
};

// ==================== TEACHER PROFILE ====================

export interface TeacherProfile {
  id: number;
  school_id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  qualification: string;
  employee_code: string;
  address: string;
  city: string;
  state: string;
  status: string;
  created_at: string;
  subjects: Array<{
    id: number;
    teacher_id: number;
    class_id: number;
    subject_id: number;
    class: {
      id: number;
      class: string;
      section: string;
    };
    subject: {
      id: number;
      subject_name: string;
      description?: string;
    };
  }>;
}

/**
 * Get teacher profile details
 */
export const getTeacherProfile = async (teacherId: number) => {
  try {
    const response = await apiClient.get(`/teacher/get/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    throw error;
  }
};

/**
 * Update teacher profile
 */
export const updateTeacherProfile = async (teacherId: number, data: {
  name?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  qualification?: string;
}) => {
  try {
    const response = await apiClient.put(`/teacher/update-profile/${teacherId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating teacher profile:', error);
    throw error;
  }
};

/**
 * Update teacher password
 */
export const updateTeacherPassword = async (teacherId: number, data: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}) => {
  try {
    const response = await apiClient.put(`/teacher/update-password/${teacherId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating teacher password:', error);
    throw error;
  }
};

