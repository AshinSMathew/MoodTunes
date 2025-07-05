import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('spotify_access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 })
  }

  try {
    const { userId, playlistName, playlistDescription, trackUris } = await request.json()

    const createResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: playlistName,
        description: playlistDescription,
        public: false,
      }),
    })

    if (!createResponse.ok) {
      throw new Error('Failed to create playlist')
    }

    const playlist = await createResponse.json()

    if (trackUris.length > 0) {
      const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: trackUris,
        }),
      })

      if (!addTracksResponse.ok) {
        throw new Error('Failed to add tracks to playlist')
      }
    }

    return NextResponse.json({ 
      playlistUrl: playlist.external_urls.spotify,
      playlistId: playlist.id 
    })
  } catch (error) {
    console.error('Create playlist error:', error)
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 })
  }
}