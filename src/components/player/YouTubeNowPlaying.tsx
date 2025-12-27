import YouTube from "react-youtube";
import { YouTubeTrack } from "@/data/youtubeTracks";
import { PlaybackControls } from "./PlaybackControls";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { cn } from "@/lib/utils";

interface YouTubeNowPlayingProps {
  currentTrack: YouTubeTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: "off" | "all" | "one";
  isLiked: boolean;
  onReady: (event: any) => void;
  onStateChange: (event: any) => void;
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

export function YouTubeNowPlaying({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffled,
  repeatMode,
  isLiked,
  onReady,
  onStateChange,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleLike,
}: YouTubeNowPlayingProps) {
  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
    },
  };

  if (!currentTrack) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No track selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-4 py-6 md:px-8 md:py-12 max-w-4xl mx-auto">
      {/* Video Player */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden album-shadow mb-6">
        <YouTube
          key={currentTrack.videoId}
          videoId={currentTrack.videoId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
          className="absolute inset-0"
          iframeClassName="w-full h-full"
        />
        
        {/* Click overlay to play/pause */}
        <div 
          className="absolute inset-0 cursor-pointer z-10"
          onClick={onTogglePlay}
        />
        
        {/* Play indicator */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/30 z-20 pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-primary/80 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="text-center mb-4">
        <h2 
          className={cn(
            "text-xl md:text-2xl font-bold mb-1",
            "animate-slide-up"
          )}
          key={currentTrack.id + "-title"}
        >
          {currentTrack.title}
        </h2>
        <p className="text-muted-foreground">
          {currentTrack.artist}
        </p>
        <p className="text-muted-foreground/60 text-sm">
          {currentTrack.album}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full mb-6">
        <ProgressBar
          currentTime={currentTime}
          duration={duration || currentTrack.duration}
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
      <div className="mt-6 flex justify-center">
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