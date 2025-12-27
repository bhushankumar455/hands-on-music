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
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleLike}
        className={cn(
          "h-10 w-10 control-button",
          isLiked 
            ? "text-primary" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Heart 
          className={cn("h-5 w-5", isLiked && "fill-current")} 
        />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleShuffle}
        className={cn(
          "h-10 w-10 control-button",
          isShuffled 
            ? "text-primary" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Shuffle className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        className="h-12 w-12 text-foreground control-button"
      >
        <SkipBack className="h-6 w-6 fill-current" />
      </Button>

      <Button
        onClick={onTogglePlay}
        className={cn(
          "h-16 w-16 rounded-full",
          "bg-foreground text-background",
          "hover:bg-foreground/90 hover:scale-105",
          "active:scale-95 transition-all duration-200",
          "shadow-lg"
        )}
      >
        {isPlaying ? (
          <Pause className="h-7 w-7 fill-current" />
        ) : (
          <Play className="h-7 w-7 fill-current ml-1" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        className="h-12 w-12 text-foreground control-button"
      >
        <SkipForward className="h-6 w-6 fill-current" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleRepeat}
        className={cn(
          "h-10 w-10 control-button",
          repeatMode !== "off" 
            ? "text-primary" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <RepeatIcon className="h-5 w-5" />
      </Button>

      <div className="w-10" /> {/* Spacer for symmetry */}
    </div>
  );
}