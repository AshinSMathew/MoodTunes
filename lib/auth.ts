// lib/auth.ts
import { cookies } from 'next/headers'

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
) {
  const cookieStore = await cookies()
  
  // Set access token with expiration
  cookieStore.set('spotify_access_token', accessToken, {
    maxAge: expiresIn, // This is in seconds from Spotify API
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
  
  // Set refresh token without expiration (it doesn't expire)
  cookieStore.set('spotify_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // Don't set maxAge for refresh token as it doesn't expire
  })
  
  // Debug logs
  console.log('Access token set:', accessToken.substring(0, 20) + '...')
  console.log('Refresh token set:', refreshToken.substring(0, 20) + '...')
  console.log('Expires in:', expiresIn, 'seconds')
}

export async function getAuthCookies(): Promise<{
  accessToken: string | undefined;
  refreshToken: string | undefined;
}> {
  const cookieStore = await cookies()
  
  const accessToken = cookieStore.get('spotify_access_token')?.value
  const refreshToken = cookieStore.get('spotify_refresh_token')?.value
  
  // Debug logs
  console.log('Retrieved access token:', accessToken ? 'exists' : 'not found')
  console.log('Retrieved refresh token:', refreshToken ? 'exists' : 'not found')
  
  return {
    accessToken,
    refreshToken,
  }
}

// Helper function to clear auth cookies
export async function clearAuthCookies() {
  const cookieStore = await cookies()
  
  cookieStore.delete('spotify_access_token')
  cookieStore.delete('spotify_refresh_token')
}