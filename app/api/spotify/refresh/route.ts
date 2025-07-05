import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('spotify_refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
  }

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to refresh token')
    }

    const tokenData = await tokenResponse.json()
    
    const response = NextResponse.json({ success: true })
    
    response.cookies.set('spotify_access_token', tokenData.access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 500 })
  }
}