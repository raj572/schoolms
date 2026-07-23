import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create Axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Create Razorpay order for subscription payment
 */
export interface CreateSubscriptionOrderData {
  school_id: number;
  subscription_plan_id: number;
  billing_cycle: 'monthly' | 'annual';
}

export interface SubscriptionTransaction {
  id: number;
  school_id: number;
  subscription_plan_id: number;
  administrator_id: number;
  razorpay_order_id: string;
  order_amount: number;
  order_currency: string;
  order_receipt: string;
  order_status: string;
  order_created_at: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  payment_date?: string;
  status: 'pending' | 'success' | 'failed';
  plan_name: string;
  billing_cycle: 'monthly' | 'annual';
  duration_months: number;
  subscription_start_date: string;
  subscription_end_date: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
  school?: any;
  subscription_plan?: any;
  administrator?: any;
}

export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}

/**
 * Create a Razorpay order for subscription payment
 */
export const createSubscriptionOrder = async (data: CreateSubscriptionOrderData): Promise<ApiResponse<SubscriptionTransaction>> => {
  const response = await apiClient.post('/administrator/payments/createPaymentOrder', data);
  return response.data;
};

/**
 * Verify Razorpay payment signature
 */
export interface VerifyPaymentData {
  transaction_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const verifySubscriptionPayment = async (data: VerifyPaymentData): Promise<ApiResponse<SubscriptionTransaction>> => {
  const response = await apiClient.post('/administrator/payments/verifyPayment', data);
  return response.data;
};

/**
 * Get all subscription transactions for administrator
 */
export const getAdministratorTransactions = async (): Promise<ApiResponse<SubscriptionTransaction[]>> => {
  const response = await apiClient.get('/administrator/payments/transactions');
  return response.data;
};

/**
 * Get subscription transaction statistics for administrator
 */
export interface TransactionStats {
  total_transactions: number;
  successful_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  total_revenue: number;
  monthly_revenue: number;
}

export const getAdministratorStats = async (): Promise<ApiResponse<TransactionStats>> => {
  const response = await apiClient.get('/administrator/payments/transaction-stats');
  return response.data;
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (id: number): Promise<ApiResponse<SubscriptionTransaction>> => {
  const response = await apiClient.get(`/administrator/payments/transactions/${id}`);
  return response.data;
};

/**
 * Super Admin: Get all subscription transactions
 */
export const getAllTransactions = async (): Promise<ApiResponse<SubscriptionTransaction[]>> => {
  const response = await apiClient.get('/super-admin/subscription-transactions');
  return response.data;
};

/**
 * Super Admin: Get transaction statistics
 */
export const getAllStats = async (): Promise<ApiResponse<TransactionStats>> => {
  const response = await apiClient.get('/super-admin/subscription-transactions/stats');
  return response.data;
};

export const subscriptionPaymentApi = {
  createOrder: createSubscriptionOrder,
  verifyPayment: verifySubscriptionPayment,
  getAdministratorTransactions,
  getAdministratorStats,
  getTransactionById,
  getAllTransactions,
  getAllStats,
};

