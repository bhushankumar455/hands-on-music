import { SpotifyTrack } from "@/data/spotifyTracks";
import { PlaybackControls } from "./PlaybackControls";
import { VolumeControl } from "./VolumeControl";
import { cn } from "@/lib/utils";
import { Music2 } from "lucide-react";

interface SpotifyNowPlayingProps {
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: "off" | "all" | "one";
  isLiked: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleLike: () => void;
}

export function SpotifyNowPlaying({
  currentTrack,
  isPlaying,
  volume,
  isMuted,
  isShuffled,
  repeatMode,
  isLiked,
  onTogglePlay,
  onNext,
  onPrevious,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleLike,
}: SpotifyNowPlayingProps) {
  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Music2 className="h-16 w-16 text-muted-foreground/50" />
        <p className="text-muted-foreground">Select a track to play</p>
      </div>
    );
  }

  // Spotify Embed URL
  const embedUrl = `https://open.spotify.com/embed/track/${currentTrack.spotifyUri}?utm_source=generator&theme=0`;

  return (
    <div className="flex flex-col h-full px-4 py-6 md:px-8 md:py-12 max-w-4xl mx-auto">
      {/* Album Art with Glow Effect */}
      <div className="relative mx-auto mb-8 w-full max-w-md">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75" />
        <div className="relative aspect-square rounded-2xl overflow-hidden album-shadow">
          <img 
            src={currentTrack.coverUrl} 
            alt={currentTrack.album}
            className={cn(
              "w-full h-full object-cover transition-transform duration-700",
              isPlaying && "scale-105"
            )}
          />
          
          {/* Vinyl effect */}
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-16 h-16 rounded-full bg-background/80 backdrop-blur" />
              <div className="absolute w-8 h-8 rounded-full bg-foreground/20" />
            </div>
          )}
        </div>
      </div>

      {/* Track Info */}
      <div className="text-center mb-6">
        <h2 
          className="text-xl md:text-2xl font-bold mb-1 animate-slide-up"
          key={currentTrack.id + "-title"}
        >
          {currentTrack.title}
        </h2>
        <p className="text-muted-foreground text-lg">
          {currentTrack.artist}
        </p>
        <p className="text-muted-foreground/60 text-sm">
          {currentTrack.album}
        </p>
      </div>

      {/* Spotify Embed Player (Hidden for audio) */}
      <div className="w-full h-20 rounded-xl overflow-hidden mb-6 bg-card/50">
        <iframe
          src={embedUrl}
          width="100%"
          height="80"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl"
        />
      </div>

      {/* Playback Controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        isShuffled={isShuffled}
        repeatMode={repeatMode}
        isLiked={isLiked}
        onTogglePlay={onTogglePlay}
        onNext={onNext}
        onPrevious={onPrevious}
        onToggleShuffle={onToggleShuffle}
        onToggleRepeat={onToggleRepeat}
        onToggleLike={onToggleLike}
      />

      {/* Volume Control */}
      <div className="mt-6 flex justify-center">
        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={onVolumeChange}
          onToggleMute={onToggleMute}
        />
      </div>

      {/* Spotify Branding */}
      <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground/60">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
        <span className="text-xs">Powered by Spotify</span>
      </div>
    </div>
  );
}
