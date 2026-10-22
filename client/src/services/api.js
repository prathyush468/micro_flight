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
    
    // Safely parse JSON body (guards against empty responses, 502/504 HTML proxy errors)
    let data = {};
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

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
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Unexpected end of JSON')) {
      throw new Error('Unable to connect to the backend server. Please verify that the SkyBook API server is running on port 5000.');
    }
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
