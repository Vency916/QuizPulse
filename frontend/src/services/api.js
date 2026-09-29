import axios from 'axios';

// Normalize the backend API URL safely
const rawBaseURL = import.meta.env.VITE_API_URL || '/api';
const cleanBaseURL = rawBaseURL.trim().replace(/\/+$/, '');
const baseURL = cleanBaseURL.endsWith('/api')
  ? cleanBaseURL
  : (cleanBaseURL === '' ? '/api' : `${cleanBaseURL}/api`);

const api = axios.create({
  baseURL,
  timeout: 15000, // 15 second request timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to attach Bearer token for admin or X-Session-Token for participants
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('qp_admin_token');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }

  const participantToken = localStorage.getItem('qp_session_token');
  if (participantToken) {
    config.headers['X-Session-Token'] = participantToken;
  }

  return config;
}, (error) => Promise.reject(error));

// Comprehensive Response Error Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Network / Server Unreachable / CORS / SSL Failure
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        error.friendlyMessage = 'Request timed out. Please check your internet connection or server status.';
      } else {
        error.friendlyMessage = `Cannot reach backend API (${baseURL}). Please verify your network connection, backend hosting, and CORS settings.`;
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // 2. Format human-friendly message based on status
    if (status === 401) {
      error.friendlyMessage = data?.message || 'Session expired or unauthorized. Please log in again.';
      // Auto-redirect if on an admin page (except login)
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('qp_admin_token');
        localStorage.removeItem('qp_admin_user');
        window.location.href = '/admin/login';
      }
    } else if (status === 403) {
      error.friendlyMessage = data?.message || 'Access denied. You do not have permission for this action.';
    } else if (status === 404) {
      error.friendlyMessage = data?.message || 'The requested resource or session was not found.';
    } else if (status === 422) {
      // Laravel Validation Errors
      if (data?.errors && typeof data.errors === 'object') {
        const firstErrors = Object.values(data.errors).flat();
        error.friendlyMessage = firstErrors.length > 0 ? firstErrors.join(' ') : (data.message || 'Validation failed.');
      } else {
        error.friendlyMessage = data?.message || 'Invalid input provided.';
      }
    } else if (status >= 500) {
      error.friendlyMessage = data?.message || 'Backend server error (500). Please check Laravel logs or database connection.';
    } else {
      error.friendlyMessage = data?.message || `Request failed with error status ${status}.`;
    }

    return Promise.reject(error);
  }
);

export default api;
