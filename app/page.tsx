"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Sparkles, Heart, Zap } from "lucide-react"

export default function SpotifyMoodPlaylist() {
  const [mood, setMood] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleSpotifyLogin = () => {
    // This will be handled by your backend
    console.log("Initiating Spotify OAuth...")
    // You can redirect to your backend endpoint that handles Spotify OAuth
    // window.location.href = '/api/auth/spotify'
  }

  const handleGeneratePlaylist = () => {
    if (!mood.trim()) return
    console.log("Generating playlist for mood:", mood)
    // This will call your backend API with the mood
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
                  disabled={!mood.trim() || !isLoggedIn}
                  className="bg-purple-500 hover:bg-purple-600 px-6 py-3"
                >
                  Generate
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
