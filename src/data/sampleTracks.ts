export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
}

// Using royalty-free music from various sources
// These are sample audio files that work great for demo purposes
export const sampleTracks: Track[] = [
  {
    id: "1",
    title: "Ethereal Dreams",
    artist: "Ambient Waves",
    album: "Cosmic Journey",
    duration: 180,
    coverUrl: "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "2",
    title: "Neon Lights",
    artist: "Synthwave Runner",
    album: "Midnight Drive",
    duration: 210,
    coverUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "3",
    title: "Ocean Breeze",
    artist: "Chill Collective",
    album: "Summer Vibes",
    duration: 195,
    coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "4",
    title: "Urban Pulse",
    artist: "Beat Masters",
    album: "City Nights",
    duration: 225,
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: "5",
    title: "Starlight Serenade",
    artist: "Cosmic Keys",
    album: "Galaxy Dreams",
    duration: 240,
    coverUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
  {
    id: "6",
    title: "Morning Dew",
    artist: "Nature Sounds",
    album: "Peaceful Moments",
    duration: 165,
    coverUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  },
  {
    id: "7",
    title: "Electric Dreams",
    artist: "Future Bass",
    album: "Digital Age",
    duration: 200,
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  },
  {
    id: "8",
    title: "Velvet Shadows",
    artist: "Jazz Ensemble",
    album: "Late Night Sessions",
    duration: 255,
    coverUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&h=400&fit=crop",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  },
];

export const samplePlaylists: Playlist[] = [
  {
    id: "pl-1",
    name: "Chill Vibes",
    description: "Relaxing tracks for your peaceful moments",
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop",
    tracks: [sampleTracks[0], sampleTracks[2], sampleTracks[5]],
  },
  {
    id: "pl-2",
    name: "Night Drive",
    description: "Perfect beats for late night adventures",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
    tracks: [sampleTracks[1], sampleTracks[3], sampleTracks[6]],
  },
  {
    id: "pl-3",
    name: "Focus Mode",
    description: "Concentrate and get things done",
    coverUrl: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=400&h=400&fit=crop",
    tracks: [sampleTracks[4], sampleTracks[7], sampleTracks[0]],
  },
  {
    id: "pl-4",
    name: "Party Mix",
    description: "Get the energy going",
    coverUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop",
    tracks: sampleTracks,
  },
];