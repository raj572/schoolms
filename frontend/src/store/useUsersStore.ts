import { toast } from "sonner";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { TeacherSubject } from "@/pages/principal/teachers/Details";
import { useId } from "react";


//User Response Type
export interface UserData {
  id?:number;
  full_name?: string;
  status?: string;
  school_id?: string;
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: string;
  administrator_id?: number;
  assignment_status?: 'unassigned' | 'assigned';
  registration_status?: string;
  email_verified?: boolean;
  
}

//Teacher Response Type
export interface TeacherForm {
  id?: string
  status?: string;
  school_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  qualification?: string;
  dob?: Date;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  employee_code?: string;
  subjects?: TeacherSubject[]; 
  
}

export interface Teacher extends TeacherForm{
  
}

// Student response type
export interface StudentForm {
  id?:number;
  status?:string;
  section?:string;
  school_id?: string;
  candidate_name?: string;
  gender?: string;
  addhar?: string;
  dob?: string;
  class?: {};
  roll_no?: string;
  email?: string;
  parent_email?: string;
  father_name?: string;
  mother_name?: string;
  phone?: string;
  address?: string;
  // transport_service?: boolean;
  // library_service?: boolean;
  // computer_service?: boolean;
}

// Stats response type
export interface Stats {
  totalStudents: number;
  totalUsers: number;
  pendingDues: number;
  classCount: number;
}



interface ParentForm {
  rollNo: string;
  email: string;
  parentEmail: string;
  fatherName: string;
  motherName: string;
  phone: string;
  address: string;

}


interface UsersState {

  registerUser: (school_id: string, data: UserData) => Promise<boolean>;
  updateUser: (userId: number, data:UserData) => Promise<boolean>;
  toggleStatus: (userId:number, data:UserData) => Promise<boolean>;
  getAllUsers: (school_id: string) => Promise<UserData[] | null>;



  // registerParent: (schoolId: string, data: ParentForm) => Promise<boolean>;
  getStats: (school_id: string) => Promise<Stats | null>;


  registerStudent: (school_id: string, data: StudentForm) => Promise<boolean>;
  getStudentDetails: (schoolId: string) => Promise<StudentForm[] | null>;


  //Teacher Controllers
  registerTeacher: (school_id: string, data: TeacherForm) => Promise<boolean>;
  updateTeacher: (teacherId: string, school_id: string, data: TeacherForm) => Promise<boolean>;
  deleteTeacher: (teacherId: string) => Promise<boolean>;
  getTeacherById: (teacherId: string) => Promise<TeacherForm | null>;
  getAllTeachers: (school_id: string) => Promise<TeacherForm[] | null>;

  
}

export const useUsersStore = create<UsersState>(() => ({

  //  Get Stats Controller -------------------------------------------------------------------------------------------------------
  getStats: async (school_id) => {
    const token = localStorage.getItem('token');

    try {
      const res = await axiosInstance.get(`/principal/stats/${school_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.status) {
        return res.data.data;
      } else {
        toast.error(res.data.message || "Failed to fetch stats");
        return null;
      }
    } catch (error: any) {
      console.error("Error fetching stats:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to fetch stats");
      return null;
    }
  },



  //USER CONTROLLERS ---------------------------------------------------------------------------------------------------

  //Register User 
  registerUser: async (school_id, data) => {
    const token = localStorage.getItem("token");

    try {
      const res = await axiosInstance.post(
        `/principal/user/register/${school_id}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }

      );


      if (res.data.status) {
        toast.success(res.data.message || "User registered successfully");
        return true;
      } else {
        toast.error(res.data.message || "Failed to register user");
        return false;
      }
    } catch (error: any) {
      console.error(
        "Error registering user:",
        error?.response?.data?.message || error.message
      );
      toast.error(error?.response?.data?.message || "Failed to register user");
      return false;
    }
  },

  //Update User
  updateUser: async (userId, data) =>{
  const token = localStorage.getItem("token");

    try {
      const res = await axiosInstance.put(
        `/principal/user/update/${userId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }

      );


      if (res.data.status) {
        toast.success(res.data.message || "User updated successfully");
        return true;
      } else {
        toast.error(res.data.message || "Failed to update user");
        return false;
      }
    } catch (error: any) {
      console.error(
        "Error updating user:",
        error?.response?.data?.message || error.message
      );
      toast.error(error?.response?.data?.message || "Failed to update user");
      return false;
    }
  },

  //Toggle Status
  toggleStatus: async(userId, data)=>{
     const token = localStorage.getItem("token");

    try {
      const res = await axiosInstance.patch(
        `/principal/user/toggle-status/${userId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }

      );
      console.log("togglestatus: ", res);

      if (res.data.status) {
        toast.success(res.data.message || "Status updated successfully");
        return true;
      } else {
        toast.error(res.data.message || "Failed to update status");
        return false;
      }
    } catch (error: any) {
      console.error(
        "Error updating status:",
        error?.response?.data?.message || error.message
      );
      toast.error(error?.response?.data?.message || "Failed to update status");
      return false;
    }
  },

  //Get All Users
  getAllUsers: async (school_id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.get(`/principal/user/getall/${school_id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log("getAllUsers: ", res)

      if (res.data.status) {
        return res.data.data;
      } else {
        toast.error(res.data.message || "Failed to fetch users");
        return null;
      }
    } catch (error: any) {
      console.error(
        "Error registering user:",
        error?.response?.data?.message || error.message
      );
      toast.error(error?.response?.data?.message || "Failed to fetch user");
      return null;
    }
  },



  //STUDENT CONTROLLERS ---------------------------------------------------------------------------------------------------

  // Register Student
  registerStudent: async (school_id, data) => {
    const token = localStorage.getItem('token');
    console.log("Register Student Data:", token);

    try {
      const res = await axiosInstance.post(
        `/principal/student/register-student/${school_id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Register Student response:", res.data);

      if (res.data.status) {
        toast.success(res.data.message || "Student registered successfully");
        return true;
      } else {
        toast.error(res.data.message || "Failed to register student");
        return false;
      }
    } catch (error: any) {
      console.error("Error registering student:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to register student");
      return false;
    }
  },

    // Get Student Details
  getStudentDetails: async (schoolId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.get(
        `/principal/student/getstudents/${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.status) {
        toast.success(res.data.message || "Students fetched successfully");
        return res.data.data;
      } else {
        toast.error(res.data.message || "Failed to fetch students");
        return null;
      }
    } catch (error: any) {
      console.error("Error fetching students:", error?.response?.data?.message || error.message);
      toast.error(error?.response?.data?.message || "Failed to fetch students");
      return null;
    }
  },



  //TEACHER CONTROLLERS ---------------------------------------------------------------------------------------------------

  // Register Teacher
  registerTeacher: async (school_id, data) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.post(`/principal/teacher/register/${school_id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
     if (res.data.status) {
        toast.success(res.data.message || "Teacher registered successfully");
        return true;
      } else {
        toast.error(res.data.message || "Failed to register teacher");
        return false;
      }
    } catch (error: any) {
      console.error(
        "Error registering teacher:",
        error?.response?.data?.message || error.message
      );
      toast.error(error?.response?.data?.message || "Failed to register teacher");
      return false;
    }
  },

  //Update Teacher
  updateTeacher: async(teacherId, school_id, data) =>{
  const token = localStorage.getItem("token");

    try {
      const res = await axiosInstance.put(
        `/principal/teacher/update/${teacherId}/${school_id}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }

      );

      if (res.data.status) {
        toast.success(res.data.message || "Teacher updated successfully");
        return true;
      } else {
        toast.error(res.data.message || "Failed to update teacher");
        return false;
      }
    } catch (error: any) {
      console.error(
        "Error updating teacher:",
        error?.response?.data?.message || error.message
      );
      toast.error(error?.response?.data?.message || "Failed to update teacher");
      return false;
    }
  },

  // Delete Teacher
  deleteTeacher: async(teacherId) =>{
     const token = localStorage.getItem("token");

    try {
      const res = await axiosInstance.delete(
        `/principal/teacher/delete/${teacherId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }

      );

      if (res.data.success) {
        toast.success(res.data.message || "Teacher Deleted successfully");
        return true;
      } else {
        toast.error(res.data.message || "Failed to delete teacher");
        return false;
      }
    } catch (error: any) {
      console.error(
        "Error deleting teacher:",
        error?.response?.data?.message || error.message
      );
      toast.error(error?.response?.data?.message || "Failed to delete teacher");
      return false;
    }
  },

  //Get Teacher By ID
getTeacherById: async (teacherId) => {
  const token = localStorage.getItem('token');
  try {
    const res = await axiosInstance.get(`/principal/teacher/get/${teacherId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.data.status) {
      // Backend returns: { status, message, data: { teacher object }, error }
      return res.data.data as TeacherForm; 
    } else {
      toast.error(res.data.message || "Failed to fetch teacher");
      return null;
    }
  } catch (error: any) {
    console.error(
      "Error fetching teacher:",
      error?.response?.data?.message || error.message
    );
    toast.error(error?.response?.data?.message || "Failed to fetch teacher");
    return null;
  }
},

  // Get All Teachers
 getAllTeachers: async (school_id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.get(`/principal/teacher/getall/${school_id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.status) {
        return res.data.data;
      } else {
        toast.error(res.data.message || "Failed to fetch teachers");
        return null;
      }
    } catch (error: any) {
      console.error(
        "Error registering user:",
        error?.response?.data?.message || error.message
      );
      toast.error(error?.response?.data?.message || "Failed to fetch teachers");
      return null;
    }
  },

  //  Register Parent Controller ---------------------------------------------------------------------------------------------------




}));
