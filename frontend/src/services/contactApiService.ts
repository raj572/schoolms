import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance for public endpoints (no auth token needed)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== CONTACT FORM APIs ====================

export interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

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
 * Submit contact form enquiry
 */
export const submitContactForm = async (data: ContactFormData) => {
  const response = await apiClient.post('/contact/submit', data);
  return response.data;
};

export default {
  submitContactForm,
};

