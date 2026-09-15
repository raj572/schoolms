import axios from 'axios';
import { toast } from 'sonner';

import { API_BASE_URL } from '@/lib/axios';

export interface Exam {
  id: number;
  school_id: number;
  exam_name: string;
  exam_type?: string;
  start_date: string;
  end_date: string;
  description?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  schedules?: ExamSchedule[];
}

export interface ExamSchedule {
  id: number;
  exam_id: number;
  school_id: number;
  class_id: number;
  subject_id: number;
  exam_date: string;
  start_time: string;
  end_time: string;
  total_marks: number;
  passing_marks: number;
  room_number?: string;
  instructions?: string;
  school_class?: { id: number; class_name: string };
  subject?: { id: number; subject_name: string };
}

export interface StudentExamMark {
  id: number;
  exam_schedule_id: number;
  student_id: number;
  student_details_id: number;
  marks_obtained?: number;
  marks_total: number;
  grade?: string;
  remarks?: string;
  status: 'pending' | 'submitted' | 'absent';
  entered_by?: number;
  entered_at?: string;
  student?: { full_name: string; roll_number: string };
}

/**
 * Get exams for a student's class
 */
export const getStudentExams = async (
  studentId: number,
  schoolId: number
): Promise<{ status: boolean; data?: Exam[]; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/student/exams/${studentId}/${schoolId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching student exams:', error);
    toast.error('Failed to fetch exams');
    return { status: false, data: [], message: 'Failed to fetch exams' };
  }
};

/**
 * Get exam schedules for a student's class
 */
export const getStudentExamSchedules = async (
  studentId: number,
  examId: number
): Promise<{ status: boolean; data?: ExamSchedule[]; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/student/exams/schedules/${studentId}/${examId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching student exam schedules:', error);
    toast.error('Failed to fetch exam schedules');
    return { status: false, data: [], message: 'Failed to fetch exam schedules' };
  }
};

/**
 * Get student's exam marks
 */
export const getStudentMarks = async (
  studentId: number,
  schoolId: number
): Promise<{ status: boolean; data?: StudentExamMark[]; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/student/exams/marks/${studentId}/${schoolId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching student marks:', error);
    return { status: false, data: [], message: 'Failed to fetch student marks' };
  }
};

/**
 * Get student's report card for a specific exam
 */
export const getStudentReportCard = async (
  studentId: number,
  examId: number
): Promise<{ status: boolean; data?: any; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/student/exams/report-card/${studentId}/${examId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching report card:', error);
    toast.error('Failed to fetch report card');
    return { status: false, message: 'Failed to fetch report card' };
  }
};

