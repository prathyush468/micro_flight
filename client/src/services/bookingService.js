import api from './api';

export const bookingService = {
  async createBooking(bookingData) {
    const res = await api.post('/bookings', bookingData);
    return res.data;
  },

  async getMyBookings(status) {
    const query = status ? `?status=${status}` : '';
    const res = await api.get(`/bookings/my${query}`);
    return res.data;
  },

  async getBookingDetails(idOrPnr) {
    const res = await api.get(`/bookings/${idOrPnr}`);
    return res.data;
  },

  async cancelBooking(idOrPnr, reason) {
    const res = await api.post(`/bookings/${idOrPnr}/cancel`, { reason });
    return res.data;
  },

  // Admin Dashboard and Bookings
  async getAdminDashboard() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getAdminBookings(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    const res = await api.get(`/admin/bookings?${query.toString()}`);
    return res.data;
  },

  async getAdminUsers() {
    const res = await api.get('/admin/users');
    return res.data;
  },

  async createAirport(airportData) {
    const res = await api.post('/admin/airports', airportData);
    return res.data;
  },

  async updateAirport(airportId, airportData) {
    const res = await api.put(`/admin/airports/${airportId}`, airportData);
    return res.data;
  }
};

export default bookingService;
