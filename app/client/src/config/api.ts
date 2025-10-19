// Centralized API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  ENDPOINTS: {
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile',
    DOCUMENTS: '/api/documents',
    CHAT: '/api/chat',
  }
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
