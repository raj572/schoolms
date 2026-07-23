import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const getAuthToken = () => {
  return localStorage.getItem('token') || '';
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Statistics
export const getHostelStatistics = async (schoolId: number) => {
  const response = await apiClient.get(`/principal/hostel/statistics/${schoolId}`);
  return response.data;
};

// Buildings
export const getAllBuildings = async (schoolId: number) => {
  const response = await apiClient.get(`/principal/hostel/buildings/all/${schoolId}`);
  return response.data;
};

export const getBuilding = async (buildingId: number) => {
  const response = await apiClient.get(`/principal/hostel/buildings/${buildingId}`);
  return response.data;
};

export const createBuilding = async (data: any) => {
  const response = await apiClient.post(`/principal/hostel/buildings/create`, data);
  return response.data;
};

export const updateBuilding = async (buildingId: number, data: any) => {
  const response = await apiClient.put(`/principal/hostel/buildings/update/${buildingId}`, data);
  return response.data;
};

export const deleteBuilding = async (buildingId: number) => {
  const response = await apiClient.delete(`/principal/hostel/buildings/delete/${buildingId}`);
  return response.data;
};

// Rooms
export const getAllRooms = async (schoolId: number, buildingId?: number) => {
  const url = buildingId 
    ? `/principal/hostel/rooms/all/${schoolId}?building_id=${buildingId}`
    : `/principal/hostel/rooms/all/${schoolId}`;
  const response = await apiClient.get(url);
  return response.data;
};

export const getAvailableRooms = async (schoolId: number) => {
  const response = await apiClient.get(`/principal/hostel/rooms/available/${schoolId}`);
  return response.data;
};

export const getRoom = async (roomId: number) => {
  const response = await apiClient.get(`/principal/hostel/rooms/${roomId}`);
  return response.data;
};

export const createRoom = async (data: any) => {
  const response = await apiClient.post(`/principal/hostel/rooms/create`, data);
  return response.data;
};

export const updateRoom = async (roomId: number, data: any) => {
  const response = await apiClient.put(`/principal/hostel/rooms/update/${roomId}`, data);
  return response.data;
};

export const deleteRoom = async (roomId: number) => {
  const response = await apiClient.delete(`/principal/hostel/rooms/delete/${roomId}`);
  return response.data;
};

// Allocations
export const getAllAllocations = async (schoolId: number, activeOnly?: boolean) => {
  const url = activeOnly 
    ? `/principal/hostel/allocations/all/${schoolId}?active_only=true`
    : `/principal/hostel/allocations/all/${schoolId}`;
  const response = await apiClient.get(url);
  return response.data;
};

export const getStudentAllocation = async (studentId: number) => {
  const response = await apiClient.get(`/principal/hostel/allocations/student/${studentId}`);
  return response.data;
};

export const allocateRoom = async (data: any) => {
  const response = await apiClient.post(`/principal/hostel/allocations/allocate`, data);
  return response.data;
};

export const vacateRoom = async (allocationId: number, remarks?: string) => {
  const response = await apiClient.post(`/principal/hostel/allocations/vacate/${allocationId}`, { remarks });
  return response.data;
};

export const transferRoom = async (allocationId: number, newRoomId: number, remarks?: string) => {
  const response = await apiClient.post(`/principal/hostel/allocations/transfer/${allocationId}`, { 
    new_room_id: newRoomId,
    remarks 
  });
  return response.data;
};
