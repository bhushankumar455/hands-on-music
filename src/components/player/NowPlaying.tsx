import { Track } from "@/data/sampleTracks";
import { PlaybackControls } from "./PlaybackControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { AudioEqualizer } from "./AudioEqualizer";
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
  audioData?: number[];
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
  audioData = [],
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
    <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6 py-4 sm:py-8 max-w-lg mx-auto">
      {/* Album Art with glow effect */}
      <div className="w-full max-w-[260px] sm:max-w-[320px] mb-6 relative">
        <div className={cn(
          "aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl",
          isPlaying && "player-glow"
        )}>
          <img 
            src={currentTrack?.coverUrl || "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&h=400&fit=crop"} 
            alt={currentTrack?.title || "Album art"}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Audio Equalizer */}
      <div className="w-full max-w-[280px] sm:max-w-[320px] mb-6">
        <AudioEqualizer 
          audioData={audioData} 
          isPlaying={isPlaying} 
        />
      </div>

      {/* Track Info */}
      <div className="text-center mb-5 w-full max-w-sm">
        <h2 className="text-xl sm:text-2xl font-bold mb-1.5 truncate" key={currentTrack?.id}>
          {currentTrack?.title || "No Track Selected"}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base truncate">
          {currentTrack?.artist || "Unknown Artist"}
        </p>
        {currentTrack?.album && (
          <p className="text-muted-foreground/60 text-xs mt-1 truncate">
            {currentTrack.album}
          </p>
        )}
      </div>

      {/* Progress */}
      <div className="w-full max-w-sm mb-6">
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
