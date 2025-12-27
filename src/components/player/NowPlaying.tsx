import { Track } from "@/data/sampleTracks";
import { AlbumArt } from "./AlbumArt";
import { PlaybackControls } from "./PlaybackControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";

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
    <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-lg mx-auto">
      {/* Album Art */}
      <div className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[360px] mb-6 lg:mb-8">
        <AlbumArt 
          track={currentTrack} 
          isPlaying={isPlaying}
          className="w-full"
        />
      </div>

      {/* Track Info */}
      <div className="text-center mb-4 lg:mb-6 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 truncate px-2">
          {currentTrack?.title || "No Track Selected"}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base truncate">
          {currentTrack?.artist || "Unknown Artist"}
        </p>
        <p className="text-muted-foreground/60 text-xs sm:text-sm mt-0.5 truncate">
          {currentTrack?.album}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full mb-6 lg:mb-8">
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

      {/* Volume Control - Hidden on mobile, shown on tablet+ */}
      <div className="mt-6 lg:mt-8 hidden sm:block">
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
