import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// School interface
export interface School {
  id: number;
  name: string;
  school_code?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  principal_name?: string;
  principal_email?: string;
  principal_phone?: string;
  board?: string;
  affiliation_number?: string;
  website?: string;
  description?: string;
  established_date?: string;
  status?: string;
  administrator_id?: number;
  subscription_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Subscription Assignment interface
export interface SubscriptionAssignment {
  school_id: number;
  subscription_plan_id: number;
  start_date?: string;
  end_date?: string;
}

// Principal interfaces
export interface Principal {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  username: string;
  school_id: number | null;
  school_name?: string;
  status: string;
  assignment_status: string;
  administrator_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PrincipalFormData {
  full_name: string;
  email: string;
  phone: string;
  username: string;
  school_id: number | null;
  status: string;
}

interface AdministratorDetails {
  id: number;
  full_name: string;
  username: string;
    email: string;
  phone?: string;
  administrator_id?: number;
}

interface DashboardData {
  stats: {
    total_schools: number;
    active_schools: number;
    total_users: number;
    active_subscriptions: number;
    trial_subscriptions: number;
    expired_subscriptions: number;
    total_revenue: number;
    monthly_revenue: number;
    pending_payments: number;
  };
  revenue_growth?: Array<{ month: string; revenue: number; schools: number }>;
  plan_distribution?: Array<{ name: string; value: number; color: string }>;
  subscription_trend?: Array<{ month: string; active: number; trial: number; expired: number }>;
  top_schools?: Array<{ name: string; revenue: number; plan: string; status: string }>;
  recent_schools?: Array<{ name: string; city: string; plan: string; status: string; joined_date: string }>;
}

export const getAdministratorDashboard = async (): Promise<{ status: boolean; data?: DashboardData; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/administrator/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  return response.data;
  } catch (error: any) {
    console.error('Error fetching administrator dashboard:', error);
    const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard data';
    toast.error(errorMessage);
    return { status: false, message: errorMessage };
  }
};

export const getAdministratorDetails = async (administratorId: number): Promise<{ status: boolean; data?: AdministratorDetails; message?: string }> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/principal/administrator/${administratorId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  return response.data;
  } catch (error: any) {
    console.error('Error fetching administrator details:', error);
    const errorMessage = error.response?.data?.message || 'Failed to fetch administrator details';
    return { status: false, message: errorMessage };
  }
};

export const requestSubscription = async (): Promise<{ status: boolean; message?: string; data?: any }> => {
  try {
    const token = localStorage.getItem('token');
    console.log('Sending subscription request to:', `${API_BASE_URL}/principal/request-subscription`);
    
    const response = await axios.post(`${API_BASE_URL}/principal/request-subscription`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Subscription request response:', response.data);
  return response.data;
  } catch (error: any) {
    console.error('Error requesting subscription:', error);
    console.error('Error details:', error.response?.data);
    const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to send subscription request';
    toast.error(errorMessage);
    return { status: false, message: errorMessage };
  }
};

// ==================== SCHOOL MANAGEMENT ====================

export const getAllSchools = async (filters?: Record<string, string>) => {
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams(filters || {}).toString();
    const url = params ? `${API_BASE_URL}/administrator/school/getall?${params}` : `${API_BASE_URL}/administrator/school/getall`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  return response.data;
  } catch (error: any) {
    console.error('Error fetching schools:', error);
    toast.error('Failed to fetch schools');
    return { status: false, data: [], message: 'Failed to fetch schools' };
  }
};

export const getSchoolById = async (schoolId: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/administrator/school/get/${schoolId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  return response.data;
  } catch (error: any) {
    console.error('Error fetching school details:', error);
    toast.error('Failed to fetch school details');
    return { status: false, message: 'Failed to fetch school details' };
  }
};

export const toggleSchoolStatus = async (schoolId: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_BASE_URL}/administrator/school/${schoolId}/toggle-status`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  return response.data;
  } catch (error: any) {
    console.error('Error toggling school status:', error);
    toast.error('Failed to update school status');
    return { status: false, message: 'Failed to update school status' };
  }
};

export const getSchoolSubscription = async (schoolId: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/administrator/subscriptions/school/${schoolId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  return response.data;
  } catch (error: any) {
    console.error('Error fetching school subscription:', error);
    return { status: false, message: 'Failed to fetch subscription' };
  }
};

export const assignSubscription = async (assignment: SubscriptionAssignment) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/administrator/subscriptions/assign`, {
      school_id: assignment.school_id,
      subscription_plan_id: assignment.subscription_plan_id,
      start_date: assignment.start_date,
      end_date: assignment.end_date,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  return response.data;
  } catch (error: any) {
    console.error('Error assigning subscription:', error);
    toast.error('Failed to assign subscription');
    return { status: false, message: 'Failed to assign subscription' };
  }
};

// ==================== SUBSCRIPTION PLANS ====================

export const getSubscriptionPlans = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/subscriptions/plans`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  return response.data;
  } catch (error: any) {
    console.error('Error fetching subscription plans:', error);
    toast.error('Failed to fetch subscription plans');
    return { status: false, data: [], message: 'Failed to fetch subscription plans' };
  }
};

// ==================== PRINCIPAL MANAGEMENT ====================

export const getAllPrincipals = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/administrator/principals`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  return response.data;
  } catch (error: any) {
    console.error('Error fetching principals:', error);
    toast.error('Failed to fetch principals');
    return { status: false, data: [], message: 'Failed to fetch principals' };
  }
};

export const createPrincipal = async (data: PrincipalFormData) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Creating principal with data:', data);
    
    const response = await axios.post(`${API_BASE_URL}/administrator/principals/create`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Principal creation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating principal:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        'Failed to create principal';
    
    toast.error(errorMessage);
    return { 
      status: false, 
      message: errorMessage,
      errors: error.response?.data?.errors 
    };
  }
};

export const updatePrincipal = async (id: number, data: Partial<PrincipalFormData>) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Updating principal with data:', data);
    
    const response = await axios.put(`${API_BASE_URL}/administrator/principals/update/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Principal update response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating principal:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        'Failed to update principal';
    
    toast.error(errorMessage);
    return { 
      status: false, 
      message: errorMessage,
      errors: error.response?.data?.errors 
    };
  }
};

export const assignPrincipalToSchool = async (principalId: number, schoolId: number) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Assigning principal to school:', { principalId, schoolId });
    
    const response = await axios.post(`${API_BASE_URL}/administrator/principals/assign-to-school`, {
      principal_id: principalId,
      school_id: schoolId,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Assignment response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error assigning principal to school:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        'Failed to assign principal to school';
    
    toast.error(errorMessage);
    return { 
      status: false, 
      message: errorMessage,
      errors: error.response?.data?.errors 
    };
  }
};

export const deletePrincipal = async (id: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_BASE_URL}/administrator/principals/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error deleting principal:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        'Failed to delete principal';
    
    toast.error(errorMessage);
    return { 
      status: false, 
      message: errorMessage 
    };
  }
};

export const togglePrincipalStatus = async (id: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_BASE_URL}/administrator/principals/toggle-status/${id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error toggling principal status:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        'Failed to update principal status';
    
    toast.error(errorMessage);
    return { 
      status: false, 
      message: errorMessage 
    };
  }
};

export const resendPrincipalCredentials = async (id: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/administrator/principals/resend-credentials/${id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error resending credentials:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        'Failed to resend credentials';
    
    toast.error(errorMessage);
    return { 
      status: false, 
      message: errorMessage 
    };
  }
};

export const resetPrincipalPassword = async (id: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/administrator/principals/reset-password/${id}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error resetting password:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        'Failed to reset password';
    
    toast.error(errorMessage);
    return { 
      status: false, 
      message: errorMessage 
    };
  }
};

export const unassignPrincipalFromSchool = async (principalId: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/administrator/principals/unassign-from-school/${principalId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error unassigning principal:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        'Failed to unassign principal from school';
    
    toast.error(errorMessage);
    return { 
      status: false, 
      message: errorMessage 
    };
  }
};

// ==================== SUBSCRIPTIONS ====================

export const getAllSubscriptionsAdmin = async (params?: { per_page?: number; status?: string }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/administrator/subscriptions/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: params,
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    toast.error('Failed to fetch subscriptions');
    return { status: false, data: [], message: 'Failed to fetch subscriptions' };
  }
};

// ==================== SCHOOL FORMS ====================

export interface SchoolFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  email: string;
  phone: string;
  principal_name?: string;
  principal_email?: string;
  principal_phone?: string;
  school_code?: string;
  board?: string;
  affiliation_number?: string;
  website?: string;
  description?: string;
  established_date?: string;
  status?: string;
}

export const createSchool = async (data: SchoolFormData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/administrator/school/register`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error creating school:', error);
    const errorMessage = error.response?.data?.message || 'Failed to create school';
    toast.error(errorMessage);
    return { status: false, message: errorMessage };
  }
};

export const updateSchool = async (schoolId: number, data: Partial<SchoolFormData>) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/administrator/school/update/${schoolId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error updating school:', error);
    const errorMessage = error.response?.data?.message || 'Failed to update school';
    toast.error(errorMessage);
    return { status: false, message: errorMessage };
  }
};
