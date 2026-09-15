import axios from 'axios';
import { toast } from 'sonner';

import { API_BASE_URL } from '@/lib/axios';

// Get auth token
const getAuthToken = (): string => {
  return localStorage.getItem('token') || '';
};

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

// ===================== TYPES =====================
export interface StudentAttendanceData {
  student_id: number;
  status: 'present' | 'absent' | 'late' | 'half_day';
  remarks?: string;
}

export interface MarkAttendancePayload {
  attendance_date: string;
  class_id?: number;
  subject_id?: number;
  period_number?: number;
  attendance_type: 'quick' | 'period' | 'class';
  students: StudentAttendanceData[];
}

export interface BulkMarkPayload {
  attendance_date: string;
  class_id: number;
  status: 'present' | 'absent';
  period_number?: number;
  subject_id?: number;
}

export interface TeacherAttendanceData {
  teacher_id: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
  remarks?: string;
  check_in_time?: string; // Format: "HH:mm"
  check_out_time?: string;
}

export interface MarkTeacherAttendancePayload {
  attendance_date: string;
  teachers: TeacherAttendanceData[];
}

export interface QRSessionPayload {
  class_id: number;
  subject_id?: number;
  period_number?: number;
  session_date: string;
  duration_minutes?: number;
}

export interface QRCheckInPayload {
  session_code: string;
  student_id: number;
}

export interface AttendanceAnalyticsParams {
  start_date?: string;
  end_date?: string;
}

export interface AttendanceStreak {
  id: number;
  user_id: number;
  user_type: 'student' | 'teacher';
  current_streak: number;
  best_streak: number;
  last_attendance_date: string;
  badges_earned: string[];
  perfect_weeks: number;
  perfect_months: number;
}

// ===================== DATA FETCHING HELPERS =====================

/**
 * Get all classes for a school
 */
export const getSchoolClasses = async (schoolId: number) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/principal/class/getall/${schoolId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};

/**
 * Get students for a specific class
 */
export const getClassStudents = async (schoolId: number, classData: { class: string; section: string }) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/teacher/student-details`,
      {
        school_id: schoolId,
        class: classData.class,
        section: classData.section,
      },
      getAuthHeaders()
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

/**
 * Get all subjects for a school
 */
export const getSchoolSubjects = async (schoolId: number) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/principal/subject/getall/${schoolId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

/**
 * Get all teachers for a school
 */
export const getSchoolTeachers = async (schoolId: number) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/principal/teacher/getall/${schoolId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
};

/**
 * Get teacher's assigned classes
 */
export const getTeacherClasses = async (teacherId: number, schoolId: number) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/teacher/assigned-classes/${teacherId}/${schoolId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching teacher classes:', error);
    throw error;
  }
};

// ===================== STUDENT ATTENDANCE (Teacher) =====================

/**
 * Mark student attendance (Quick, Period-wise, or Class-wise)
 */
export const markStudentAttendance = async (data: MarkAttendancePayload) => {
  try {
    console.log('Marking student attendance:', data);
    const response = await axios.post(
      `${API_BASE_URL}/teacher/attendance/students`,
      data,
      getAuthHeaders()
    );
    console.log('Attendance marked:', response.data);
    
    if (response.data.status) {
      toast.success(response.data.message || 'Attendance marked successfully');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error marking student attendance:', error);
    const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to mark attendance';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Bulk mark all students in a class
 */
export const bulkMarkAttendance = async (data: BulkMarkPayload) => {
  try {
    console.log('Bulk marking attendance:', data);
    const response = await axios.post(
      `${API_BASE_URL}/teacher/attendance/bulk-mark`,
      data,
      getAuthHeaders()
    );
    
    if (response.data.status) {
      toast.success(response.data.message || 'Bulk attendance marked successfully');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error bulk marking attendance:', error);
    const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to bulk mark attendance';
    toast.error(errorMessage);
    throw error;
  }
};

// ===================== QR CODE ATTENDANCE =====================

/**
 * Create QR attendance session
 */
export const createQRSession = async (data: QRSessionPayload) => {
  try {
    console.log('Creating QR session:', data);
    const response = await axios.post(
      `${API_BASE_URL}/teacher/attendance/qr-session/create`,
      data,
      getAuthHeaders()
    );
    
    if (response.data.status) {
      toast.success('QR session created successfully');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating QR session:', error);
    const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to create QR session';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Get QR session status (for live updates)
 */
export const getQRSessionStatus = async (sessionId: number) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/teacher/attendance/qr-session/${sessionId}/status`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching QR session status:', error);
    throw error;
  }
};

/**
 * Student QR check-in (public endpoint)
 */
export const qrCheckIn = async (data: QRCheckInPayload) => {
  try {
    console.log('QR check-in:', data);
    const response = await axios.post(
      `${API_BASE_URL}/attendance/qr-checkin`,
      data
    );
    
    if (response.data.status) {
      toast.success('Check-in successful!');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error during QR check-in:', error);
    const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Check-in failed';
    toast.error(errorMessage);
    throw error;
  }
};

// ===================== TEACHER ATTENDANCE (Principal) =====================

/**
 * Mark teacher attendance (by Principal)
 */
export const markTeacherAttendance = async (data: MarkTeacherAttendancePayload) => {
  try {
    console.log('Marking teacher attendance:', data);
    const response = await axios.post(
      `${API_BASE_URL}/principal/attendance/teachers`,
      data,
      getAuthHeaders()
    );
    
    if (response.data.status) {
      toast.success(response.data.message || 'Teacher attendance marked successfully');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error marking teacher attendance:', error);
    const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to mark teacher attendance';
    toast.error(errorMessage);
    throw error;
  }
};

// ===================== ANALYTICS & REPORTS =====================

/**
 * Get attendance analytics
 */
export const getAttendanceAnalytics = async (
  role: 'teacher' | 'principal',
  params?: AttendanceAnalyticsParams & { type?: 'all' | 'teacher' | 'student'; class_id?: number }
) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.class_id) queryParams.append('class_id', params.class_id.toString());
    
    const endpoint = role === 'teacher' 
      ? `${API_BASE_URL}/teacher/attendance/analytics`
      : `${API_BASE_URL}/principal/attendance/analytics`;
    
    const response = await axios.get(
      `${endpoint}?${queryParams.toString()}`,
      getAuthHeaders()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance analytics:', error);
    const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch analytics';
    toast.error(errorMessage);
    throw error;
  }
};

// ===================== STREAKS & BADGES =====================

/**
 * Get student/teacher streaks
 */
export const getAttendanceStreaks = async (
  userId: number,
  userType: 'student' | 'teacher',
  role: 'teacher' | 'principal'
) => {
  try {
    const endpoint = role === 'teacher'
      ? `${API_BASE_URL}/teacher/attendance/streaks/${userId}/${userType}`
      : `${API_BASE_URL}/principal/attendance/streaks/${userId}/${userType}`;
    
    const response = await axios.get(endpoint, getAuthHeaders());
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching attendance streaks:', error);
    throw error;
  }
};

// ===================== ATTENDANCE RECORDS =====================

/**
 * Get attendance records with filtering
 */
export const getAttendanceRecords = async (filters: {
  start_date: string;
  end_date: string;
  class_id?: number;
  subject_id?: number;
  status?: string;
  search?: string;
}) => {
  try {
    const params = new URLSearchParams();
    params.append('start_date', filters.start_date);
    params.append('end_date', filters.end_date);
    
    if (filters.class_id) params.append('class_id', filters.class_id.toString());
    if (filters.subject_id) params.append('subject_id', filters.subject_id.toString());
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const response = await axios.get(
      `${API_BASE_URL}/teacher/attendance/records?${params.toString()}`,
      getAuthHeaders()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch records';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Get today's attendance records grouped by class
 */
export const getTodayAttendanceByClass = async (date?: string) => {
  try {
    const params = new URLSearchParams();
    if (date) {
      params.append('date', date);
    }

    const response = await axios.get(
      `${API_BASE_URL}/teacher/attendance/today-by-class?${params.toString()}`,
      getAuthHeaders()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching today\'s attendance by class:', error);
    const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch today\'s attendance';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Get today's teacher attendance records
 */
export const getTodayTeacherAttendance = async (date?: string) => {
  try {
    const params = new URLSearchParams();
    if (date) {
      params.append('date', date);
    }

    const response = await axios.get(
      `${API_BASE_URL}/principal/attendance/teachers/today?${params.toString()}`,
      getAuthHeaders()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching today\'s teacher attendance:', error);
    const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch today\'s teacher attendance';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Get teacher attendance records with filtering
 */
export const getTeacherAttendanceRecords = async (filters: {
  start_date: string;
  end_date: string;
  teacher_id?: number;
  status?: string;
  search?: string;
}) => {
  try {
    const params = new URLSearchParams();
    params.append('start_date', filters.start_date);
    params.append('end_date', filters.end_date);
    
    if (filters.teacher_id) params.append('teacher_id', filters.teacher_id.toString());
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const response = await axios.get(
      `${API_BASE_URL}/principal/attendance/teachers/records?${params.toString()}`,
      getAuthHeaders()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher attendance records:', error);
    const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch teacher attendance records';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Get class-wise student attendance analysis
 */
export const getClassWiseStudentAttendance = async (classId: number, filters?: {
  start_date?: string;
  end_date?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const response = await axios.get(
      `${API_BASE_URL}/principal/attendance/students/class/${classId}?${params.toString()}`,
      getAuthHeaders()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching class-wise student attendance:', error);
    const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch class-wise student attendance';
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Get individual student attendance analysis
 */
export const getStudentIndividualAttendance = async (studentDetailsId: number, filters?: {
  start_date?: string;
  end_date?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const response = await axios.get(
      `${API_BASE_URL}/principal/attendance/students/${studentDetailsId}?${params.toString()}`,
      getAuthHeaders()
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching student individual attendance:', error);
    const errorMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch student attendance';
    toast.error(errorMessage);
    throw error;
  }
};

// ===================== EXPORT REPORTS =====================

/**
 * Export attendance report (placeholder for future implementation)
 */
export const exportAttendanceReport = async (
  format: 'pdf' | 'excel',
  filters: Record<string, unknown>
) => {
  try {
    // This will be implemented later with backend support
    toast.info('Export feature coming soon');
    return { status: false, message: 'Not implemented yet' };
  } catch (error: unknown) {
    console.error('Error exporting attendance report:', error);
    throw error;
  }
};

