import { Play, Pause, SkipBack, SkipForward, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Track } from "@/data/sampleTracks";
import { cn } from "@/lib/utils";

interface MiniPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onExpand: () => void;
  className?: string;
}

export function MiniPlayer({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onNext,
  onPrevious,
  onExpand,
  className,
}: MiniPlayerProps) {
  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "bg-card/95 backdrop-blur-xl border-t border-border/10 shadow-lg",
        "animate-slide-up",
        className
      )}
    >
      {/* Progress bar at top */}
      <div className="h-0.5 bg-secondary/50 w-full">
        <div
          className="h-full bg-primary transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3">
        {/* Album Art */}
        <button
          onClick={onExpand}
          className="relative shrink-0 group"
        >
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover shadow-md"
          />
          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ChevronUp className="h-5 w-5 text-white" />
          </div>
          {isPlaying && (
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex items-end gap-0.5">
              <div className="w-0.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <div className="w-0.5 h-2.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
              <div className="w-0.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            </div>
          )}
        </button>

        {/* Track Info */}
        <button
          onClick={onExpand}
          className="flex-1 min-w-0 text-left"
        >
          <p className="font-medium text-sm truncate">{currentTrack.title}</p>
          <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
        </button>

        {/* Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            className="h-9 w-9 text-foreground hidden xs:flex"
          >
            <SkipBack className="h-4 w-4 fill-current" />
          </Button>

          <Button
            onClick={onTogglePlay}
            className={cn(
              "h-10 w-10 sm:h-11 sm:w-11 rounded-full",
              "bg-foreground text-background",
              "hover:bg-foreground/90",
              "shadow-md"
            )}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
            ) : (
              <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            className="h-9 w-9 text-foreground"
          >
            <SkipForward className="h-4 w-4 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}
