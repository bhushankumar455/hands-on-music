export interface YouTubeTrack {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: number;
}

export interface YouTubePlaylist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  tracks: YouTubeTrack[];
}

// Popular Hindi and Hollywood songs with YouTube video IDs
export const youtubeTracksHindi: YouTubeTrack[] = [
  {
    id: "h1",
    videoId: "JF8BRvqGCNs",
    title: "Kesariya",
    artist: "Arijit Singh",
    album: "Brahmastra",
    coverUrl: "https://i.ytimg.com/vi/JF8BRvqGCNs/maxresdefault.jpg",
    duration: 268,
  },
  {
    id: "h2",
    videoId: "vGJTaP6anOU",
    title: "Tere Hawaale",
    artist: "Arijit Singh & Shilpa Rao",
    album: "Laal Singh Chaddha",
    coverUrl: "https://i.ytimg.com/vi/vGJTaP6anOU/maxresdefault.jpg",
    duration: 324,
  },
  {
    id: "h3",
    videoId: "BddP6PYo2gs",
    title: "Tera Ban Jaunga",
    artist: "Akhil Sachdeva & Tulsi Kumar",
    album: "Kabir Singh",
    coverUrl: "https://i.ytimg.com/vi/BddP6PYo2gs/maxresdefault.jpg",
    duration: 232,
  },
  {
    id: "h4",
    videoId: "hoNb6HuNmU0",
    title: "Raataan Lambiyan",
    artist: "Jubin Nautiyal & Asees Kaur",
    album: "Shershaah",
    coverUrl: "https://i.ytimg.com/vi/hoNb6HuNmU0/maxresdefault.jpg",
    duration: 264,
  },
  {
    id: "h5",
    videoId: "ElxkM2rwO5E",
    title: "Apna Bana Le",
    artist: "Arijit Singh",
    album: "Bhediya",
    coverUrl: "https://i.ytimg.com/vi/ElxkM2rwO5E/maxresdefault.jpg",
    duration: 284,
  },
  {
    id: "h6",
    videoId: "WGbZl-WZ6hk",
    title: "O Maahi",
    artist: "Arijit Singh",
    album: "Dunki",
    coverUrl: "https://i.ytimg.com/vi/WGbZl-WZ6hk/maxresdefault.jpg",
    duration: 298,
  },
];

export const youtubeTracksHollywood: YouTubeTrack[] = [
  {
    id: "e1",
    videoId: "JGwWNGJdvx8",
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    coverUrl: "https://i.ytimg.com/vi/JGwWNGJdvx8/maxresdefault.jpg",
    duration: 234,
  },
  {
    id: "e2",
    videoId: "kJQP7kiw5Fk",
    title: "Despacito",
    artist: "Luis Fonsi ft. Daddy Yankee",
    album: "Vida",
    coverUrl: "https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
    duration: 282,
  },
  {
    id: "e3",
    videoId: "RgKAFK5djSk",
    title: "See You Again",
    artist: "Wiz Khalifa ft. Charlie Puth",
    album: "Furious 7 Soundtrack",
    coverUrl: "https://i.ytimg.com/vi/RgKAFK5djSk/maxresdefault.jpg",
    duration: 237,
  },
  {
    id: "e4",
    videoId: "fRh_vgS2dFE",
    title: "Sorry",
    artist: "Justin Bieber",
    album: "Purpose",
    coverUrl: "https://i.ytimg.com/vi/fRh_vgS2dFE/maxresdefault.jpg",
    duration: 201,
  },
  {
    id: "e5",
    videoId: "09R8_2nJtjg",
    title: "Sugar",
    artist: "Maroon 5",
    album: "V",
    coverUrl: "https://i.ytimg.com/vi/09R8_2nJtjg/maxresdefault.jpg",
    duration: 235,
  },
  {
    id: "e6",
    videoId: "OPf0YbXqDm0",
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars",
    album: "Uptown Special",
    coverUrl: "https://i.ytimg.com/vi/OPf0YbXqDm0/maxresdefault.jpg",
    duration: 270,
  },
];

export const allYouTubeTracks = [...youtubeTracksHindi, ...youtubeTracksHollywood];

export const youtubePlaylistsData: YouTubePlaylist[] = [
  {
    id: "ypl-1",
    name: "Hindi Hits",
    description: "Top Bollywood songs",
    coverUrl: "https://i.ytimg.com/vi/JF8BRvqGCNs/maxresdefault.jpg",
    tracks: youtubeTracksHindi,
  },
  {
    id: "ypl-2",
    name: "Hollywood Hits",
    description: "Top English songs",
    coverUrl: "https://i.ytimg.com/vi/JGwWNGJdvx8/maxresdefault.jpg",
    tracks: youtubeTracksHollywood,
  },
  {
    id: "ypl-3",
    name: "All Songs",
    description: "Hindi & Hollywood mix",
    coverUrl: "https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
    tracks: allYouTubeTracks,
  },
];