export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  spotifyUri: string; // Format: spotify:track:ID or just the track ID
  coverUrl: string;
  duration: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  coverUrl: string;
  spotifyUri: string; // Format: spotify:playlist:ID or just the playlist ID
  tracks: SpotifyTrack[];
}

// Hindi Songs - Popular Bollywood tracks
export const hindiTracks: SpotifyTrack[] = [
  {
    id: "1",
    title: "Kesariya",
    artist: "Arijit Singh",
    album: "Brahmastra",
    spotifyUri: "3yfLzKF8aEc5nKt4hyMV98",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273c08202c50371e234d20caf62",
    duration: 268,
  },
  {
    id: "2",
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    album: "Aashiqui 2",
    spotifyUri: "3cCmHpzVbbSqlGD3G5sXej",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b2734a4d78f9f6a7c1b7e2c0f3d5",
    duration: 261,
  },
  {
    id: "3",
    title: "Chaleya",
    artist: "Arijit Singh, Shilpa Rao",
    album: "Jawan",
    spotifyUri: "1BxfuPKGuaTgP7aM0Bbdwr",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273ba025c7cf2dce3f84c0f7c4d",
    duration: 244,
  },
  {
    id: "4",
    title: "Raataan Lambiyan",
    artist: "Jubin Nautiyal, Asees Kaur",
    album: "Shershaah",
    spotifyUri: "2oBptDnRxUPYqTfKAMPYTW",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273e9d81e0b219c3af6e3bc5f27",
    duration: 257,
  },
  {
    id: "5",
    title: "Apna Bana Le",
    artist: "Arijit Singh",
    album: "Bhediya",
    spotifyUri: "3q8xRmLSPHTLDxcHE6M08K",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b2739e495fb707973f3390850eea",
    duration: 295,
  },
  {
    id: "6",
    title: "Phir Aur Kya Chahiye",
    artist: "Arijit Singh",
    album: "Zara Hatke Zara Bachke",
    spotifyUri: "3rUGC1vUpkDG9CZFHMur1t",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b2737ba56ae2d12b2e5a8b6c8e4f",
    duration: 284,
  },
];

// Hollywood Songs - Popular English tracks
export const hollywoodTracks: SpotifyTrack[] = [
  {
    id: "7",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    spotifyUri: "0VjIjW4GlUZAMYd2vXMi3b",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
    duration: 200,
  },
  {
    id: "8",
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    spotifyUri: "7qiZfU4dY1lWllzX7mPBI3",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96",
    duration: 234,
  },
  {
    id: "9",
    title: "Starboy",
    artist: "The Weeknd, Daft Punk",
    album: "Starboy",
    spotifyUri: "7MXVkk9YMctZqd1Srtv4MB",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452",
    duration: 230,
  },
  {
    id: "10",
    title: "Uptown Funk",
    artist: "Mark Ronson, Bruno Mars",
    album: "Uptown Special",
    spotifyUri: "32OlwWuMpZ6b0aN2RZOeMS",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b2739e495fb707973f3390850eea",
    duration: 270,
  },
  {
    id: "11",
    title: "Dance Monkey",
    artist: "Tones and I",
    album: "The Kids Are Coming",
    spotifyUri: "1rgnBhdG2JDFTbYkYRZAku",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273c6f7af36ecdc3ed6e0a1f169",
    duration: 210,
  },
  {
    id: "12",
    title: "Someone You Loved",
    artist: "Lewis Capaldi",
    album: "Divinely Uninspired...",
    spotifyUri: "7qEHsqek33rTcFNT9PFqLf",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273fc2101e6889d6ce9025f85f2",
    duration: 182,
  },
];

export const allSpotifyTracks = [...hindiTracks, ...hollywoodTracks];

export const spotifyPlaylistsData: SpotifyPlaylist[] = [
  {
    id: "hindi-hits",
    name: "Hindi Hits",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273c08202c50371e234d20caf62",
    spotifyUri: "37i9dQZF1DX0XUfTFmNBRM",
    tracks: hindiTracks,
  },
  {
    id: "hollywood-hits",
    name: "Hollywood Hits",
    coverUrl: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36",
    spotifyUri: "37i9dQZF1DXcBWIGoYBM5M",
    tracks: hollywoodTracks,
  },
];
