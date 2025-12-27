import { Track } from "@/data/sampleTracks";
import { PlaybackControls } from "./PlaybackControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { cn } from "@/lib/utils";

interface NowPlayingProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: "off" | "all" | "one";
  isLiked: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleLike: () => void;
}

export function NowPlaying({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffled,
  repeatMode,
  isLiked,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleLike,
}: NowPlayingProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 max-w-md mx-auto">
      {/* Album Art */}
      <div className="w-full max-w-[260px] sm:max-w-[300px] mb-8 relative">
        <div className={cn(
          "aspect-square rounded-3xl overflow-hidden album-shadow",
          isPlaying && "player-glow"
        )}>
          <img 
            src={currentTrack?.coverUrl || "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&h=400&fit=crop"} 
            alt={currentTrack?.title || "Album art"}
            className={cn(
              "w-full h-full object-cover transition-transform duration-[20000ms] ease-linear",
              isPlaying && "animate-spin-album"
            )}
          />
        </div>
        
        {/* Vinyl hole effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/90 shadow-inner pointer-events-none" />
      </div>

      {/* Track Info */}
      <div className="text-center mb-6 w-full">
        <h2 className="text-xl sm:text-2xl font-bold mb-1 truncate animate-fade-in" key={currentTrack?.id}>
          {currentTrack?.title || "No Track Selected"}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base truncate">
          {currentTrack?.artist || "Unknown Artist"}
        </p>
        <p className="text-muted-foreground/50 text-xs mt-0.5 truncate">
          {currentTrack?.album}
        </p>
      </div>

      {/* Progress */}
      <div className="w-full mb-6">
        <ProgressBar
          currentTime={currentTime}
          duration={duration || currentTrack?.duration || 0}
          onSeek={onSeek}
        />
      </div>

      {/* Controls */}
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

      {/* Volume - Desktop only */}
      <div className="mt-8 hidden sm:block">
        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={onVolumeChange}
          onToggleMute={onToggleMute}
        />
      </div>
    </div>
  );
}
