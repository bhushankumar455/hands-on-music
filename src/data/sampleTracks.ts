export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  audioUrl?: string; // playable mp3 only
  externalUrl?: string; // SoundCloud / external link
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
}

// Generate 100+ sample tracks with variety
const coverImages = [
  "https://pagalnew.com/coverimages/title-track-dhurandhar-500-500.jpg",
  "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
];

const trackNames = ["Dhurandhar Title Track", "Sunrise Melody", "Ocean Waves", "City Lights"];

const artistNames = ["Hanumankind, Jasmine Sandlas", "Chill Collective", "Beat Masters", "Cosmic Keys"];

const albumNames = ["Dhurandhar", "Midnight Drive", "Summer Vibes", "City Nights"];

// ✅ ONLY REAL MP3 FILES HERE
const audioUrls = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
];

// Generate sample tracks
export const sampleTracks: Track[] = Array.from({ length: 40 }, (_, i) => {
  // 🔥 Special handling for Dhurandhar song
  if (i === 0) {
    return {
      id: "1",
      title: "Dhurandhar Title Track",
      artist: "Hanumankind, Jasmine Sandlas",
      album: "Dhurandhar",
      duration: 0,
      coverUrl: coverImages[0],

      // ✅ PLAYABLE MP3 (demo)
      audioUrl: audioUrls[0],

      // 🔗 REAL SoundCloud link
      externalUrl: "https://on.soundcloud.com/XToHfTVJE4HJZ4ZNOy",
    };
  }

  return {
    id: String(i + 1),
    title: trackNames[i % trackNames.length],
    artist: artistNames[i % artistNames.length],
    album: albumNames[i % albumNames.length],
    duration: 150 + Math.floor(Math.random() * 180),
    coverUrl: coverImages[i % coverImages.length],
    audioUrl: audioUrls[i % audioUrls.length],
  };
});

// Playlists
export const samplePlaylists: Playlist[] = [
  {
    id: "pl-1",
    name: "Chill Vibes",
    description: "Relaxing tracks for your peaceful moments",
    coverUrl: coverImages[1],
    tracks: sampleTracks.slice(0, 10),
  },
  {
    id: "pl-2",
    name: "Night Drive",
    description: "Perfect beats for late night adventures",
    coverUrl: coverImages[2],
    tracks: sampleTracks.slice(10, 20),
  },
  {
    id: "pl-3",
    name: "Focus Mode",
    description: "Concentrate and get things done",
    coverUrl: coverImages[3],
    tracks: sampleTracks.slice(20, 30),
  },
];
