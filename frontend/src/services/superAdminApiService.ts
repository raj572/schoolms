import axios from 'axios';

// Super Admin uses a different API base URL than regular users
const API_BASE_URL = import.meta.env.VITE_SUPER_ADMIN_API_URL || 'http://localhost:8000/api/super-admin';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Debug logging
  console.log('📤 API Request:', {
    method: config.method?.toUpperCase(),
    baseURL: config.baseURL,
    url: config.url,
    fullURL: `${config.baseURL}${config.url}`,
  });
  
  return config;
});

// Log responses
apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION ====================

export interface SuperAdminLoginData {
  email: string;
  password: string;
}

/**
 * Super Admin Login
 */
export const superAdminLogin = async (data: SuperAdminLoginData) => {
  console.log('🔐 Super Admin Login Request');
  console.log('API Base URL:', API_BASE_URL);
  console.log('Full URL:', `${API_BASE_URL}/auth/login`);
  console.log('Login Data:', { email: data.email, password: '***' });
  
  const response = await apiClient.post('/auth/login', data);
  
  console.log('Login Response:', response.data);
  return response.data;
};

/**
 * Get authenticated super admin
 */
export const getSuperAdminMe = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

/**
 * Change password
 */
export const changeSuperAdminPassword = async (data: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}) => {
  const response = await apiClient.post('/auth/change-password', data);
  return response.data;
};

/**
 * Logout
 */
export const superAdminLogout = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

// ==================== DASHBOARD ====================

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  const response = await apiClient.get('/dashboard/stats');
  return response.data;
};

/**
 * Get revenue report
 */
export const getRevenueReport = async (params?: {
  start_date?: string;
  end_date?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);

  const response = await apiClient.get(`/reports/revenue?${queryParams.toString()}`);
  return response.data;
};

// ==================== SUBSCRIPTION PLAN MANAGEMENT ====================

export interface SubscriptionPlanData {
  name: string;
  description?: string;
  price: number;  // Base/default price
  monthly_price: number;  // Monthly subscription price
  annual_price?: number;  // Annual subscription price (optional)
  duration_days: number;
  features?: string[];
  is_active?: boolean;
  max_users?: number | null;
  max_students?: number | null;
  is_trial?: boolean;
  trial_days?: number;  // Number of days for trial period
}

/**
 * Get all subscription plans with pagination
 */
export const getSubscriptionPlans = async (params?: {
  page?: number;
  per_page?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

  const url = `/plans${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Get single plan
 */
export const getSubscriptionPlan = async (planId: number) => {
  const response = await apiClient.get(`/plans/${planId}`);
  return response.data;
};

/**
 * Create subscription plan
 */
export const createSubscriptionPlan = async (data: SubscriptionPlanData) => {
  const response = await apiClient.post('/plans', data);
  return response.data;
};

/**
 * Update subscription plan
 */
export const updateSubscriptionPlan = async (planId: number, data: Partial<SubscriptionPlanData>) => {
  const response = await apiClient.put(`/plans/${planId}`, data);
  return response.data;
};

/**
 * Delete subscription plan
 */
export const deleteSubscriptionPlan = async (planId: number) => {
  const response = await apiClient.delete(`/plans/${planId}`);
  return response.data;
};

/**
 * Toggle plan status
 */
export const togglePlanStatus = async (planId: number) => {
  const response = await apiClient.patch(`/plans/${planId}/toggle-status`);
  return response.data;
};

// ==================== SCHOOL MANAGEMENT ====================

/**
 * Get all schools
 */
export const getAllSchools = async (params?: {
  per_page?: number;
  status?: string;
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);

  const response = await apiClient.get(`/schools?${queryParams.toString()}`);
  return response.data;
};

/**
 * Toggle school status
 */
export const toggleSchoolStatus = async (schoolId: number) => {
  const response = await apiClient.patch(`/schools/${schoolId}/toggle-status`);
  return response.data;
};

// ==================== SUBSCRIPTION MANAGEMENT ====================

/**
 * Get all subscriptions
 */
export const getAllSubscriptionsSuperAdmin = async (params?: {
  per_page?: number;
  status?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params?.status) queryParams.append('status', params.status);

  const response = await apiClient.get(`/subscriptions/all?${queryParams.toString()}`);
  return response.data;
};

export interface AssignSubscriptionData {
  school_id: number;
  plan_code: string;
  billing_cycle: 'monthly' | 'annual';
  trial_days?: number;
}

/**
 * Assign subscription to school
 */
export const assignSubscriptionSuperAdmin = async (data: AssignSubscriptionData) => {
  const response = await apiClient.post('/subscriptions/assign', data);
  return response.data;
};

// ==================== ALL USERS MANAGEMENT ====================

export interface AllUser {
  id: number;
  username: string;
  email: string;
  phone: string | null;
  full_name: string;
  role: 'student' | 'teacher' | 'principal' | 'administrator' | 'parent' | 'accountant' | 'librarian';
  status: 'active' | 'inactive' | 'suspended';
  registration_status: 'pending_verification' | 'pending_school_setup' | 'pending_subscription' | 'active' | 'suspended' | 'inactive';
  assignment_status?: 'unassigned' | 'assigned';
  email_verified: boolean;
  school_setup_completed: boolean;
  subscription_active: boolean;
  school_id: number | null;
  school_name: string | null;
  student_details?: {
    class?: string;
    roll_no?: string;
    section?: string;
    admission_date?: string;
  };
  teacher_details?: {
    qualification?: string;
    employee_code?: string;
    subject?: string | null;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Get all users across all schools with advanced filtering
 */
export const getAllUsers = async (params?: {
  page?: number;
  per_page?: number;
  role?: 'student' | 'teacher' | 'principal' | 'administrator' | 'parent' | 'accountant' | 'librarian';
  school_id?: number;
  status?: 'active' | 'inactive' | 'suspended';
  registration_status?: 'pending_verification' | 'pending_school_setup' | 'pending_subscription' | 'active' | 'suspended' | 'inactive';
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params?.role) queryParams.append('role', params.role);
  if (params?.school_id) queryParams.append('school_id', params.school_id.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.registration_status) queryParams.append('registration_status', params.registration_status);
  if (params?.search) queryParams.append('search', params.search);

  const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get(url);
  return response.data;
};

// ==================== CONTACT ENQUIRIES MANAGEMENT ====================

export interface ContactEnquiry {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'pending' | 'replied' | 'resolved';
  created_at: string;
  updated_at: string;
}

/**
 * Get all contact enquiries with pagination and filters
 */
export const getAllEnquiries = async (params?: {
  page?: number;
  per_page?: number;
  status?: 'pending' | 'replied' | 'resolved';
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);

  const url = `/enquiries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Get single enquiry details
 */
export const getEnquiry = async (enquiryId: number) => {
  const response = await apiClient.get(`/enquiries/${enquiryId}`);
  return response.data;
};

/**
 * Update enquiry status
 */
export const updateEnquiryStatus = async (enquiryId: number, status: 'pending' | 'replied' | 'resolved') => {
  const response = await apiClient.patch(`/enquiries/${enquiryId}/status`, { status });
  return response.data;
};

export default {
  // Auth
  superAdminLogin,
  getSuperAdminMe,
  changeSuperAdminPassword,
  superAdminLogout,
  
  // Dashboard
  getDashboardStats,
  getRevenueReport,
  
  // Plans
  getSubscriptionPlans,
  getSubscriptionPlan,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  togglePlanStatus,
  
  // Schools
  getAllSchools,
  toggleSchoolStatus,
  
  // Subscriptions
  getAllSubscriptionsSuperAdmin,
  assignSubscriptionSuperAdmin,

  // Enquiries
  getAllEnquiries,
  getEnquiry,
  updateEnquiryStatus,
};

