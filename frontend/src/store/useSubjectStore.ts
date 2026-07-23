import { toast } from "sonner";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export interface SubjectForm {
  id?: number;
  school_id?: number;
  subject_name?: string;
  description?: string;
}

export interface SchoolSubject extends SubjectForm{
}

interface SubjectState {
  subjects: SchoolSubject[];
  createSubject: (data: SubjectForm) => Promise<boolean>;
  updateSubject: (subjectId: string, data: SubjectForm) => Promise<boolean>;
  deleteSubject: (subjectId: string) => Promise<boolean>;
  getSubjects: (school_id: number) => Promise<SubjectForm[]>;
}

export const useSubjectStore = create<SubjectState>((set, get) => ({
  subjects: [],

  // CREATE SUBJECT 
  createSubject: async (data: SubjectForm) => {
    const token = localStorage.getItem("token");
    console.log("Creating subject with data:", data);
    try {
      const res = await axiosInstance.post(`/principal/subject/create/${data.school_id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status) {
        const created: SchoolSubject = res.data.data;
        set((state) => ({ subjects: [...state.subjects, created] }));
        toast.success(res.data.message || "Subject created successfully");
        return true;
      } else {
        toast.error(res.data.message || "Failed to create subject");
        return false;
      }
    } catch (error: any) {
      console.error("Error creating subject:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to create subject");
      return false;
    }
  },

  // UPDATE SUBJECT 
  updateSubject: async (subjectId: string, data: SubjectForm) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axiosInstance.put(`/principal/subject/update/${subjectId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status) {
        const updated: SchoolSubject = res.data.data;
        set((state) => ({
          subjects: state.subjects.map((s) =>
            String(s.id) === String(updated.id) ? updated : s
          ),
        }));
        toast.success(res.data.message || "Subject updated successfully");
        return true;
      } else {
        toast.error(res.data.message || "Failed to update subject");
        return false;
      }
    } catch (error: any) {
      console.error("Error updating subject:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to update subject");
      return false;
    }
  },

  // DELETE SUBJECT 
  deleteSubject: async (subjectId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axiosInstance.delete(`/principal/subject/delete/${subjectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status) {
        set((state) => ({
          subjects: state.subjects.filter((s) => String(s.id) !== String(subjectId)),
        }));
        toast.success(res.data.message || "Subject deleted successfully");
        return true;
      } else {
        toast.error(res.data.message || "Failed to delete subject");
        return false;
      }
    } catch (error: any) {
      console.error("Error deleting subject:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to delete subject");
      return false;
    }
  },

  // GET SUBJECTS 
  getSubjects: async (school_id: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axiosInstance.get(`/principal/subject/getall/${school_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status) {
        const data: SchoolSubject[] = res.data.data;
        set(() => ({ subjects: data }));
        return data;
      } else {
        toast.error(res.data.message || "Failed to fetch subjects");
        return [];
      }
    } catch (error: any) {
      console.error("Error fetching subjects:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to fetch subjects");
      return [];
    }
  },
}));
