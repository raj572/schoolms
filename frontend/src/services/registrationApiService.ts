import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Types for OTP registration flow
interface SendOTPRequest {
  full_name: string;
  email: string;
  phone: string;
}

interface SendOTPResponse {
  status: boolean;
  message: string;
  data?: {
    email: string;
    expires_in: number;
  };
  error?: string;
}

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

interface VerifyOTPResponse {
  status: boolean;
  message: string;
  data?: {
    user_id: string;
    email: string;
    role: string;
    email_verified: boolean;
    school_setup_completed: boolean;
  };
  token?: string;
  error?: string;
}

/**
 * Send OTP to email for registration
 */
export const sendRegistrationOTP = async (data: SendOTPRequest): Promise<SendOTPResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/send-registration-otp`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

/**
 * Verify OTP and complete registration
 */
export const verifyOTPAndRegister = async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-otp-and-register`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

// Export as grouped object for convenience
export const registrationApi = {
  sendOTP: sendRegistrationOTP,
  verifyOTP: verifyOTPAndRegister,
};

