declare module "spotify" {
  export interface Track {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: { name: string };
    uri: string;
    preview_url: string | null;
    duration_ms: number;
  }

  export interface Playlist {
    id: string;
    name: string;
    description: string;
    external_urls: { spotify: string };
  }
}