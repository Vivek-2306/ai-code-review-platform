import { getApiUrl } from '@/config/env';

export interface ApiClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || getApiUrl();
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization token
   */
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Make GET request
   */
  async get<T>(path: string, config?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'GET',
    });
  }

  /**
   * Make POST request
   */
  async post<T>(path: string, data?: any, config?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make PUT request
   */
  async put<T>(path: string, data?: any, config?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make DELETE request
   */
  async delete<T>(path: string, config?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'DELETE',
    });
  }

  /**
   * Make request
   */
  private async request<T>(path: string, config: RequestInit = {}): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;

    const response = await fetch(url, {
      ...config,
      headers: {
        ...this.defaultHeaders,
        ...config.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'An error occurred',
      }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Default API client instance
export const apiClient = new ApiClient();
