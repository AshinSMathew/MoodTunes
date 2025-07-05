"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Sparkles, Heart, Zap, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from '@/hooks/useAuth'

export default function SpotifyMoodPlaylist() {
  const router = useRouter()
  const [mood, setMood] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [playlistData, setPlaylistData] = useState<{
    searchQuery: string
    playlistName: string
    playlistDescription: string
    tracks: any[]
    trackUris: string[]
  } | null>(null)
  const [playlistUrl, setPlaylistUrl] = useState("")
  const [error, setError] = useState("")

  const handleSpotifyLogin = () => {
    // Redirect to our backend Spotify auth endpoint
    window.location.href = '/api/spotify/auth'
  }

  const handleGeneratePlaylist = async () => {
    if (!mood.trim()) return
    
    setIsLoading(true)
    setError("")
    setPlaylistData(null)
    setPlaylistUrl("")

    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      const data = await response.json()
      setPlaylistData(data)
    } catch (err) {
      console.error("Failed to generate playlist:", err)
      setError(err instanceof Error ? err.message : "Failed to generate playlist")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePlaylist = async () => {
    if (!playlistData) return
    
    setIsLoading(true)
    setError("")

    try {
      // First we need to get the current user's Spotify ID
      const userResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${getCookie('spotify_access_token')}`,
        },
      })

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data")
      }

      const userData = await userResponse.json()
      const userId = userData.id

      // Now create the playlist
      const createResponse = await fetch('/api/spotify/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCookie('spotify_access_token')}`,
        },
        body: JSON.stringify({
          userId,
          playlistName: playlistData.playlistName,
          playlistDescription: playlistData.playlistDescription,
          trackUris: playlistData.trackUris,
        }),
      })

      if (!createResponse.ok) {
        throw new Error(await createResponse.text())
      }

      const { playlistUrl } = await createResponse.json()
      setPlaylistUrl(playlistUrl)
    } catch (err) {
      console.error("Failed to create playlist:", err)
      setError(err instanceof Error ? err.message : "Failed to create playlist")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to get cookies
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return ''
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift()
    return ''
  }

  // Check if user is logged in (has access token)
   const { isLoggedIn, isLoading: authLoading } = useAuth()

  if (isLoading) {
    return <div>Checking authentication...</div>
  }

  const moodSuggestions = [
    { icon: Heart, text: "romantic malayalam songs", color: "text-pink-500" },
    { icon: Zap, text: "energetic bollywood hits", color: "text-yellow-500" },
    { icon: Sparkles, text: "chill indie vibes", color: "text-purple-500" },
    { icon: Music, text: "nostalgic 90s classics", color: "text-blue-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-500 p-3 rounded-full mr-3">
              <Music className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">MoodTunes</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Describe your mood and let AI create the perfect Spotify playlist for you
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {/* Spotify Login Card */}
          {!isLoggedIn && (
            <Card className="mb-8 border-green-200 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <div className="bg-green-500 p-2 rounded-full">
                    <Music className="h-5 w-5 text-white" />
                  </div>
                  Connect to Spotify
                </CardTitle>
                <CardDescription>Login to your Spotify account to create personalized playlists</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  onClick={handleSpotifyLogin}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg font-semibold rounded-full transition-all duration-200 transform hover:scale-105"
                  size="lg"
                >
                  <Music className="mr-2 h-5 w-5" />
                  Login with Spotify
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Mood Input Card */}
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                What's your mood?
              </CardTitle>
              <CardDescription>Describe how you're feeling or what kind of music you want to hear</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., happy malayalam songs, sad indie music, energetic workout beats..."
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="flex-1 text-lg py-3 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  onKeyPress={(e) => e.key === "Enter" && handleGeneratePlaylist()}
                />
                <Button
                  onClick={handleGeneratePlaylist}
                  disabled={!mood.trim() || !isLoggedIn || isLoading}
                  className="bg-purple-500 hover:bg-purple-600 px-6 py-3"
                >
                  {isLoading ? 'Loading...' : 'Generate'}
                </Button>
              </div>

              {/* Mood Suggestions */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">Try these moods:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {moodSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setMood(suggestion.text)}
                      className="flex items-center gap-2 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200 hover:border-gray-300"
                    >
                      <suggestion.icon className={`h-4 w-4 ${suggestion.color}`} />
                      <span className="text-sm text-gray-700">{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="py-4 text-red-600">
                {error}
              </CardContent>
            </Card>
          )}

          {playlistData && (
            <Card className="mb-8 border-green-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-green-500" />
                  Your Custom Playlist
                </CardTitle>
                <CardDescription>
                  {playlistData.playlistName} - {playlistData.playlistDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Tracks ({playlistData.tracks.length})</h3>
                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                      {playlistData.tracks.map((track, index) => (
                        <div key={track.id} className="p-3 border-b hover:bg-gray-50 flex items-center gap-3">
                          <span className="text-gray-500 w-6 text-right">{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{track.name}</p>
                            <p className="text-sm text-gray-600 truncate">
                              {track.artists.join(', ')} • {track.album}
                            </p>
                          </div>
                          {track.preview_url && (
                            <audio controls className="h-8">
                              <source src={track.preview_url} type="audio/mpeg" />
                            </audio>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {!playlistUrl ? (
                    <Button
                      onClick={handleCreatePlaylist}
                      disabled={isLoading}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Music className="mr-2 h-4 w-4" />
                          Create Playlist on Spotify
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button asChild className="w-full bg-green-500 hover:bg-green-600">
                      <a href={playlistUrl} target="_blank" rel="noopener noreferrer">
                        <Music className="mr-2 h-4 w-4" />
                        Open Playlist on Spotify
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status/Info Card */}
          <Card className="bg-gradient-to-r from-green-50 to-purple-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">How it works</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Connect your Spotify account securely</li>
                    <li>• Describe your current mood or music preference</li>
                    <li>• AI processes your input and finds perfect matches</li>
                    <li>• Get a custom playlist created in your Spotify account</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Powered by Gemini AI & Spotify Web API</p>
        </div>
      </div>
    </div>
  )
}