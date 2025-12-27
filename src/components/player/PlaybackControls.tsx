import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlaybackControlsProps {
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: "off" | "all" | "one";
  isLiked: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleLike: () => void;
}

export function PlaybackControls({
  isPlaying,
  isShuffled,
  repeatMode,
  isLiked,
  onTogglePlay,
  onNext,
  onPrevious,
  onToggleShuffle,
  onToggleRepeat,
  onToggleLike,
}: PlaybackControlsProps) {
  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;

  return (
    <div className="flex items-center justify-center gap-1 xs:gap-2 sm:gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleLike}
        className={cn(
          "h-9 w-9 sm:h-10 sm:w-10 control-button",
          isLiked 
            ? "text-primary" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Heart 
          className={cn("h-4 w-4 sm:h-5 sm:w-5", isLiked && "fill-current")} 
        />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleShuffle}
        className={cn(
          "h-9 w-9 sm:h-10 sm:w-10 control-button",
          isShuffled 
            ? "text-primary" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Shuffle className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        className="h-10 w-10 sm:h-12 sm:w-12 text-foreground control-button"
      >
        <SkipBack className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
      </Button>

      <Button
        onClick={onTogglePlay}
        className={cn(
          "h-14 w-14 sm:h-16 sm:w-16 rounded-full",
          "bg-foreground text-background",
          "hover:bg-foreground/90 hover:scale-105",
          "active:scale-95 transition-all duration-200",
          "shadow-lg"
        )}
      >
        {isPlaying ? (
          <Pause className="h-6 w-6 sm:h-7 sm:w-7 fill-current" />
        ) : (
          <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current ml-0.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        className="h-10 w-10 sm:h-12 sm:w-12 text-foreground control-button"
      >
        <SkipForward className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleRepeat}
        className={cn(
          "h-9 w-9 sm:h-10 sm:w-10 control-button",
          repeatMode !== "off" 
            ? "text-primary" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <RepeatIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>

      {/* Hidden spacer for symmetry on larger screens */}
      <div className="hidden sm:block w-9 sm:w-10" />
    </div>
  );
}