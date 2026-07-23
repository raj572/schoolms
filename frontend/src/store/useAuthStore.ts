import { School } from "@/pages/auth/LoginWithSchoolPage";
import { toast } from "sonner";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";


interface AuthUser {
  id: string;
  username?: string;
  full_name?: string; // Renamed from 'name' to match backend
  email: string;
  phone?: string;
  school_id?: string; // Optional for super admin
  administrator_id?: number; // For principals - links to administrator
  role: string;
  assignment_status?: 'unassigned' | 'assigned'; // Principal assignment status
  registration_status?: 'pending_verification' | 'pending_school_setup' | 
                        'pending_subscription' | 'active' | 'suspended' | 'inactive';
  email_verified?: boolean;
  email_verified_at?: string;
  school_setup_completed?: boolean;
  subscription_active?: boolean;
  
}

interface VerifyOtpData {
  email: string;
  otp: string;
}

interface ChangePasswordData {
  email: string;
  otp: string;
  new_password: string;
  new_password_confirmation: string;
}

interface AuthState {

  authUser: AuthUser | null;
  isLoggingIn: boolean;
  isCheckingAuth: boolean;

  getUser: () => Promise<void>;
  login: (data: { email: string; password: string; school_id: string; role: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyForOtp: (data: VerifyOtpData) => Promise<boolean>;
  changePassword: (data: ChangePasswordData)=> Promise<boolean>;
  getSchoolList: () => Promise<School[]>;

}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  school_id: null,
  isLoggingIn: false,
  isCheckingAuth: true,

  //  Get User Controller
  getUser: async () => {
    const token = localStorage.getItem('token');
    try {
      if (!token) {
        set({ authUser: null, isCheckingAuth: false });
        return;
      }

      // Check if user data exists in localStorage (for super admin)
      const userRole = localStorage.getItem('userRole');
      const userData = localStorage.getItem('user');

      // If super admin, use localStorage data
      if (userRole === 'super_admin' && userData) {
        try {
          const user = JSON.parse(userData);
          console.log('Super admin user from localStorage:', user);
          const authUser = {
            id: user.id?.toString() || '',
            email: user.email || '',
            full_name: user.full_name || user.username || user.email,
            username: user.username || user.full_name || user.email,
            role: user.role || 'super_admin', // Use the role from stored data
          };
          console.log('Setting authUser:', authUser);
          set({ authUser, isCheckingAuth: false });
          return;
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
        }
      }

      // Check if we have user data in localStorage (from NewLoginPage)
      const storedRole = localStorage.getItem('role');
      const storedUserId = localStorage.getItem('user_id');
      const storedEmail = localStorage.getItem('email');
      const storedFullName = localStorage.getItem('full_name');
      const storedSchoolId = localStorage.getItem('school_id');

      // If we have complete user data in localStorage, use it
      if (storedRole && storedUserId && storedEmail) {
        const authUser = {
          id: storedUserId,
          email: storedEmail,
          full_name: storedFullName || storedEmail,
          school_id: storedSchoolId || undefined,
          role: storedRole,
          email_verified: localStorage.getItem('email_verified') === 'true',
          school_setup_completed: localStorage.getItem('school_setup_completed') === 'true',
          subscription_active: localStorage.getItem('subscription_active') === 'true',
          registration_status: localStorage.getItem('registration_status') as AuthUser['registration_status'] || undefined,
        };
        console.log('Using user data from localStorage:', authUser);
        set({ authUser, isCheckingAuth: false });

        // Fetch fresh user data from the API in background to keep local storage and Zustand in sync!
        axiosInstance.get("/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }).then((res) => {
          if (res.data.status && res.data.data) {
            const freshUser = res.data.data;
            const subActive = freshUser.subscription_active === true || freshUser.subscription_active === 1;
            const setupCompleted = freshUser.school_setup_completed === true || freshUser.school_setup_completed === 1;
            const emailVerified = freshUser.email_verified === true || freshUser.email_verified === 1;
            
            localStorage.setItem('email_verified', emailVerified ? 'true' : 'false');
            localStorage.setItem('school_setup_completed', setupCompleted ? 'true' : 'false');
            localStorage.setItem('subscription_active', subActive ? 'true' : 'false');
            if (freshUser.registration_status) {
              localStorage.setItem('registration_status', freshUser.registration_status);
            }
            if (freshUser.school_id) {
              localStorage.setItem('school_id', freshUser.school_id.toString());
            }

            set({
              authUser: {
                id: freshUser.id?.toString() || storedUserId,
                email: freshUser.email || storedEmail,
                full_name: freshUser.full_name || freshUser.username || storedFullName || storedEmail,
                school_id: freshUser.school_id?.toString() || storedSchoolId || undefined,
                role: freshUser.role || storedRole,
                email_verified: emailVerified,
                school_setup_completed: setupCompleted,
                subscription_active: subActive,
                registration_status: freshUser.registration_status || undefined,
              }
            });
          }
        }).catch((err) => {
          console.error("Error in background auth sync:", err);
        });

        return;
      }

      // Otherwise, fetch from API (for regular users using old login)
      const res = await axiosInstance.get("/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      console.log("User from getUser:" , res.data.data);

      if (res.data.status) {
        set({ authUser: res.data.data });
        if (res.data.data.school_id) {
          localStorage.setItem('school_id', res.data.data.school_id.toString());
        }
      } else {
        set({ authUser: null });
        toast.error("Failed to fetch user");
      }
    } catch (error: unknown) {
      set({ authUser: null });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Error in getUser:", errorMessage);
      // Clear invalid token
      localStorage.removeItem('token');
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  //  Login Controller
  login: async (data: { email: string; password: string; school_id: string; role: string }) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post<{ token: string; message: string; }>(
        `/auth/login/${data.school_id}`,
        {
          email: data.email,
          password: data.password,
          role: data.role,
        }
      );
      const token = res.data.token;
      localStorage.setItem('token', token);

      toast.success(res.data.message || "Logged In Successfully");
      return true;
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { message?: string } })?.data?.message || "Login failed"
        : "Login failed";
      toast.error(errorMessage);
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Logout Controller
  logout: async () => {
    // Clear all auth-related localStorage items
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("school_id");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    localStorage.removeItem("full_name");
    localStorage.removeItem("role");
    localStorage.removeItem("email_verified");
    localStorage.removeItem("school_setup_completed");
    localStorage.removeItem("subscription_active");
    localStorage.removeItem("registration_status");

    set({ authUser: null });

    toast.success("Logged out successfully");
  },

  //Verify OTP Controller
  verifyForOtp: async (data: VerifyOtpData) => {
    try {
      const res = await axiosInstance.post("/auth/verify-otp", data);
      if (res.data.status) {
        toast.success(res.data.message || "OTP sent to your email");
        return true;
      } else {
        toast.error(res.data.message || "Failed to send OTP");
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { message?: string } })?.data?.message || "Failed to send OTP"
        : "Failed to send OTP";
      toast.error(errorMessage);
      return false;
    }
  },

  //Change Password Controller
  changePassword: async (data: ChangePasswordData) => {
    console.log(data)
    try {
      const res = await axiosInstance.post(
        `/auth/change-password`,
        data
      );
      if (res.data.status) {
        toast.success(res.data.message || "Password reset successfully");
        return true;
      } else {
        toast.error(res.data.message || "Failed to reset password");
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { message?: string } })?.data?.message || "Failed to reset password"
        : "Failed to reset password";
      toast.error(errorMessage);
      return false;
    }
  },

  // Get Schools Controller
  getSchoolList: async () => {
    try {
      const res = await axiosInstance.get("/auth/schools");

      if (res.data.status) {
        return res.data.data; 
      } else {
        toast.error(res.data.message || "Failed to fetch schools");
        return [];
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { message?: string } })?.data?.message 
        : error instanceof Error ? error.message : 'Unknown error';
      console.error("Error fetching schools:", errorMessage);
      toast.error("Failed to fetch schools");
      return [];
    }
  },
}));
