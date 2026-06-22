// src/utils/api.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refresh}` }
          });
          const { access_token } = res.data;
          localStorage.setItem('access_token', access_token);
          original.headers.Authorization = `Bearer ${access_token}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data)     => api.post('/auth/register', data),
  login:          (data)     => api.post('/auth/login', data),
  getProfile:     ()         => api.get('/auth/profile'),
  updateProfile:  (data)     => api.put('/auth/profile', data),
  changePassword: (data)     => api.post('/auth/change-password', data),
};

// ── Resume ────────────────────────────────────────────────────────────────
export const resumeAPI = {
  upload:          (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  }),
  getMyResumes:    ()         => api.get('/resume/my-resumes'),
  getResume:       (id)       => api.get(`/resume/${id}`),
  deleteResume:    (id)       => api.delete(`/resume/${id}`),
  reanalyze:       (id)       => api.post(`/resume/${id}/analyze`),
  getDashboard:    ()         => api.get('/resume/dashboard/stats'),
};

// ── Jobs ──────────────────────────────────────────────────────────────────
export const jobsAPI = {
  getJobs:       (category) => api.get('/jobs/', { params: { category } }),
  getCategories: ()         => api.get('/jobs/categories'),
  getSkills:     (category) => api.get('/jobs/skills', { params: { category } }),
};

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  getAnalytics:  ()          => api.get('/admin/analytics'),
  getUsers:      (page)      => api.get('/admin/users', { params: { page } }),
  getUser:       (id)        => api.get(`/admin/users/${id}`),
  toggleUser:    (id)        => api.patch(`/admin/users/${id}/toggle`),
  getResumes:    (page)      => api.get('/admin/resumes', { params: { page } }),
  getJobRoles:   ()          => api.get('/admin/job-roles'),
  createJobRole: (data)      => api.post('/admin/job-roles', data),
  updateJobRole: (id, data)  => api.put(`/admin/job-roles/${id}`, data),
  deleteJobRole: (id)        => api.delete(`/admin/job-roles/${id}`),
  getSkills:     ()          => api.get('/admin/skills'),
  createSkill:   (data)      => api.post('/admin/skills', data),
  deleteSkill:   (id)        => api.delete(`/admin/skills/${id}`),
  seedDatabase:  ()          => api.post('/admin/seed'),
};

export default api;
