import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
  total_students?: number;
  marks?: Array<{ id: number; marks_obtained?: number }>;
  school_class?: { id: number; class_name: string; class: string; section: string };
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

export interface ExamStats {
  upcomingExams: number;
  completedExams: number;
  averageScore: number;
  passRate: number;
}

/**
 * Get all exams for a school
 */
export const getAllExams = async (schoolId: number): Promise<{ status: boolean; data?: Exam[]; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/principal/exam/all/${schoolId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    toast.error('Failed to fetch exams');
    return { status: false, data: [], message: 'Failed to fetch exams' };
  }
};

/**
 * Get exam by ID
 */
export const getExam = async (examId: number): Promise<{ status: boolean; data?: Exam; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/principal/exam/${examId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching exam:', error);
    toast.error('Failed to fetch exam details');
    return { status: false, message: 'Failed to fetch exam details' };
  }
};

/**
 * Get exam schedules for a specific exam
 */
export const getExamSchedules = async (
  examId: number,
  classId?: number
): Promise<{ status: boolean; data?: ExamSchedule[]; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const params = classId ? `?class_id=${classId}` : '';
    const response = await axios.get(`${API_BASE_URL}/principal/exam/schedules/${examId}${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching exam schedules:', error);
    toast.error('Failed to fetch exam schedules');
    return { status: false, data: [], message: 'Failed to fetch exam schedules' };
  }
};

/**
 * Get marks for an exam schedule
 */
export const getScheduleMarks = async (
  examScheduleId: number
): Promise<{ status: boolean; data?: StudentExamMark[]; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/principal/exam/marks/schedule/${examScheduleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching marks:', error);
    toast.error('Failed to fetch marks');
    return { status: false, data: [], message: 'Failed to fetch marks' };
  }
};

/**
 * Get student marks for a specific exam
 */
export const getStudentExamMarks = async (
  studentId: number,
  schoolId: number
): Promise<{ status: boolean; data?: any[]; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/principal/exam/marks/student/${studentId}/${schoolId}`, {
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
 * Get exam statistics for dashboard
 */
export const getExamStats = async (schoolId: number): Promise<{ status: boolean; data?: ExamStats; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/principal/exam/stats/${schoolId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status && response.data.data) {
      return {
        status: true,
        data: response.data.data,
      };
    }

    return { status: false, message: response.data.message || 'Failed to fetch exam statistics' };
  } catch (error: any) {
    console.error('Error fetching exam stats:', error);
    return { status: false, message: 'Failed to fetch exam statistics' };
  }
};

/**
 * Create a new exam
 */
export const createExam = async (examData: Partial<Exam>): Promise<{ status: boolean; data?: Exam; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/principal/exam/create`, examData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error creating exam:', error);
    toast.error('Failed to create exam');
    return { status: false, message: 'Failed to create exam' };
  }
};

/**
 * Update an exam
 */
export const updateExam = async (
  examId: number,
  examData: Partial<Exam>
): Promise<{ status: boolean; data?: Exam; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/principal/exam/update/${examId}`, examData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error updating exam:', error);
    toast.error('Failed to update exam');
    return { status: false, message: 'Failed to update exam' };
  }
};

/**
 * Delete an exam
 */
export const deleteExam = async (examId: number): Promise<{ status: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE_URL}/principal/exam/delete/${examId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error deleting exam:', error);
    toast.error('Failed to delete exam');
    return { status: false, message: 'Failed to delete exam' };
  }
};

/**
 * Get all subjects for a school
 */
export const getSubjects = async (schoolId: number): Promise<{ status: boolean; data?: any[]; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/principal/subjects/${schoolId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    return { status: false, data: [], message: 'Failed to fetch subjects' };
  }
};

/**
 * Get all classes for a school
 */
export const getClasses = async (schoolId: number): Promise<{ status: boolean; data?: any[]; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/principal/classes/${schoolId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    return { status: false, data: [], message: 'Failed to fetch classes' };
  }
};

/**
 * Bulk create exam schedules
 */
export const bulkCreateSchedules = async (
  examId: number,
  schedules: any[]
): Promise<{ status: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/principal/exam/schedules/bulk-create`,
      { exam_id: examId, schedules },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error creating schedules:', error);
    toast.error('Failed to create exam schedules');
    return { status: false, message: 'Failed to create exam schedules' };
  }
};

/**
 * Get students for an exam schedule
 */
export const getScheduleStudents = async (
  scheduleId: number
): Promise<{ status: boolean; data?: any[]; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/principal/exam/schedule/${scheduleId}/students`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return { status: false, data: [], message: 'Failed to fetch students' };
  }
};

/**
 * Bulk enter marks for a schedule
 */
export const bulkEnterMarksForSchedule = async (
  scheduleId: number,
  marks: any[]
): Promise<{ status: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/principal/exam/marks/schedule/${scheduleId}/bulk-enter`,
      { marks },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error entering marks:', error);
    toast.error('Failed to enter marks');
    return { status: false, message: 'Failed to enter marks' };
  }
};

/**
 * Generate report card
 */
export const generateReportCard = async (
  examId: number,
  studentId: number
): Promise<{ status: boolean; data?: any; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/principal/exam/report/card/${examId}/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error generating report card:', error);
    toast.error('Failed to generate report card');
    return { status: false, message: 'Failed to generate report card' };
  }
};

/**
 * Get students for exam+class combination
 */
export const getExamClassStudents = async (
  examId: number,
  classId: number
): Promise<{ status: boolean; data?: any[]; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/principal/exam/${examId}/class/${classId}/students`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return { status: false, data: [], message: 'Failed to fetch students' };
  }
};

/**
 * Get all schedules for a student in an exam
 */
export const getStudentSchedules = async (
  examId: number,
  classId: number,
  studentId: number
): Promise<{ status: boolean; data?: any; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_BASE_URL}/principal/exam/${examId}/class/${classId}/student/${studentId}/schedules`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching student schedules:', error);
    return { status: false, message: 'Failed to fetch schedules' };
  }
};

/**
 * Submit student-wise marks (one student, all subjects)
 */
export const bulkEnterStudentWiseMarks = async (
  studentId: number,
  studentDetailsId: number,
  marks: any[]
): Promise<{ status: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/principal/exam/marks/student-wise`,
      {
        student_id: studentId,
        student_details_id: studentDetailsId,
        marks,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error submitting student-wise marks:', error);
    toast.error('Failed to submit marks');
    return { status: false, message: 'Failed to submit marks' };
  }
};

/**
 * Upload CSV file for marks import
 */
export const uploadMarksCsv = async (
  file: File,
  examId: number
): Promise<{ status: boolean; data?: any; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('exam_id', examId.toString());

    const response = await axios.post(`${API_BASE_URL}/principal/exam/marks/csv-import`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error uploading CSV:', error);
    toast.error('Failed to upload CSV');
    return { status: false, message: 'Failed to upload CSV' };
  }
};

/**
 * Download CSV template for marks entry
 */
export const downloadMarksTemplate = async (
  examId: number
): Promise<{ status: boolean; data?: any; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/principal/exam/${examId}/csv-template`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error downloading template:', error);
    toast.error('Failed to download template');
    return { status: false, message: 'Failed to download template' };
  }
};

/**
 * Update an exam schedule
 */
export const updateExamSchedule = async (
  scheduleId: number,
  scheduleData: Partial<ExamSchedule>
): Promise<{ status: boolean; data?: ExamSchedule; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_BASE_URL}/principal/exam/schedule/update/${scheduleId}`,
      scheduleData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error updating exam schedule:', error);
    toast.error('Failed to update exam schedule');
    return { status: false, message: 'Failed to update exam schedule' };
  }
};

/**
 * Bulk update exam schedules (update existing, create new)
 */
export const bulkUpdateSchedules = async (
  examId: number,
  schedules: any[]
): Promise<{ status: boolean; data?: ExamSchedule[]; message?: string; summary?: any }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_BASE_URL}/principal/exam/schedules/bulk-update`,
      { exam_id: examId, schedules },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error bulk updating schedules:', error);
    toast.error('Failed to update exam schedules');
    return { status: false, message: 'Failed to update exam schedules' };
  }
};

/**
 * Delete an exam schedule
 */
export const deleteExamSchedule = async (scheduleId: number): Promise<{ status: boolean; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE_URL}/principal/exam/schedule/delete/${scheduleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error deleting exam schedule:', error);
    toast.error('Failed to delete exam schedule');
    return { status: false, message: 'Failed to delete exam schedule' };
  }
};

/**
 * Get student exam results with search/filter
 */
export const getStudentResults = async (
  schoolId: number,
  examId?: number,
  classId?: number,
  search?: string
): Promise<{ status: boolean; data?: any[]; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (examId) params.append('exam_id', examId.toString());
    if (classId) params.append('class_id', classId.toString());
    if (search) params.append('search', search);

    const response = await axios.get(
      `${API_BASE_URL}/principal/exam/results/students/${schoolId}${params.toString() ? `?${params.toString()}` : ''}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching student results:', error);
    return { status: false, data: [], message: 'Failed to fetch student results' };
  }
};

/**
 * Get exam results with calculated statistics
 */
export const getExamResults = async (
  schoolId: number
): Promise<{ status: boolean; data?: any[]; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/principal/exam/results/exams/${schoolId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching exam results:', error);
    return { status: false, data: [], message: 'Failed to fetch exam results' };
  }
};

