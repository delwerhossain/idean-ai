const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001');

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  provider: string;
  photoURL?: string;
  businessId?: string;
  business?: any;
}

export interface CreateBusinessData {
  businessName: string;
  industry: string;
  businessType: string;
  description?: string;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    console.log('APIClient constructor - baseURL:', baseURL);
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('API Debug:');
    console.log('- baseURL:', this.baseURL);
    console.log('- endpoint:', endpoint);
    console.log('- final URL:', url);
    
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed:`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(firebaseToken: string) {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ firebaseToken }),
    });
  }

  async register(data: { email: string; name: string; provider?: string }) {
    return this.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/api/v1/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken(token: string) {
    return this.request('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async verifyToken() {
    return this.request('/api/v1/auth/verify', {
      method: 'GET',
    });
  }

  // Business endpoints
  async createBusiness(data: CreateBusinessData) {
    return this.request('/api/v1/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

const apiClient = new APIClient(API_BASE_URL);

export const authAPI = {
  login: (firebaseToken: string) => apiClient.login(firebaseToken),
  register: (data: { email: string; name: string; provider?: string }) => 
    apiClient.register(data),
  logout: () => apiClient.logout(),
  refreshToken: (token: string) => apiClient.refreshToken(token),
  verifyToken: () => apiClient.verifyToken(),
};

export const businessAPI = {
  createBusiness: (data: CreateBusinessData) => apiClient.createBusiness(data),
};

export default apiClient;