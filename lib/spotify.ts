import SpotifyWebApi from "spotify-web-api-node";

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

export async function searchTracks(query: string, limit = 20) {
  try {
    const data = await spotifyApi.searchTracks(query, { limit });
    return data.body.tracks?.items || [];
  } catch (error) {
    console.error("Spotify search error:", error);
    throw new Error("Failed to search tracks");
  }
}

export async function createPlaylist(
  userId: string,
  accessToken: string,
  name: string,
  description: string,
  trackUris: string[]
) {
  spotifyApi.setAccessToken(accessToken);

  try {
    const options: any = {
      description,
      public: true,
    };

    // Manually setting the name property
    options['name'] = name;

    const playlist = await spotifyApi.createPlaylist(userId, options);

    await spotifyApi.addTracksToPlaylist(playlist.body.id, trackUris);
    return playlist.body;
  } catch (error) {
    console.error("Spotify playlist creation error:", error);
    throw new Error("Failed to create playlist");
  }
}

export function createAuthorizeURL() {
  const scopes = [
    "playlist-modify-public",
    "playlist-modify-private",
    "user-read-private",
    "user-read-email",
  ];
  
  return spotifyApi.createAuthorizeURL(scopes, "state");
}

export async function authorize(code: string) {
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    return {
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,
      expiresIn: data.body.expires_in,
    };
  } catch (error) {
    console.error("Spotify authorization error:", error);
    throw new Error("Failed to authorize");
  }
}