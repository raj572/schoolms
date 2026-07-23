import { toast } from "sonner";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export interface ServiceForm {
  id?: number;
  school_id?: number;
  service_name?: string;
  charge?: number;
  status?: string;
  description?:string;
}

interface ServiceState {
  createService: (data: ServiceForm) => Promise<boolean>;
  updateService: (serviceId: string, data: ServiceForm) => Promise<boolean>;
  deleteService: (serviceId: string) => Promise<boolean>;
  getServices: (school_id: number) => Promise<ServiceForm[]>;
}

export const useServiceStore = create<ServiceState>(() => ({
  //  CREATE SERVICE
  createService: async (data: ServiceForm) => {
    const token = localStorage.getItem("token");
    console.log("Creating service with data:", data);
    try {
      const res = await axiosInstance.post(
        `/principal/service-charge/create/${data.school_id}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );


      if (res.data.status) {
        toast.success(res.data.message || "Service created successfully");
        return true;
      } else {
        toast.error(res.data.message || "Failed to create service");
        return false;
      }
    } catch (error: any) {
      console.error("Error creating service:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to create service");
      return false;
    }
  },

  //  UPDATE SERVICE
  updateService: async (serviceId: string, data: ServiceForm) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axiosInstance.put(
        `/principal/service-charge/update/${serviceId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status) {
        toast.success(res.data.message || "Service updated successfully");
        return true;
      } else {
        toast.error(res.data.message || "Failed to update service");
        return false;
      }
    } catch (error: any) {
      console.error("Error updating service:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to update service");
      return false;
    }
  },

  //  DELETE SERVICE
  deleteService: async (serviceId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axiosInstance.delete(
        `/principal/service-charge/delete/${serviceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status) {
        toast.success(res.data.message || "Service deleted successfully");
        return true;
      } else {
        toast.error(res.data.message || "Failed to delete service");
        return false;
      }
    } catch (error: any) {
      console.error("Error deleting service:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to delete service");
      return false;
    }
  },

  //  GET SERVICES
  getServices: async (school_id: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axiosInstance.get(
        `/principal/service-charge/getall/${school_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status) {
        return res.data.data;
      } else {
        toast.error(res.data.message || "Failed to fetch services");
        return [];
      }
    } catch (error: any) {
      console.error("Error fetching services:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to fetch services");
      return [];
    }
  },
}));
