import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface TrackInfo {
  id: string
  name: string
  artists: string[]
  album: string
  preview_url: string | null
  uri: string
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('spotify_access_token')?.value

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token' }, { status: 401 })
  }

  try {
    const { mood } = await request.json()

    if (!mood || mood.trim().length === 0) {
      return NextResponse.json({ error: 'Mood is required' }, { status: 400 })
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `Based on the mood: "${mood}", generate a Spotify search query that would find relevant music. Also create a playlist name and description.

Return a JSON response with exactly this structure:
{
  "searchQuery": "specific search terms for Spotify",
  "playlistName": "Creative playlist name",
  "playlistDescription": "Brief description of the playlist mood"
}

Make the search query specific and effective for finding music that matches the mood. Consider genres, artists, decades, languages, and emotions mentioned.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let aiResponse
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      aiResponse = {
        searchQuery: mood,
        playlistName: `${mood} Playlist`,
        playlistDescription: `A playlist based on your mood: ${mood}`
      }
    }

    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(aiResponse.searchQuery)}&type=track&limit=30&market=IN`

    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!searchResponse.ok) {
      const errorBody = await searchResponse.text()
      console.error('Spotify API Error Response:', errorBody)

      if (searchResponse.status === 401) {
        return NextResponse.json({ 
          error: 'Spotify access token expired or invalid. Please re-authenticate.' 
        }, { status: 401 })
      } else if (searchResponse.status === 403) {
        return NextResponse.json({ 
          error: 'Spotify API access forbidden. Check your app permissions.' 
        }, { status: 403 })
      } else if (searchResponse.status === 429) {
        return NextResponse.json({ 
          error: 'Spotify API rate limit exceeded. Please try again later.' 
        }, { status: 429 })
      } else {
        return NextResponse.json({ 
          error: `Spotify API error: ${searchResponse.status} - ${errorBody}` 
        }, { status: searchResponse.status })
      }
    }

    const searchData = await searchResponse.json()

    if (!searchData.tracks || !searchData.tracks.items || searchData.tracks.items.length === 0) {
      console.log('No tracks found for query:', aiResponse.searchQuery)
      return NextResponse.json({
        error: 'No tracks found for this mood',
        searchQuery: aiResponse.searchQuery,
        playlistName: aiResponse.playlistName,
        playlistDescription: aiResponse.playlistDescription,
        tracks: [],
        trackUris: [],
      })
    }

    const tracks: TrackInfo[] = searchData.tracks.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist: any) => artist.name),
      album: track.album.name,
      preview_url: track.preview_url,
      uri: track.uri,
    }))

    const playlistTracks = tracks.slice(0, 20)
    const trackUris = playlistTracks.map(track => track.uri)

    console.log(`Successfully found ${playlistTracks.length} tracks`)

    return NextResponse.json({
      searchQuery: aiResponse.searchQuery,
      playlistName: aiResponse.playlistName,
      playlistDescription: aiResponse.playlistDescription,
      tracks: playlistTracks,
      trackUris: trackUris,
    })
  } catch (error) {
    console.error('Mood processing error:', error)

    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to process mood' 
    }, { status: 500 })
  }
}