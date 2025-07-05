import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('spotify_access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 })
  }

  try {
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      if (userResponse.status === 401) {
        return NextResponse.json({ error: 'Token expired' }, { status: 401 })
      }
      throw new Error('Failed to fetch user data')
    }

    const userData = await userResponse.json()
    return NextResponse.json(userData)
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}