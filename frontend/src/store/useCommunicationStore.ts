import { create } from "zustand";
import { toast } from "sonner";
import * as communicationApi from "../services/communicationApiService";
import type {
  Message,
  Conversation,
  Notice,
  MessagePermissions,
  CommunicationStats,
  ContactableUsers,
  ContactableUser,
} from "../services/communicationApiService";

interface CommunicationState {
  // State
  messages: Message[];
  conversations: Conversation[];
  notices: Notice[];
  activeNotices: Notice[];
  permissions: MessagePermissions | null;
  stats: CommunicationStats | null;
  contactableUsers: ContactableUsers | null;
  selectedConversation: Conversation | null;
  
  // Loading states
  isLoading: boolean;
  isSendingMessage: boolean;
  isCreatingNotice: boolean;
  
  // Actions
  loadConversations: (principalId: number) => Promise<void>;
  loadContactableUsers: (principalId: number) => Promise<void>;
  loadPermissions: (principalId: number) => Promise<void>;
  loadStats: (principalId: number) => Promise<void>;
  loadNotices: (schoolId: number) => Promise<void>;
  loadActiveNotices: (schoolId: number) => Promise<void>;
  
  sendPersonalMessage: (data: {
    sender_role: string;
    sender_id: number;
    receiver_role: string;
    receiver_id: number;
    message: string;
    subject?: string;
  }) => Promise<boolean>;
  
  createNotice: (data: {
    school_id: number;
    title: string;
    content: string;
    type: 'notice' | 'announcement' | 'event' | 'holiday' | 'urgent';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    target_roles?: string[];
    target_classes?: number[];
    publish_date?: string;
    expiry_date?: string;
    created_by: number;
    created_by_role?: string;
  }) => Promise<boolean>;
  
  updatePermissions: (principalId: number, permissions: Partial<MessagePermissions>) => Promise<boolean>;
  toggleNoticeActive: (noticeId: number) => Promise<void>;
  deleteNotice: (noticeId: number) => Promise<void>;
  
  setSelectedConversation: (conversation: Conversation | null) => void;
  clearState: () => void;
}

export const useCommunicationStore = create<CommunicationState>((set, get) => ({
  // Initial state
  messages: [],
  conversations: [],
  notices: [],
  activeNotices: [],
  permissions: null,
  stats: null,
  contactableUsers: null,
  selectedConversation: null,
  isLoading: false,
  isSendingMessage: false,
  isCreatingNotice: false,

  // Load conversations
  loadConversations: async (principalId: number) => {
    set({ isLoading: true });
    try {
      const response = await communicationApi.getPrincipalConversations(principalId);
      if (response.status && response.data) {
        set({ conversations: response.data, isLoading: false });
      } else {
        toast.error("Failed to load conversations");
        set({ isLoading: false });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load conversations");
      set({ isLoading: false });
    }
  },

  // Load contactable users
  loadContactableUsers: async (principalId: number) => {
    set({ isLoading: true });
    try {
      const response = await communicationApi.getPrincipalContactableUsers(principalId);
      if (response.status && response.data) {
        set({ contactableUsers: response.data, isLoading: false });
      } else {
        toast.error("Failed to load contactable users");
        set({ isLoading: false });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load contactable users");
      set({ isLoading: false });
    }
  },

  // Load message permissions
  loadPermissions: async (principalId: number) => {
    try {
      const response = await communicationApi.getPrincipalMessagePermissions(principalId);
      if (response.status && response.data) {
        set({ permissions: response.data });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load permissions");
    }
  },

  // Load communication stats
  loadStats: async (principalId: number) => {
    try {
      const response = await communicationApi.getPrincipalCommunicationStats(principalId);
      if (response.status && response.data) {
        set({ stats: response.data });
      }
    } catch (error: any) {
      console.error("Failed to load stats:", error);
    }
  },

  // Load notices
  loadNotices: async (schoolId: number) => {
    set({ isLoading: true });
    try {
      const response = await communicationApi.getAllNotices(schoolId);
      if (response.status && Array.isArray(response.data)) {
        set({ notices: response.data, isLoading: false });
      } else {
        toast.error("Failed to load notices");
        set({ isLoading: false });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load notices");
      set({ isLoading: false });
    }
  },

  // Load active notices
  loadActiveNotices: async (schoolId: number) => {
    try {
      const response = await communicationApi.getActiveNotices(schoolId);
      if (response.status && Array.isArray(response.data)) {
        set({ activeNotices: response.data });
      }
    } catch (error: any) {
      console.error("Failed to load active notices:", error);
    }
  },

  // Send personal message
  sendPersonalMessage: async (data) => {
    set({ isSendingMessage: true });
    try {
      const response = await communicationApi.sendPersonalMessage(data);
      if (response.success || response.status) {
        toast.success("Message sent successfully");
        set({ isSendingMessage: false });
        return true;
      } else {
        toast.error(response.message || "Failed to send message");
        set({ isSendingMessage: false });
        return false;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
      set({ isSendingMessage: false });
      return false;
    }
  },

  // Create notice
  createNotice: async (data) => {
    set({ isCreatingNotice: true });
    try {
      const response = await communicationApi.createNotice(data);
      if (response.status) {
        toast.success("Notice created successfully");
        set({ isCreatingNotice: false });
        return true;
      } else {
        toast.error(response.message || "Failed to create notice");
        set({ isCreatingNotice: false });
        return false;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create notice");
      set({ isCreatingNotice: false });
      return false;
    }
  },

  // Update permissions
  updatePermissions: async (principalId: number, permissions) => {
    try {
      const response = await communicationApi.updatePrincipalMessagePermissions(principalId, permissions);
      if (response.status) {
        toast.success("Permissions updated successfully");
        set({ permissions: response.data });
        return true;
      } else {
        toast.error(response.message || "Failed to update permissions");
        return false;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update permissions");
      return false;
    }
  },

  // Toggle notice active status
  toggleNoticeActive: async (noticeId: number) => {
    try {
      const response = await communicationApi.toggleNoticeActive(noticeId);
      if (response.status) {
        toast.success("Notice status updated");
        // Reload notices
        const { notices } = get();
        const updatedNotices = notices.map(notice =>
          notice.id === noticeId ? { ...notice, is_active: !notice.is_active } : notice
        );
        set({ notices: updatedNotices });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update notice");
    }
  },

  // Delete notice
  deleteNotice: async (noticeId: number) => {
    try {
      const response = await communicationApi.deleteNotice(noticeId);
      if (response.status) {
        toast.success("Notice deleted successfully");
        // Remove from state
        const { notices } = get();
        set({ notices: notices.filter(notice => notice.id !== noticeId) });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete notice");
    }
  },

  // Set selected conversation
  setSelectedConversation: (conversation: Conversation | null) => {
    set({ selectedConversation: conversation });
  },

  // Clear state
  clearState: () => {
    set({
      messages: [],
      conversations: [],
      notices: [],
      activeNotices: [],
      permissions: null,
      stats: null,
      contactableUsers: null,
      selectedConversation: null,
      isLoading: false,
      isSendingMessage: false,
      isCreatingNotice: false,
    });
  },
}));

