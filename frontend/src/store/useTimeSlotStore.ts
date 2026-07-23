import { toast } from "sonner";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export interface TimeSlot {
  id?: number;
  school_id?: number;
  start_time: string;
  end_time: string;
  label?: string;
  is_break?: boolean;
  order?: number;
}

interface TimeSlotState {
  getTimeSlots: (school_id: number) => Promise<TimeSlot[]>;
  createTimeSlot: (data: TimeSlot) => Promise<boolean>;
  updateTimeSlot: (id: number, data: Partial<TimeSlot>) => Promise<boolean>;
  deleteTimeSlot: (id: number) => Promise<boolean>;
  createDefaultTimeSlots: (school_id: number) => Promise<boolean>;
  bulkUpdateTimeSlots: (school_id: number, timeSlots: TimeSlot[]) => Promise<boolean>;
}

export const useTimeSlotStore = create<TimeSlotState>(() => ({
  // Get time slots for a school
  getTimeSlots: async (school_id: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.get(`/principal/time-slots/${school_id}`, {
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
      console.error('Error fetching time slots:', error?.response?.data?.message || error.message);
      return [];
    }
  },

  // Create a single time slot
  createTimeSlot: async (data: TimeSlot) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.post(`/principal/time-slots/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status) {
        toast.success(res.data.message || 'Time slot created successfully');
        return true;
      } else {
        toast.error(res.data.message || 'Failed to create time slot');
        return false;
      }
    } catch (error: any) {
      console.error('Error creating time slot:', error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || 'Failed to create time slot');
      return false;
    }
  },

  // Update a time slot
  updateTimeSlot: async (id: number, data: Partial<TimeSlot>) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.put(`/principal/time-slots/update/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status) {
        toast.success(res.data.message || 'Time slot updated successfully');
        return true;
      } else {
        toast.error(res.data.message || 'Failed to update time slot');
        return false;
      }
    } catch (error: any) {
      console.error('Error updating time slot:', error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || 'Failed to update time slot');
      return false;
    }
  },

  // Delete a time slot
  deleteTimeSlot: async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.delete(`/principal/time-slots/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status) {
        toast.success(res.data.message || 'Time slot deleted successfully');
        return true;
      } else {
        toast.error(res.data.message || 'Failed to delete time slot');
        return false;
      }
    } catch (error: any) {
      console.error('Error deleting time slot:', error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || 'Failed to delete time slot');
      return false;
    }
  },

  // Create default time slots for a school
  createDefaultTimeSlots: async (school_id: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.post(`/principal/time-slots/create-defaults/${school_id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status) {
        toast.success(res.data.message || 'Default time slots created successfully');
        return true;
      } else {
        toast.error(res.data.message || 'Failed to create default time slots');
        return false;
      }
    } catch (error: any) {
      console.error('Error creating default time slots:', error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || 'Failed to create default time slots');
      return false;
    }
  },

  // Bulk update time slots
  bulkUpdateTimeSlots: async (school_id: number, timeSlots: TimeSlot[]) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.post(`/principal/time-slots/bulk-update/${school_id}`, {
        time_slots: timeSlots
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status) {
        toast.success(res.data.message || 'Time slots updated successfully');
        return true;
      } else {
        toast.error(res.data.message || 'Failed to update time slots');
        return false;
      }
    } catch (error: any) {
      console.error('Error updating time slots:', error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || 'Failed to update time slots');
      return false;
    }
  },
}));

