import { cookies } from 'next/headers';
import { API_URL } from './config';
import { setAuthCookies, clearAuthCookies } from '../auth/cookies';
import { RefreshResponseDto } from '../auth/types';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export interface FetchApiOptions extends RequestInit {
  skipRefresh?: boolean;
}

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: FetchApiOptions = {},
  isRetry = false
): Promise<T> {
  const { skipRefresh, ...fetchOptions } = options;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('fp_access_token')?.value;

  const headers = new Headers(fetchOptions.headers || {});
  
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (!(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (
    response.status === 401 && 
    !isRetry && 
    !skipRefresh && 
    endpoint !== '/api/auth/refresh' && 
    endpoint !== '/api/auth/login' && 
    endpoint !== '/api/auth/register'
  ) {
    // Attempt refresh
    const refreshToken = cookieStore.get('fp_refresh_token')?.value;
    
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = (await refreshResponse.json()) as RefreshResponseDto;
          
          await setAuthCookies(newAccessToken, newRefreshToken);

          // Retry original request
          const newHeaders = new Headers(fetchOptions.headers || {});
          newHeaders.set('Authorization', `Bearer ${newAccessToken}`);
          if (!(fetchOptions.body instanceof FormData)) {
            newHeaders.set('Content-Type', 'application/json');
          }

          const retryResponse = await fetch(url, { ...fetchOptions, headers: newHeaders });
          return handleResponse<T>(retryResponse);
        } else {
          // Refresh failed, clear session
          await clearAuthCookies();
        }
      } catch {
        // Network or parse error during refresh
        await clearAuthCookies();
      }
    } else {
      // No refresh token available, clear session
      await clearAuthCookies();
    }
  }

  return handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  let data: unknown;
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorData = data as Record<string, unknown>;
    throw new ApiError(
      response.status,
      (errorData?.message as string) || response.statusText || 'API request failed',
      data
    );
  }

  return data as T;
}
