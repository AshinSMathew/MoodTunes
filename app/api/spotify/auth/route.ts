import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-modify-public',
    'playlist-modify-private',
    'playlist-read-private',
    'playlist-read-collaborative'
  ].join(' ')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: scopes,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    state: Math.random().toString(36).substring(2, 15),
  })

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`
  
  return NextResponse.redirect(authUrl)
}