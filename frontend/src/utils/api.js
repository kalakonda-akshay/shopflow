import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally (token expired)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sf_token');
      localStorage.removeItem('sf_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
};

// ── Products ─────────────────────────────────────────────
export const productAPI = {
  getAll:    (params) => api.get('/products', { params }),
  getOne:    (id)     => api.get(`/products/${id}`),
  adminAll:  ()       => api.get('/products/admin/all'),
  create:    (data)   => api.post('/products', data),
  update:    (id, d)  => api.put(`/products/${id}`, d),
  delete:    (id)     => api.delete(`/products/${id}`),
};

// ── Orders ───────────────────────────────────────────────
export const orderAPI = {
  create:       (data) => api.post('/orders', data),
  mine:         ()     => api.get('/orders/mine'),
  getOne:       (id)   => api.get(`/orders/${id}`),
  all:          ()     => api.get('/orders'),
  updateStatus: (id, s)=> api.put(`/orders/${id}`, { status: s }),
  stats:        ()     => api.get('/orders/admin/stats'),
};

export default api;
