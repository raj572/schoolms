import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== TYPES ====================

export interface School {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
}

export interface FeeStructure {
  id: number;
  school_id: number;
  class: string;
  monthly_fee: number;
  other_fee: number;
  registration_fee: number;
  admission_fee: number;
  school?: School;
  created_at?: string;
  updated_at?: string;
}

export interface MonthlyPayment {
  id: number;
  school_id: number;
  student_details_id: number;
  month: string;
  total_amount: number;
  status: 'due' | 'paid' | 'pending';
  payment_date?: string;
  mode?: 'cash' | 'online' | 'cheque';
  remarks?: string;
  student?: {
    id: number;
    candidate_name: string;
    class: string;
    section?: string;
    roll_no?: string;
  };
  school?: School;
  items?: Array<{
    id: number;
    service_id?: number;
    label: string;
    amount: number;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface AnnualPayment {
  id: number;
  school_id: number;
  student_details_id: number;
  admission_fee: number;
  registration_fee: number;
  other_fee?: number;
  total_amount: number;
  status: 'due' | 'paid';
  payment_date?: string;
  mode?: 'online' | 'cash' | 'card' | 'upi';
  remarks?: string;
  studentDetail?: {
    id: number;
    candidate_name: string;
    class: string;
  };
  school?: School;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceCharge {
  id: number;
  school_id: number;
  service_type: string;
  service_name: string;
  charge: number;
  description?: string;
  stopage?: string;
  school?: School;
  created_at?: string;
  updated_at?: string;
}

export interface StudentExtraService {
  id: number;
  student_details_id: number;
  service_id: number;
  student?: {
    id: number;
    candidate_name: string;
    class: string;
  };
  service?: ServiceCharge;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  total_revenue: number;
  pending_dues: number;
  this_month_revenue: number;
  total_students_with_fees: number;
  recent_transactions: MonthlyPayment[];
}

export interface FeeCollectionReport {
  total_collection: number;
  transaction_count: number;
  collection_by_school: Array<{
    school_id: number;
    total: number;
    school?: School;
  }>;
  period: {
    start_date?: string;
    end_date?: string;
  };
}

export interface PendingDuesReport {
  monthly_pending: MonthlyPayment[];
  annual_pending: AnnualPayment[];
  total_pending_amount: number;
  total_students_with_pending: number;
}

export interface PaymentHistoryItem {
  id: number;
  type: 'monthly' | 'annual';
  student_name: string;
  school_name: string;
  amount: number;
  status: string;
  payment_date?: string;
  mode?: string;
  created_at: string;
}

// ==================== API METHODS ====================

/**
 * Get accessible schools for the accountant
 */
export const getAccessibleSchools = async (): Promise<{
  status: boolean;
  message: string;
  data: School[];
  error?: any;
}> => {
  const response = await apiClient.get('/accountant/schools/accessible');
  return response.data;
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (schoolId?: number): Promise<{
  status: boolean;
  message: string;
  data: DashboardStats;
  error?: any;
}> => {
  const params = schoolId ? { school_id: schoolId } : {};
  const response = await apiClient.get('/accountant/dashboard/stats', { params });
  return response.data;
};

// ==================== FEE STRUCTURE MANAGEMENT ====================

/**
 * Get all fee structures
 */
export const getAllFeeStructures = async (schoolId?: number): Promise<{
  status: boolean;
  message: string;
  data: FeeStructure[];
  error?: any;
}> => {
  const params = schoolId ? { school_id: schoolId } : {};
  const response = await apiClient.get('/accountant/fee-structure/all', { params });
  return response.data;
};

/**
 * Create fee structure
 */
export const createFeeStructure = async (data: {
  school_id: number;
  class: string;
  monthly_fee: number;
  other_fee: number;
  registration_fee: number;
  admission_fee: number;
}): Promise<{
  status: boolean;
  message: string;
  data: FeeStructure;
  error?: any;
}> => {
  const response = await apiClient.post('/accountant/fee-structure/create', data);
  return response.data;
};

/**
 * Update fee structure
 */
export const updateFeeStructure = async (
  id: number,
  data: {
    class?: string;
    monthly_fee?: number;
    other_fee?: number;
    registration_fee?: number;
    admission_fee?: number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: FeeStructure;
  error?: any;
}> => {
  const response = await apiClient.put(`/accountant/fee-structure/update/${id}`, data);
  return response.data;
};

/**
 * Delete fee structure
 */
export const deleteFeeStructure = async (id: number): Promise<{
  status: boolean;
  message: string;
  data: null;
  error?: any;
}> => {
  const response = await apiClient.delete(`/accountant/fee-structure/delete/${id}`);
  return response.data;
};

// ==================== MONTHLY PAYMENT MANAGEMENT ====================

/**
 * Get all monthly payments
 */
export const getAllMonthlyPayments = async (filters?: {
  school_id?: number;
  student_details_id?: number;
  month?: string;
  status?: 'due' | 'paid' | 'pending';
  per_page?: number;
  page?: number;
}): Promise<{
  status: boolean;
  message: string;
  data: {
    data: MonthlyPayment[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
  error?: any;
}> => {
  const response = await apiClient.get('/accountant/monthly-payments/all', { params: filters });
  return response.data;
};

/**
 * Create monthly payment
 */
export const createMonthlyPayment = async (data: {
  school_id: number;
  student_details_id: number;
  month: string;
  total_amount: number;
  status?: 'due' | 'paid' | 'pending';
  payment_date?: string;
  mode?: 'cash' | 'online' | 'cheque';
  remarks?: string;
}): Promise<{
  status: boolean;
  message: string;
  data: MonthlyPayment;
  error?: any;
}> => {
  const response = await apiClient.post('/accountant/monthly-payments/create', data);
  return response.data;
};

/**
 * Update monthly payment
 */
export const updateMonthlyPayment = async (
  id: number,
  data: {
    status?: 'due' | 'paid' | 'pending';
    payment_date?: string;
    mode?: 'cash' | 'online' | 'cheque';
    remarks?: string;
    total_amount?: number;
  }
): Promise<{
  status: boolean;
  message: string;
  data: MonthlyPayment;
  error?: any;
}> => {
  const response = await apiClient.put(`/accountant/monthly-payments/update/${id}`, data);
  return response.data;
};

/**
 * Generate monthly dues for a school
 */
export const generateMonthlyDues = async (schoolId: number): Promise<{
  status: boolean;
  message: string;
  data: null;
  error?: any;
}> => {
  const response = await apiClient.post(`/accountant/monthly-payments/generate-dues/${schoolId}`);
  return response.data;
};

// ==================== ANNUAL PAYMENT MANAGEMENT ====================

/**
 * Get all annual payments
 */
export const getAllAnnualPayments = async (filters?: {
  school_id?: number;
  student_details_id?: number;
  status?: 'due' | 'paid';
  per_page?: number;
  page?: number;
}): Promise<{
  status: boolean;
  message: string;
  data: {
    data: AnnualPayment[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
  error?: any;
}> => {
  const response = await apiClient.get('/accountant/annual-payments/all', { params: filters });
  return response.data;
};

/**
 * Create annual payment
 */
export const createAnnualPayment = async (data: {
  school_id: number;
  student_details_id: number;
  admission_fee: number;
  registration_fee: number;
  other_fee?: number;
  status?: 'due' | 'paid';
  payment_date?: string;
  mode?: 'online' | 'cash' | 'card' | 'upi';
  remarks?: string;
}): Promise<{
  status: boolean;
  message: string;
  data: AnnualPayment;
  error?: any;
}> => {
  const response = await apiClient.post('/accountant/annual-payments/create', data);
  return response.data;
};

/**
 * Update annual payment
 */
export const updateAnnualPayment = async (
  id: number,
  data: {
    admission_fee?: number;
    registration_fee?: number;
    other_fee?: number;
    status?: 'due' | 'paid';
    payment_date?: string;
    mode?: 'online' | 'cash' | 'card' | 'upi';
    remarks?: string;
  }
): Promise<{
  status: boolean;
  message: string;
  data: AnnualPayment;
  error?: any;
}> => {
  const response = await apiClient.put(`/accountant/annual-payments/update/${id}`, data);
  return response.data;
};

/**
 * Delete annual payment
 */
export const deleteAnnualPayment = async (id: number): Promise<{
  status: boolean;
  message: string;
  data: null;
  error?: any;
}> => {
  const response = await apiClient.delete(`/accountant/annual-payments/delete/${id}`);
  return response.data;
};

// ==================== SERVICE CHARGE MANAGEMENT ====================

/**
 * Get all service charges
 */
export const getAllServiceCharges = async (schoolId?: number): Promise<{
  status: boolean;
  message: string;
  data: ServiceCharge[];
  error?: any;
}> => {
  const params = schoolId ? { school_id: schoolId } : {};
  const response = await apiClient.get('/accountant/service-charges/all', { params });
  return response.data;
};

/**
 * Create service charge
 */
export const createServiceCharge = async (data: {
  school_id: number;
  service_type: string;
  service_name: string;
  charge: number;
  description?: string;
  stopage?: string;
}): Promise<{
  status: boolean;
  message: string;
  data: ServiceCharge;
  error?: any;
}> => {
  const response = await apiClient.post('/accountant/service-charges/create', data);
  return response.data;
};

/**
 * Update service charge
 */
export const updateServiceCharge = async (
  id: number,
  data: {
    service_type?: string;
    service_name?: string;
    charge?: number;
    description?: string;
    stopage?: string;
  }
): Promise<{
  status: boolean;
  message: string;
  data: ServiceCharge;
  error?: any;
}> => {
  const response = await apiClient.put(`/accountant/service-charges/update/${id}`, data);
  return response.data;
};

/**
 * Delete service charge
 */
export const deleteServiceCharge = async (id: number): Promise<{
  status: boolean;
  message: string;
  data: null;
  error?: any;
}> => {
  const response = await apiClient.delete(`/accountant/service-charges/delete/${id}`);
  return response.data;
};

// ==================== EXTRA SERVICE MANAGEMENT ====================

/**
 * Get student extra services
 */
export const getStudentExtraServices = async (schoolId: number): Promise<{
  status: boolean;
  message: string;
  data: StudentExtraService[];
  error?: any;
}> => {
  const response = await apiClient.get(`/accountant/extra-services/students/${schoolId}`);
  return response.data;
};

/**
 * Assign extra service to student
 */
export const assignExtraService = async (data: {
  student_details_id: number;
  service_id: number;
}): Promise<{
  status: boolean;
  message: string;
  data: StudentExtraService;
  error?: any;
}> => {
  const response = await apiClient.post('/accountant/extra-services/assign', data);
  return response.data;
};

/**
 * Remove extra service from student
 */
export const removeExtraService = async (id: number): Promise<{
  status: boolean;
  message: string;
  data: null;
  error?: any;
}> => {
  const response = await apiClient.delete(`/accountant/extra-services/remove/${id}`);
  return response.data;
};

// ==================== REPORTS ====================

/**
 * Get fee collection report
 */
export const getFeeCollectionReport = async (filters?: {
  school_id?: number;
  start_date?: string;
  end_date?: string;
}): Promise<{
  status: boolean;
  message: string;
  data: FeeCollectionReport;
  error?: any;
}> => {
  const response = await apiClient.get('/accountant/reports/fee-collection', { params: filters });
  return response.data;
};

/**
 * Get pending dues report
 */
export const getPendingDuesReport = async (filters?: {
  school_id?: number;
}): Promise<{
  status: boolean;
  message: string;
  data: PendingDuesReport;
  error?: any;
}> => {
  const response = await apiClient.get('/accountant/reports/pending-dues', { params: filters });
  return response.data;
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (filters?: {
  school_id?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
}): Promise<{
  status: boolean;
  message: string;
  data: PaymentHistoryItem[];
  error?: any;
}> => {
  const response = await apiClient.get('/accountant/reports/payment-history', { params: filters });
  return response.data;
};

// ==================== EXPORT GROUPED API ====================

const accountantApi = {
  // Dashboard
  getAccessibleSchools,
  getDashboardStats,
  
  // Fee Structure
  getAllFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  
  // Monthly Payments
  getAllMonthlyPayments,
  createMonthlyPayment,
  updateMonthlyPayment,
  generateMonthlyDues,
  
  // Annual Payments
  getAllAnnualPayments,
  createAnnualPayment,
  updateAnnualPayment,
  deleteAnnualPayment,
  
  // Service Charges
  getAllServiceCharges,
  createServiceCharge,
  updateServiceCharge,
  deleteServiceCharge,
  
  // Extra Services
  getStudentExtraServices,
  assignExtraService,
  removeExtraService,
  
  // Reports
  getFeeCollectionReport,
  getPendingDuesReport,
  getPaymentHistory,
};

export default accountantApi;

