import api from './api';

export const flightService = {
  async getAirports() {
    const res = await api.get('/airports');
    return res.data;
  },

  async searchFlights(params = {}) {
    const query = new URLSearchParams();
    if (params.origin) query.append('origin', params.origin);
    if (params.destination) query.append('destination', params.destination);
    if (params.departureDate) query.append('departureDate', params.departureDate);
    if (params.passengers) query.append('passengers', params.passengers);
    if (params.airline) query.append('airline', params.airline);
    if (params.minPrice) query.append('minPrice', params.minPrice);
    if (params.maxPrice) query.append('maxPrice', params.maxPrice);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const res = await api.get(`/flights?${query.toString()}`);
    return res.data;
  },

  async getFlightById(flightId) {
    const res = await api.get(`/flights/${flightId}`);
    return res.data;
  },

  // Admin Operations
  async createFlight(flightData) {
    const res = await api.post('/flights', flightData);
    return res.data;
  },

  async updateFlight(flightId, flightData) {
    const res = await api.put(`/flights/${flightId}`, flightData);
    return res.data;
  },

  async updateFlightStatus(flightId, status) {
    const res = await api.patch(`/flights/${flightId}/status`, { status });
    return res.data;
  }
};

export default flightService;
