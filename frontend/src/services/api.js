import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid admin token
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('qp_admin_token');
        localStorage.removeItem('qp_admin_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
