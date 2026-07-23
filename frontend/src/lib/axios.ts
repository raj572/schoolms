const base_url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';


import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: base_url,
  headers: {
    'Content-Type': 'application/json',
  }
});
