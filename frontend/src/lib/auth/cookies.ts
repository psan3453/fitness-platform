import { cookies } from 'next/headers';

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  let accessExp = Date.now() + 15 * 60 * 1000;
  try {
    const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
    if (payload.exp) accessExp = payload.exp * 1000;
  } catch {
    // Ignore invalid JWT format
  }

  cookieStore.set('fp_access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(accessExp),
  });

  cookieStore.set('fp_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('fp_access_token');
  cookieStore.delete('fp_refresh_token');
}
