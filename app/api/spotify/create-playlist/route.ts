import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { createPlaylist } from "@/lib/spotify";

export async function POST(request: NextRequest) {
  try {
    const session = getSession(request);
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { userId, playlistName, playlistDescription, trackUris } = 
      await request.json();

    if (!userId || !playlistName || !trackUris) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const playlist = await createPlaylist(
      userId,
      session.accessToken,
      playlistName,
      playlistDescription,
      trackUris
    );

    return NextResponse.json({
      playlistUrl: playlist.external_urls.spotify,
      });
  } catch (error) {
    console.error("Playlist creation error:", error);
    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 }
    );
  }
}