import axios from 'axios';

import { API_BASE_URL } from '@/lib/axios';

// Create axios instance
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

// ==================== REGISTRATION APIs ====================

export const registerUser = async (data: {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  role?: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
  return response.data;
};

// Email verification removed - users are auto-verified
// export const verifyEmail = async (token: string) => {
//   const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, { token });
//   return response.data;
// };

// export const resendVerification = async (email: string) => {
//   const response = await axios.post(`${API_BASE_URL}/auth/resend-verification`, { email });
//   return response.data;
// };

export const registerSchool = async (userId: number, schoolData: any) => {
  const response = await apiClient.post(`/registration/school/${userId}`, schoolData);
  return response.data;
};

export const getRegistrationProgress = async (userId: number) => {
  const response = await apiClient.get(`/registration/progress/${userId}`);
  return response.data;
};

// ==================== SUBSCRIPTION APIs ====================

export const getSubscriptionPlans = async () => {
  const response = await axios.get(`${API_BASE_URL}/subscriptions/plans`);
  return response.data;
};

export const initiateSubscription = async (data: {
  plan_code: string;
  billing_cycle: 'monthly' | 'annual';
  school_id: number;
  user_id: number;
  trial_days?: number;
}) => {
  const response = await apiClient.post('/subscriptions/initiate', data);
  return response.data;
};

export const getCurrentSubscription = async (schoolId: number) => {
  const response = await apiClient.get(`/subscriptions/current/${schoolId}`);
  return response.data;
};

export const cancelSubscription = async (subscriptionId: number, reason?: string) => {
  const response = await apiClient.put(`/subscriptions/${subscriptionId}/cancel`, { reason });
  return response.data;
};

export const getSubscriptionHistory = async (schoolId: number) => {
  const response = await apiClient.get(`/subscriptions/history/${schoolId}`);
  return response.data;
};

export const checkFeatureAccess = async (schoolId: number, feature: string) => {
  const response = await apiClient.get(`/subscriptions/check-feature/${schoolId}/${feature}`);
  return response.data;
};

export const checkResourceLimit = async (schoolId: number, resource: string, currentCount: number) => {
  const response = await apiClient.get(`/subscriptions/check-limit/${schoolId}/${resource}?current=${currentCount}`);
  return response.data;
};

// ==================== PAYMENT APIs ====================

export const verifyPayment = async (paymentData: any) => {
  const response = await apiClient.post('/subscriptions/payment-callback', paymentData);
  return response.data;
};

export const getPaymentTransactions = async (schoolId: number) => {
  const response = await apiClient.get(`/payments/transactions/${schoolId}`);
  return response.data;
};

// ==================== HELPER TYPES ====================

export interface SubscriptionPlan {
  id: number;
  name: string;
  code: string;
  description: string;
  price: number;  // Base/default price
  monthly_price: number;  // Monthly subscription price
  annual_price: number;  // Annual subscription price
  currency: string;
  max_students: number | null;
  max_teachers: number | null;
  max_staff: number | null;
  max_users?: number | null;
  max_classes: number | null;
  features: Record<string, boolean>;
  is_active: boolean;
  is_popular: boolean;
  is_trial?: boolean;
  trial_days?: number;
}

export interface Subscription {
  id: number;
  school_id: number;
  plan_id: number;
  status: string;
  start_date: string;
  end_date: string;
  trial_end_date: string | null;
  amount: number;
  billing_cycle: 'monthly' | 'annual';
  plan: SubscriptionPlan;
}

// Grouped API object for easier imports
export const subscriptionApi = {
  // Registration
  register: registerUser,
  // verifyEmail, // Removed - email verification disabled
  // resendVerification, // Removed - email verification disabled
  setupSchool: registerSchool,
  getProgress: getRegistrationProgress,
  
  // Subscription Plans
  getSubscriptionPlans,
  initiateSubscription,
  getCurrentSubscription,
  cancelSubscription,
  getHistory: getSubscriptionHistory,
  checkFeature: checkFeatureAccess,
  checkLimit: checkResourceLimit,
  
  // Payment
  verifyPayment,
  getTransactions: getPaymentTransactions,
};

