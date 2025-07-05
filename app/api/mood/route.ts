import { NextResponse } from "next/server";
import { analyzeMoodAndGenerateQuery } from "@/lib/gemini";
import { searchTracks } from "@/lib/spotify";

export async function POST(request: Request) {
  try {
    const { mood } = await request.json();
    
    if (!mood) {
      return NextResponse.json(
        { error: "Mood is required" },
        { status: 400 }
      );
    }

    // Get search query and playlist details from Gemini
    const { searchQuery, playlistName, playlistDescription } = 
      await analyzeMoodAndGenerateQuery(mood);

    // Search Spotify with the generated query
    const tracks = await searchTracks(searchQuery);
    const trackUris = tracks.map(track => track.uri);

    return NextResponse.json({
      searchQuery,
      playlistName,
      playlistDescription,
      tracks: tracks.map(track => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map(artist => artist.name),
        album: track.album.name,
        uri: track.uri,
        preview_url: track.preview_url,
        duration_ms: track.duration_ms,
      })),
      trackUris,
    });
  } catch (error) {
    console.error("Mood analysis error:", error);
    return NextResponse.json(
      { error: "Failed to process mood request" },
      { status: 500 }
    );
  }
}