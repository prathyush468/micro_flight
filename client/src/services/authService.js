import api from './api';

export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('skybook_token', res.data.token);
      localStorage.setItem('skybook_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async register(formData) {
    const res = await api.post('/auth/register', formData);
    if (res.data?.token) {
      localStorage.setItem('skybook_token', res.data.token);
      localStorage.setItem('skybook_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout() {
    localStorage.removeItem('skybook_token');
    localStorage.removeItem('skybook_user');
  }
};

export default authService;
