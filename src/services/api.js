import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// AUTH
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// SERVICES
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getAllAdmin: () => api.get('/services/all'),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// BARBERS
export const barbersAPI = {
  getAll: () => api.get('/barbers'),
  getAvailable: () => api.get('/barbers/available'),
  getMe: () => api.get('/barbers/me'),                          // barber's own profile
  getMyAppointments: () => api.get('/barbers/my-appointments'), // barber's own appointments
  create: (data) => api.post('/barbers', data),
  update: (id, data) => api.put(`/barbers/${id}`, data),
  delete: (id) => api.delete(`/barbers/${id}`),
  updateStatus: (id, status) => api.patch(`/barbers/${id}/status`, { status }),
};

// APPOINTMENTS
export const appointmentsAPI = {
  book: (data) => api.post('/appointments/book', data),
  getMy: () => api.get('/appointments/my'),
  getAll: () => api.get('/appointments/all'),
  getToday: () => api.get('/appointments/today'),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`),
};

// ADMIN
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getCustomers: () => api.get('/admin/customers'),
  toggleCustomer: (id) => api.patch(`/admin/customers/${id}/toggle`),
  getRevenueReport: (days) => api.get(`/admin/reports/revenue?days=${days}`),
};

// AI
export const aiAPI = {
  getInsights: () => api.get('/ai/insights'),
};

export default api;
