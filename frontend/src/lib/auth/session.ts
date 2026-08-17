import { cookies } from 'next/headers';
import { fetchApi, ApiError } from '../api/fetcher';
import { SafeUser } from './types';

export async function getAuthUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('fp_access_token')?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const data = await fetchApi<{ user: SafeUser }>('/api/auth/me', {
      skipRefresh: true,
    });
    return data.user;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      // It's a clean authentication failure
      return null;
    }
    // Unexpected error (e.g. 500, network error) - do not silently hide it
    throw error;
  }
}
