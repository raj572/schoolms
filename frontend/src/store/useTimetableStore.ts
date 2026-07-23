import { toast } from "sonner";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export interface TimetableEntry {
  id?: number;
  school_id?: number;
  class_id?: number;
  subject_id?: number;
  teacher_id?: number;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  subject?: {
    id: number;
    subject_name: string;
  };
  teacher?: {
    id: number;
    name: string;
    employee_code?: string;
  };
  class?: {
    id: number;
    class: string;
    section?: string;
  };
}

export interface Subject {
  id: number;
  subject_name: string;
  description?: string;
}

interface TimetableState {
  getTimetable: (school_id: number, class_id?: number) => Promise<TimetableEntry[]>;
  createTimetable: (data: { school_id: number; timetable: Partial<TimetableEntry>[] }) => Promise<boolean>;
  updateTimetableEntry: (id: number, data: Partial<TimetableEntry>) => Promise<boolean>;
  deleteTimetableEntry: (id: number) => Promise<boolean>;
  getSubjects: (school_id: number) => Promise<Subject[]>;
}

export const useTimetableStore = create<TimetableState>(() => ({
  // Get timetable
  getTimetable: async (school_id: number, class_id?: number) => {
    const token = localStorage.getItem('token');
    try {
      // Use the new endpoint with both school_id and class_id as path parameters
      // If class_id is provided, get specific class timetable, else get all
      let endpoint = '';
      if (class_id) {
        endpoint = `/principal/class-timetable/get-by-class/${school_id}/${class_id}`;
      } else {
        // Get all timetables for the school (for conflict checking)
        endpoint = `/principal/class-timetable/get/${school_id}`;
      }
      
      const res = await axiosInstance.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status) {
        return res.data.data || [];
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching timetable:', error?.response?.data?.message || error.message);
      return [];
    }
  },

  // Create timetable (bulk)
  createTimetable: async (data) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.post(`/principal/class-timetable/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status) {
        toast.success(res.data.message || 'Timetable created successfully');
        return true;
      } else {
        toast.error(res.data.message || 'Failed to create timetable');
        return false;
      }
    } catch (error: any) {
      console.error('Error creating timetable:', error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || 'Failed to create timetable');
      return false;
    }
  },

  // Update timetable entry
  updateTimetableEntry: async (id: number, data) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.put(`/principal/class-timetable/update/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status) {
        toast.success(res.data.message || 'Timetable updated successfully');
        return true;
      } else {
        toast.error(res.data.message || 'Failed to update timetable');
        return false;
      }
    } catch (error: any) {
      console.error('Error updating timetable:', error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || 'Failed to update timetable');
      return false;
    }
  },

  // Delete timetable entry
  deleteTimetableEntry: async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.delete(`/principal/class-timetable/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status) {
        toast.success(res.data.message || 'Entry deleted successfully');
        return true;
      } else {
        toast.error(res.data.message || 'Failed to delete entry');
        return false;
      }
    } catch (error: any) {
      console.error('Error deleting timetable entry:', error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || 'Failed to delete entry');
      return false;
    }
  },

  // Get subjects
  getSubjects: async (school_id: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.get(`/principal/subject/getall/${school_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status) {
        return res.data.data || [];
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching subjects:', error?.response?.data?.message || error.message);
      return [];
    }
  },
}));
