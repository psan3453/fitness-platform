'use server';

import { headers, cookies } from 'next/headers';
import { fetchApi, ApiError } from '../api/fetcher';
import { setAuthCookies, clearAuthCookies } from './cookies';
import { redirect } from 'next/navigation';
import { ActionState, LoginResponseDto, RegisterResponseDto } from './types';

async function verifyCsrf() {
  const headersList = await headers();
  const origin = headersList.get('origin');
  const host = headersList.get('host');
  
  if (!origin || !host) {
    throw new Error('CSRF validation failed: Missing origin or host headers');
  }

  try {
    const originUrl = new URL(origin);
    // Compare exact host including port for robust CSRF protection
    if (originUrl.host !== host) {
      throw new Error('CSRF validation failed: Origin does not match host');
    }
  } catch {
    throw new Error('CSRF validation failed: Invalid origin');
  }
}

export async function loginAction(prevState: ActionState | null, formData: FormData): Promise<ActionState | null> {
  await verifyCsrf();
  
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const data = await fetchApi<LoginResponseDto>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await setAuthCookies(data.tokens.accessToken, data.tokens.refreshToken);
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred' };
  }

  redirect('/dashboard');
}

export async function registerAction(prevState: ActionState | null, formData: FormData): Promise<ActionState | null> {
  await verifyCsrf();
  
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const firstName = formData.get('firstName')?.toString();
  const lastName = formData.get('lastName')?.toString() || undefined;

  if (!email || !password || !firstName) {
    return { error: 'Email, password, and first name are required' };
  }

  try {
    const data = await fetchApi<RegisterResponseDto>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });

    await setAuthCookies(data.tokens.accessToken, data.tokens.refreshToken);
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  await verifyCsrf();
  
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('fp_refresh_token')?.value;

  if (refreshToken) {
    try {
      await fetchApi('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
        skipRefresh: true,
      });
    } catch {
      // Ignore backend logout failures, still clear local session
    }
  }

  await clearAuthCookies();
  redirect('/');
}
