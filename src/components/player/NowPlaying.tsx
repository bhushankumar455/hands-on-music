import { Track } from "@/data/sampleTracks";
import { AlbumArt } from "./AlbumArt";
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
    <div className="flex flex-col items-center justify-center h-full px-8 py-12 max-w-2xl mx-auto">
      {/* Album Art */}
      <AlbumArt 
        track={currentTrack} 
        isPlaying={isPlaying}
        className="w-full max-w-md mb-10"
      />

      {/* Track Info */}
      <div className="text-center mb-6 w-full">
        <h2 
          className={cn(
            "text-2xl md:text-3xl font-bold mb-2",
            "animate-slide-up"
          )}
          key={currentTrack?.id + "-title"}
        >
          {currentTrack?.title || "No Track Selected"}
        </h2>
        <p 
          className="text-muted-foreground text-lg"
          key={currentTrack?.id + "-artist"}
        >
          {currentTrack?.artist || "Unknown Artist"}
        </p>
        <p className="text-muted-foreground/60 text-sm mt-1">
          {currentTrack?.album}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full mb-8">
        <ProgressBar
          currentTime={currentTime}
          duration={duration || currentTrack?.duration || 0}
          onSeek={onSeek}
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
      <div className="mt-8">
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