
const API_BASE_URL = '/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('cena-auth-token');
};

// API wrapper with automatic token attachment
export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, logout user
        localStorage.removeItem('cena-auth-token');
        localStorage.removeItem('cena-user');
        window.location.href = '/#/login';
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  },

  get(endpoint: string) {
    return this.request(endpoint);
  },

  post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },
};
