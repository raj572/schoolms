const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (url) {
    const cleanUrl = url.replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  return 'http://localhost:8000/api';
};

export const API_BASE_URL = getApiBaseUrl();

import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});
