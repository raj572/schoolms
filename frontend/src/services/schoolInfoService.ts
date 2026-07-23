import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/principal';

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

// School Complete Info
export const getCompleteSchoolInfo = async (schoolId: number) => {
  const response = await apiClient.get(`/school-complete-info/${schoolId}`);
  return response.data;
};

// School Basic Info
export const updateSchoolBasicInfo = async (schoolId: number, data: any) => {
  const response = await apiClient.put(`/school/update/${schoolId}`, data);
  return response.data;
};

export const uploadSchoolLogo = async (schoolId: number, file: File) => {
  const formData = new FormData();
  formData.append('logo_file', file);
  
  const response = await axios.post(
    `${API_BASE_URL}/school/update-logo/${schoolId}`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const uploadPrincipalSignature = async (schoolId: number, file: File) => {
  const formData = new FormData();
  formData.append('principal_sign_file', file);
  
  const response = await axios.post(
    `${API_BASE_URL}/school/update-principal-signature/${schoolId}`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// Facilities
export const createFacility = async (schoolId: number, data: any) => {
  const response = await apiClient.post(`/school-facilities/create/${schoolId}`, data);
  return response.data;
};

export const getFacilities = async (schoolId: number) => {
  const response = await apiClient.get(`/school-facilities/getall/${schoolId}`);
  return response.data;
};

export const updateFacility = async (facilityId: number, data: any) => {
  const response = await apiClient.put(`/school-facilities/update/${facilityId}`, data);
  return response.data;
};

export const deleteFacility = async (facilityId: number) => {
  const response = await apiClient.delete(`/school-facilities/delete/${facilityId}`);
  return response.data;
};

// Achievements
export const createAchievement = async (schoolId: number, data: any, certificateFile?: File) => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description || '');
  formData.append('year', data.year);
  formData.append('category', data.category || '');
  
  if (certificateFile) {
    formData.append('certificate_file', certificateFile);
  }
  
  const response = await axios.post(
    `${API_BASE_URL}/school-achievements/create/${schoolId}`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const getAchievements = async (schoolId: number) => {
  const response = await apiClient.get(`/school-achievements/getall/${schoolId}`);
  return response.data;
};

export const updateAchievement = async (achievementId: number, data: any, certificateFile?: File) => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description || '');
  formData.append('year', data.year);
  formData.append('category', data.category || '');
  
  if (certificateFile) {
    formData.append('certificate_file', certificateFile);
  }
  
  const response = await axios.post(
    `${API_BASE_URL}/school-achievements/update/${achievementId}`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'multipart/form-data',
        'X-HTTP-Method-Override': 'PUT', // Laravel workaround for PUT with multipart
      },
    }
  );
  return response.data;
};

export const deleteAchievement = async (achievementId: number) => {
  const response = await apiClient.delete(`/school-achievements/delete/${achievementId}`);
  return response.data;
};

// Timings
export const createTiming = async (schoolId: number, data: any) => {
  const response = await apiClient.post(`/school-timings/create/${schoolId}`, data);
  return response.data;
};

export const getTimings = async (schoolId: number) => {
  const response = await apiClient.get(`/school-timings/getall/${schoolId}`);
  return response.data;
};

export const updateTiming = async (timingId: number, data: any) => {
  const response = await apiClient.put(`/school-timings/update/${timingId}`, data);
  return response.data;
};

export const deleteTiming = async (timingId: number) => {
  const response = await apiClient.delete(`/school-timings/delete/${timingId}`);
  return response.data;
};

export const bulkUpdateTimings = async (schoolId: number, timings: any[]) => {
  const response = await apiClient.post(`/school-timings/bulk-update/${schoolId}`, { timings });
  return response.data;
};

// Stats
export const getSchoolStats = async (schoolId: number) => {
  const response = await apiClient.get(`/stats/${schoolId}`);
  return response.data;
};

