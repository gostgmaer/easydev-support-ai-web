import axios from 'axios';
import { useAuthStore } from '../store/uiStore';

// Base Axios Instance pointing to our NestJS Backend
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject the Tenant ID and Auth token dynamically
apiClient.interceptors.request.use((config) => {
  const { tenantId } = useAuthStore.getState();
  
  // Example token injection (In a real app, this would be the IAM JWT)
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (tenantId) {
    config.headers['X-Tenant-Id'] = tenantId;
  }
  
  return config;
});
