import axios from 'axios';

import { API_BASE_URL } from '@/lib/axios';

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
  return config;
});

// ==================== PRINCIPAL MESSAGE PERMISSIONS ====================

/**
 * Get message permissions for a principal
 */
export const getPrincipalMessagePermissions = async (principalId: number) => {
  const response = await apiClient.get(`/principal/${principalId}/message-permissions`);
  return response.data;
};

/**
 * Update message permissions for a principal
 */
export const updatePrincipalMessagePermissions = async (
  principalId: number,
  permissions: {
    school_id?: number;
    allow_from_teachers?: boolean;
    allow_from_parents?: boolean;
    allow_from_students?: boolean;
    allow_from_administrator?: boolean;
  }
) => {
  const response = await apiClient.put(`/principal/${principalId}/message-permissions`, permissions);
  return response.data;
};

/**
 * Get communication statistics for a principal
 */
export const getPrincipalCommunicationStats = async (principalId: number) => {
  const response = await apiClient.get(`/principal/${principalId}/communication-stats`);
  return response.data;
};

// ==================== MESSAGING ====================

/**
 * Get all conversations for a principal
 */
export const getPrincipalConversations = async (principalId: number) => {
  const response = await apiClient.get(`/principal/${principalId}/conversations`);
  return response.data;
};

/**
 * Get list of contactable users for a principal
 */
export const getPrincipalContactableUsers = async (principalId: number) => {
  const response = await apiClient.get(`/principal/${principalId}/contactable-users`);
  return response.data;
};

/**
 * Send a personal message
 */
export const sendPersonalMessage = async (data: {
  sender_role: string;
  sender_id: number;
  receiver_role: string;
  receiver_id: number;
  message: string;
  subject?: string;
}) => {
  const response = await apiClient.post('/principal/messaging/personal/send', data);
  return response.data;
};

/**
 * Get personal chat history
 */
export const getPersonalChatHistory = async (data: {
  sender_id: number;
  sender_type: string;
  receiver_id: number;
  receiver_type: string;
}) => {
  const response = await apiClient.get('/principal/messaging/personal/history', { params: data });
  return response.data;
};

/**
 * Get group chat history
 */
export const getGroupChatHistory = async (roomId: number, limit: number = 50) => {
  const response = await apiClient.get(`/principal/messaging/group/${roomId}/history`, {
    params: { limit }
  });
  return response.data;
};

/**
 * Send a group message
 */
export const sendGroupMessage = async (data: {
  sender_role: string;
  sender_id: number;
  group_id: number;
  message: string;
  subject?: string;
}) => {
  const response = await apiClient.post('/principal/messaging/group/send', data);
  return response.data;
};

// ==================== NOTICES & ANNOUNCEMENTS ====================

/**
 * Get all notices for a school
 */
export const getAllNotices = async (schoolId: number) => {
  const response = await apiClient.get(`/principal/notice/all/${schoolId}`);
  return response.data;
};

/**
 * Get active notices for a school
 */
export const getActiveNotices = async (schoolId: number) => {
  const response = await apiClient.get(`/principal/notice/active/${schoolId}`);
  return response.data;
};

/**
 * Get a single notice by ID
 */
export const getNoticeById = async (noticeId: number) => {
  const response = await apiClient.get(`/principal/notice/${noticeId}`);
  return response.data;
};

/**
 * Create a new notice
 */
export const createNotice = async (data: {
  school_id: number;
  title: string;
  content: string;
  type: 'notice' | 'announcement' | 'event' | 'holiday' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  target_roles?: string[];
  target_classes?: number[];
  publish_date?: string;
  expiry_date?: string;
  attachment_url?: string;
  created_by: number;
  created_by_role?: string;
}) => {
  const response = await apiClient.post('/principal/notice/create', data);
  return response.data;
};

/**
 * Update an existing notice
 */
export const updateNotice = async (noticeId: number, data: {
  title?: string;
  content?: string;
  type?: 'notice' | 'announcement' | 'event' | 'holiday' | 'urgent';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  target_roles?: string[];
  target_classes?: number[];
  publish_date?: string;
  expiry_date?: string;
  attachment_url?: string;
  is_active?: boolean;
}) => {
  const response = await apiClient.put(`/principal/notice/update/${noticeId}`, data);
  return response.data;
};

/**
 * Delete a notice
 */
export const deleteNotice = async (noticeId: number) => {
  const response = await apiClient.delete(`/principal/notice/delete/${noticeId}`);
  return response.data;
};

/**
 * Toggle notice active status
 */
export const toggleNoticeActive = async (noticeId: number) => {
  const response = await apiClient.post(`/principal/notice/toggle-active/${noticeId}`);
  return response.data;
};

/**
 * Mark a notice as read
 */
export const markNoticeAsRead = async (noticeId: number, readerId: number, readerType: string) => {
  const response = await apiClient.post(`/principal/notice/mark-read/${noticeId}`, {
    reader_id: readerId,
    reader_type: readerType,
  });
  return response.data;
};

/**
 * Get read count for a notice
 */
export const getNoticeReadCount = async (noticeId: number) => {
  const response = await apiClient.get(`/principal/notice/read-count/${noticeId}`);
  return response.data;
};

// Type definitions
export interface Message {
  id: string;
  sender_id: number;
  receiver_id: number;
  message: string;
  subject?: string;
  created_at: string;
  sender?: {
    id: number;
    full_name: string;
    email: string;
  };
}

export interface Conversation {
  room_id: number;
  participant_id: number;
  participant_type: string;
  last_message?: Message;
  created_at: string;
}

export interface Notice {
  id: number;
  school_id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  target_roles?: string[];
  target_classes?: number[];
  publish_date?: string;
  expiry_date?: string;
  is_active: boolean;
  attachment_url?: string;
  created_by: number;
  created_by_role?: string;
  created_at: string;
  updated_at: string;
}

export interface MessagePermissions {
  principal_id: number;
  school_id?: number;
  allow_from_teachers: boolean;
  allow_from_parents: boolean;
  allow_from_students: boolean;
  allow_from_administrator: boolean;
}

export interface CommunicationStats {
  total_messages: number;
  active_notices: number;
  unread_messages: number;
}

export interface ContactableUser {
  id: number;
  full_name: string;
  email: string;
  phone: string;
}

export interface ContactableUsers {
  teachers: ContactableUser[];
  parents: ContactableUser[];
  students: ContactableUser[];
  administrator: ContactableUser | null;
}

