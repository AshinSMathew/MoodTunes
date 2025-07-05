import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('spotify_access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ isLoggedIn: false })
  }

  try {
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (userResponse.ok) {
      const userData = await userResponse.json()
      return NextResponse.json({ 
        isLoggedIn: true, 
        user: {
          id: userData.id,
          display_name: userData.display_name,
          email: userData.email,
          images: userData.images
        }
      })
    } else {
      return NextResponse.json({ isLoggedIn: false })
    }
  } catch (error) {
    console.error('Auth status check error:', error)
    return NextResponse.json({ isLoggedIn: false })
  }
}