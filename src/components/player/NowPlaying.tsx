import { useState } from "react";
import { Track } from "@/data/sampleTracks";
import { PlaybackControls } from "./PlaybackControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { AudioVisualizer, VisualizerTheme, VisualizerThemeSelector } from "./AudioVisualizer";
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
  const [visualizerTheme, setVisualizerTheme] = useState<VisualizerTheme>("bars");

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-4 sm:px-6 sm:py-6 md:py-8 max-w-md mx-auto">
      {/* Album Art with glow effect */}
      <div className="w-full max-w-[200px] xs:max-w-[240px] sm:max-w-[280px] md:max-w-[320px] mb-4 sm:mb-6 relative">
        <div className={cn(
          "aspect-square rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl",
          isPlaying && "player-glow"
        )}>
          <img 
            src={currentTrack?.coverUrl || "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400&h=400&fit=crop"} 
            alt={currentTrack?.title || "Album art"}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Audio Visualizer with Theme Selector */}
      <div className="w-full max-w-[220px] xs:max-w-[260px] sm:max-w-[300px] md:max-w-[320px] mb-4 sm:mb-6 relative">
        <div className="absolute -top-1 right-0 z-10">
          <VisualizerThemeSelector 
            currentTheme={visualizerTheme} 
            onThemeChange={setVisualizerTheme} 
          />
        </div>
        <AudioVisualizer 
          audioData={audioData} 
          isPlaying={isPlaying}
          theme={visualizerTheme}
        />
      </div>

      {/* Track Info */}
      <div className="text-center mb-4 sm:mb-5 w-full px-2">
        <h2 className="text-lg xs:text-xl sm:text-2xl font-bold mb-1 truncate" key={currentTrack?.id}>
          {currentTrack?.title || "No Track Selected"}
        </h2>
        <p className="text-muted-foreground text-sm truncate">
          {currentTrack?.artist || "Unknown Artist"}
        </p>
        {currentTrack?.album && (
          <p className="text-muted-foreground/60 text-xs mt-0.5 truncate">
            {currentTrack.album}
          </p>
        )}
      </div>

      {/* Progress */}
      <div className="w-full max-w-sm mb-4 sm:mb-6 px-2">
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

      {/* Volume - Tablet and Desktop only */}
      <div className="mt-6 sm:mt-8 hidden sm:block">
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
