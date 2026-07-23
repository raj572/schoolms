import { toast } from "sonner";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export interface ClassForm {
  school_id?: string;
  class?: string;
  section?: string;
  room_no?: string;
  teacher_in_charge?: string;
  capacity?: number;
  status?: 'active' | 'inactive';
  notes?: string;
  id?: number;
}

interface ClassState {
    //Class Controllers
  createClass: (data: ClassForm) => Promise<boolean>;
  updateClass: (classId: string, data: ClassForm) => Promise<boolean>;
  deleteClass: (classId: string) => Promise<boolean>;
  getClasses: (school_id: string) => Promise<ClassForm[]>;

}

export const useClassStore = create<ClassState>(() => ({

     //CLASS CONTROLLERS ---------------------------------------------------------------------------------------------------
    
      // Create Class 
      createClass: async (data: ClassForm) => {
        const token = localStorage.getItem('token');
        try {
          const res = await axiosInstance.post(`/principal/class/create`, data, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
          if (res.data.status) {
            toast.success(res.data.message || 'Class created successfully');
            return true;
          } else {
            toast.error(res.data.message || 'Failed to create class');
            return false;
          }
        } catch (error: any) {
          console.error('Error creating class:', error?.response?.data?.message || error.message);
          toast.error(error?.response?.data?.message || 'Failed to create class');
          return false;
        }
      },
    
      //Delete Class 
      deleteClass: async (class_id: string) => {
        const token = localStorage.getItem('token');
        try {
          const res = await axiosInstance.delete(`/principal/class/delete/${class_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
      if (res.data.status) {
            toast.success(res.data.message || 'Class deleted successfully');
            return true;
          } else {
            toast.error(res.data.message || 'Failed to delete class');
            return false;
          }
        } catch (error: any) {
          console.error('Error deleting class:', error?.response?.data?.message || error.message);
          toast.error(error?.response?.data?.message || 'Failed to delete class');
          return false;
        }
      
    },
      
    //Update Class
      updateClass: async (class_id: string, data: ClassForm) => {
        const token = localStorage.getItem('token');
        try {
          const res = await axiosInstance.put(`/principal/class/update/${class_id}`, data, 
            {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
    
    
          if (res.data.status) {
            toast.success(res.data.message || 'Class updated successfully');
            return true;
          } else {
            toast.error(res.data.message || 'Failed to update class');
            return false;
          }
        } catch (error: any) {
          console.error('Error updating class:', error?.response?.data?.message || error.message);
          toast.error(error?.response?.data?.message || 'Failed to update class');
          return false;
        }
    
      },
    
      //Get Class
      getClasses: async (school_id: string) => {
        const token = localStorage.getItem('token');
        try {
          const res = await axiosInstance.get(`/principal/class/getall/${school_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("getclasses: ", res)
          if (res.data.status) {
            return res.data.data;
          } else {
            toast.error(res.data.message || 'Failed to fetch classes');
            return [];
          }
        } catch (error: any) {
          console.error('Error fetching classes:', error?.response?.data?.message || error.message);
          toast.error(error?.response?.data?.message || 'Failed to fetch classes');
          return [];
        }
      },
}))