/**
 * Authenticated API client utility
 * Automatically includes Authorization header with access token
 */

export interface ApiClientOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiClient(
  url: string,
  options: ApiClientOptions = {}
): Promise<Response> {
  const { skipAuth, ...fetchOptions } = options;

  // Get access token from localStorage
  const accessToken = !skipAuth ? localStorage.getItem('accessToken') : null;

  // Prepare headers
  const headers = new Headers(fetchOptions.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Make request
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Handle 401 Unauthorized - token expired
  if (response.status === 401 && !skipAuth) {
    // Try to refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        localStorage.setItem('accessToken', data.accessToken);

        // Retry original request with new token
        headers.set('Authorization', `Bearer ${data.accessToken}`);
        return fetch(url, {
          ...fetchOptions,
          headers,
        });
      } else {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    } else {
      // No refresh token, redirect to login
      window.location.href = '/login';
    }
  }

  return response;
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: (url: string, options?: ApiClientOptions) =>
    apiClient(url, { ...options, method: 'GET' }),

  post: (url: string, body?: any, options?: ApiClientOptions) =>
    apiClient(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: (url: string, body?: any, options?: ApiClientOptions) =>
    apiClient(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: (url: string, body?: any, options?: ApiClientOptions) =>
    apiClient(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: (url: string, options?: ApiClientOptions) =>
    apiClient(url, { ...options, method: 'DELETE' }),
};
