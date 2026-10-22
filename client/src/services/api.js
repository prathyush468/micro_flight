/**
 * Centralized API Client Module
 * Provides unified HTTP request dispatching, JWT injection, and standard error handling
 */

const API_BASE_URL = '/api';

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('skybook_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // If unauthorized token, clear saved token
      if (response.status === 401 && token) {
        localStorage.removeItem('skybook_token');
        localStorage.removeItem('skybook_user');
      }
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`[API Error: ${endpoint}]`, error.message);
    throw error;
  }
};

export default {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' })
};
