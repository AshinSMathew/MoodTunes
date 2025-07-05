// api/spotify/callback/route.ts
import { NextResponse } from 'next/server'
import { authorize } from '@/lib/spotify'
import { setAuthCookies } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(
      new URL('/?error=missing_code', request.url)
    )
  }

  try {
    const { accessToken, refreshToken, expiresIn } = await authorize(code)
    
    // Use the auth helper function instead of directly setting cookies
    await setAuthCookies(accessToken, refreshToken, expiresIn)

    // Debug log - remove in production
    console.log('Cookies set successfully')
    
    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(
      new URL(`/?error=auth_failed`, request.url)
    )
  }
}