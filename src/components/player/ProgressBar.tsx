import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs text-muted-foreground w-10 text-right font-mono">
        {formatTime(currentTime)}
      </span>
      <div className="flex-1 group">
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          onValueChange={(value) => {
            const newTime = (value[0] / 100) * duration;
            onSeek(newTime);
          }}
          className={cn(
            "cursor-pointer",
            "[&_[role=slider]]:h-3 [&_[role=slider]]:w-3",
            "[&_[role=slider]]:opacity-0 group-hover:[&_[role=slider]]:opacity-100",
            "[&_[role=slider]]:transition-opacity",
            "[&_[role=slider]]:bg-foreground",
            "[&_[role=slider]]:border-0",
            "[&_.relative]:h-1",
            "[&_.absolute]:bg-primary",
            "[&_.relative>span:first-child]:bg-muted"
          )}
        />
      </div>
      <span className="text-xs text-muted-foreground w-10 font-mono">
        {formatTime(duration)}
      </span>
    </div>
  );
}